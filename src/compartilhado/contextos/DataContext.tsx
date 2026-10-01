import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { DataContext, DEFAULT_CONFIG, type SiteConfig } from "./data-context";
import { MEMBERS, MENTORS } from "@/compartilhado/dados/members.data";
import { PARTNERS } from "@/compartilhado/dados/partners.data";
import type { Member } from "@/compartilhado/tipos/member.types";
import type { Partner } from "@/compartilhado/tipos/partner.types";
import { loadMembers } from "@/compartilhado/utils/member-migration";
import { migrarCaminhos } from "@/compartilhado/utils/caminhos-publicos";
import {
  CHAVES_DE_REMOVIDOS,
  lerRemovidos,
  limparRemovidos,
  marcarComoRemovido,
  desmarcarComoRemovido,
} from "@/compartilhado/utils/removidos";
import {
  validateImportPayload,
  sanitizeMember,
  sanitizePartner,
  sanitizeConfig,
} from "@/seguranca";

const STORAGE_KEYS = {
  MEMBERS: "ceclos_data_members_v1",
  MENTORS: "ceclos_data_mentors_v1",
  PARTNERS: "ceclos_data_partners_v1",
  OVERRIDES: "ceclos_admin_overrides_v1",
  PROJECTS: "ceclos_student_projects_v5",
  ACCOUNTS: "ceclos_student_accounts_v8",
};

const CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as readonly string[];

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() =>
    loadMembers(STORAGE_KEYS.MEMBERS, MEMBERS, CHAVES_DE_REMOVIDOS.MEMBROS)
  );

  const [mentors, setMentors] = useState<Member[]>(() =>
    loadMembers(STORAGE_KEYS.MENTORS, MENTORS, CHAVES_DE_REMOVIDOS.MENTORES)
  );

  const [partners, setPartners] = useState<Partner[]>(() => {
    try {
      const removidos = lerRemovidos(CHAVES_DE_REMOVIDOS.PARCEIROS);
      const saved = localStorage.getItem(STORAGE_KEYS.PARTNERS);
      if (saved) {
        let parsed: Partner[] = migrarCaminhos(JSON.parse(saved));
        parsed = parsed.filter((p) => p.id !== "feciba");
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = PARTNERS.filter((p) => !existingIds.has(p.id) && !removidos.has(p.id));
        return [...parsed, ...missing];
      }
      return PARTNERS.filter((p) => !removidos.has(p.id));
    } catch {
      return PARTNERS;
    }
  });

  const [erroDeSalvamento, setErroDeSalvamento] = useState<string | null>(null);

  const [adminOverrides, setAdminOverrides] = useState<Partial<SiteConfig>>(() => {
    try {
      localStorage.removeItem("ceclos_data_config_v2");
      localStorage.removeItem("ceclos_data_config");
      const saved = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      if (saved) {
        return migrarCaminhos(JSON.parse(saved));
      }
      return {};
    } catch {
      return {};
    }
  });

  const siteConfig = useMemo<SiteConfig>(() => {
    return {
      ...DEFAULT_CONFIG,
      ...adminOverrides,
    };
  }, [adminOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error("Failed to save members to localStorage:", e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(mentors));
    } catch (e) {
      console.error("Failed to save mentors to localStorage:", e);
    }
  }, [mentors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
    } catch (e) {
      console.error("Failed to save partners to localStorage:", e);
    }
  }, [partners]);

  const addMember = useCallback((memberData: Omit<Member, "id">) => {
    const newId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMember = { ...sanitizeMember(memberData), id: newId } as Member;

    desmarcarComoRemovido(CHAVES_DE_REMOVIDOS.MEMBROS, newId);
    desmarcarComoRemovido(CHAVES_DE_REMOVIDOS.MENTORES, newId);

    setMembers((prev) => [newMember, ...prev]);

    if (newMember.category === "lideranca") {
      setMentors((prev) => [newMember, ...prev]);
    }
  }, []);

  const updateMember = useCallback(
    (id: string, raw: Partial<Member>) => {
      const updated = sanitizeMember(raw) as Partial<Member>;
      const merged = (() => {
        const current = members.find((m) => m.id === id);
        return current ? { ...current, ...updated } : undefined;
      })();

      setMembers((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));

      setMentors((prev) => {
        if (!merged) {
          return prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
        }
        if (merged.category !== "lideranca") {
          return prev.filter((item) => item.id !== id);
        }
        return prev.some((item) => item.id === id)
          ? prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
          : [merged, ...prev];
      });
    },
    [members]
  );

  const deleteMember = useCallback((id: string) => {
    marcarComoRemovido(CHAVES_DE_REMOVIDOS.MEMBROS, id);
    marcarComoRemovido(CHAVES_DE_REMOVIDOS.MENTORES, id);

    setMembers((prev) => prev.filter((item) => item.id !== id));

    setMentors((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetMembers = useCallback(() => {
    limparRemovidos(CHAVES_DE_REMOVIDOS.MEMBROS);
    limparRemovidos(CHAVES_DE_REMOVIDOS.MENTORES);
    setMembers(MEMBERS);
    setMentors(MENTORS);
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(MEMBERS));
      localStorage.setItem(STORAGE_KEYS.MENTORS, JSON.stringify(MENTORS));
    } catch {}
  }, []);

  const reorderMembers = useCallback((newMembers: Member[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(newMembers));
    } catch (e) {
      console.error("Erro ao reordenar membros:", e);
    }
  }, []);

  const moveMember = useCallback((fromIndex: number, toIndex: number) => {
    setMembers((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  }, []);

  const renumberMembers = useCallback(() => {
    setMembers((prev) => {
      const next = prev.map((item, idx) => ({
        ...item,
        num: String(idx + 1).padStart(2, "0"),
      }));
      return next;
    });
  }, []);

  const addPartner = useCallback((partnerData: Omit<Partner, "id">) => {
    const newId = `partner-${Date.now()}`;
    const newPartner = { ...sanitizePartner(partnerData), id: newId } as Partner;
    desmarcarComoRemovido(CHAVES_DE_REMOVIDOS.PARCEIROS, newId);
    setPartners((prev) => [...prev, newPartner]);
  }, []);

  const updatePartner = useCallback((id: string, raw: Partial<Partner>) => {
    const updated = sanitizePartner(raw) as Partial<Partner>;
    setPartners((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  }, []);

  const deletePartner = useCallback((id: string) => {
    marcarComoRemovido(CHAVES_DE_REMOVIDOS.PARCEIROS, id);
    setPartners((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const resetPartners = useCallback(() => {
    limparRemovidos(CHAVES_DE_REMOVIDOS.PARCEIROS);
    setPartners(PARTNERS);
    try {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(PARTNERS));
    } catch {}
  }, []);

  const updateSiteConfig = useCallback((updated: Partial<SiteConfig>) => {
    const safe = sanitizeConfig(updated, CONFIG_KEYS) as Partial<SiteConfig>;
    setAdminOverrides((prev) => {
      const next = { ...prev } as Record<string, unknown>;
      const padroes = DEFAULT_CONFIG as Record<string, unknown>;
      for (const [chave, valor] of Object.entries(safe)) {
        if (valor === undefined || valor === "" || valor === padroes[chave]) {
          delete next[chave];
        } else {
          next[chave] = valor;
        }
      }
      try {
        localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(next));
        setErroDeSalvamento(null);
      } catch (e) {
        const cheio =
          e instanceof DOMException &&
          (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED");
        setErroDeSalvamento(
          cheio
            ? "O armazenamento do navegador encheu. Isso costuma acontecer quando uma imagem é colada direto num campo de texto — prefira o caminho do arquivo (ex.: /Victor.jpeg). As últimas alterações NÃO foram guardadas."
            : "O navegador recusou a gravação. Se você está numa janela anônima, as alterações não serão guardadas ao fechar."
        );
        console.error("Failed to save overrides to localStorage:", e);
      }
      return next as Partial<SiteConfig>;
    });
  }, []);

  const exportDatabaseJSON = useCallback(() => {
    let studentProjects = [];
    try {
      const sp = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (sp) studentProjects = JSON.parse(sp);
    } catch {}

    let studentAccounts = [];
    try {
      const sa = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (sa) studentAccounts = JSON.parse(sa);
    } catch {}

    const { masterTokenHash: _hash, adminPassword: _pwd, ...safeConfig } = siteConfig;

    const backupData = {
      version: "3.0",
      exportDate: new Date().toISOString(),
      siteConfig: safeConfig,
      members,
      mentors,
      partners,
      projects: studentProjects,
      studentAccounts,
    };
    return JSON.stringify(backupData, null, 2);
  }, [siteConfig, members, mentors, partners]);

  const importDatabaseJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const payload = validateImportPayload(migrarCaminhos(JSON.parse(jsonString)), CONFIG_KEYS);
        if (!payload) return false;
        const data = payload;

        if (data.members) {
          setMembers(data.members as Member[]);
        }
        if (data.mentors) {
          setMentors(data.mentors as Member[]);
        }
        if (data.partners) {
          setPartners(data.partners as Partner[]);
        }
        if (data.siteConfig) {
          updateSiteConfig(data.siteConfig);
        }
        if (data.projects) {
          try {
            localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
            window.dispatchEvent(new Event("ceclos_projects_updated"));
          } catch (e) {
            console.error("Failed to restore projects:", e);
          }
        }
        if (data.studentAccounts) {
          try {
            localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.studentAccounts));
            window.dispatchEvent(new Event("ceclos_tokens_updated"));
          } catch (e) {
            console.error("Failed to restore student accounts:", e);
          }
        }
        return true;
      } catch (e) {
        console.error("Failed to import database JSON:", e);
        return false;
      }
    },
    [updateSiteConfig]
  );

  const resetAllToFactory = useCallback(() => {
    setMembers(MEMBERS);
    setMentors(MENTORS);
    setPartners(PARTNERS);
    setAdminOverrides({});
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.MENTORS);
    localStorage.removeItem(STORAGE_KEYS.PARTNERS);
    localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
    localStorage.removeItem("ceclos_data_config_v2");
    localStorage.removeItem("ceclos_data_config");
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    limparRemovidos(CHAVES_DE_REMOVIDOS.MEMBROS);
    limparRemovidos(CHAVES_DE_REMOVIDOS.MENTORES);
    limparRemovidos(CHAVES_DE_REMOVIDOS.PARCEIROS);
    window.dispatchEvent(new Event("ceclos_projects_updated"));
    window.dispatchEvent(new Event("ceclos_tokens_updated"));
  }, []);

  const value = useMemo(
    () => ({
      members,
      mentors,
      partners,
      siteConfig,
      addMember,
      updateMember,
      deleteMember,
      resetMembers,
      reorderMembers,
      moveMember,
      renumberMembers,
      addPartner,
      updatePartner,
      deletePartner,
      resetPartners,
      updateSiteConfig,
      erroDeSalvamento,
      exportDatabaseJSON,
      importDatabaseJSON,
      resetAllToFactory,
    }),
    [
      members,
      mentors,
      partners,
      siteConfig,
      addMember,
      updateMember,
      deleteMember,
      resetMembers,
      reorderMembers,
      moveMember,
      renumberMembers,
      addPartner,
      updatePartner,
      deletePartner,
      resetPartners,
      updateSiteConfig,
      erroDeSalvamento,
      exportDatabaseJSON,
      importDatabaseJSON,
      resetAllToFactory,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
