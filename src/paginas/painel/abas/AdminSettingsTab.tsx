import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  RefreshCcw,
  KeyRound,
  AlertTriangle,
  Copy,
  Check,
  Megaphone,
  Code2,
  X,
  FileJson,
  Construction,
  CheckCircle2,
} from "lucide-react";
import { useData } from "@/compartilhado/hooks/useData";
import { useSound } from "@/compartilhado/hooks/useSound";
import { generateSecure10DigitToken, hashPassword, validateUpload } from "@/seguranca";
import {
  AREAS_EM_DESENVOLVIMENTO,
  areaEstaPronta,
  mudarSituacao,
  type AreaQuePodeEstarEmDesenvolvimento,
} from "@/compartilhado/dados/areas-em-desenvolvimento";

function SituacaoDaArea({
  area,
  pronta,
  aoMudar,
}: {
  area: AreaQuePodeEstarEmDesenvolvimento;
  pronta: boolean;
  aoMudar: (pronta: boolean) => void;
}) {
  const opcoes = [
    { pronta: false, rotulo: "Em desenvolvimento", Icone: Construction },
    { pronta: true, rotulo: area.rotuloPronta, Icone: CheckCircle2 },
  ];

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
          {area.nome}
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
              pronta
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300"
            }`}
          >
            {pronta ? area.rotuloPronta : "Em desenvolvimento"}
          </span>
        </p>
        <p className="mt-1 text-[11px] leading-snug text-stone-400">{area.onde}</p>
      </div>

      <div
        role="radiogroup"
        aria-label={`Situação: ${area.nome}`}
        className="flex shrink-0 gap-1 rounded-xl border border-white/10 bg-black/40 p-1"
      >
        {opcoes.map(({ pronta: valor, rotulo, Icone }) => {
          const marcado = pronta === valor;
          return (
            <button
              key={rotulo}
              type="button"
              role="radio"
              aria-checked={marcado}
              onClick={() => !marcado && aoMudar(valor)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                marcado
                  ? valor
                    ? "bg-emerald-500 text-stone-950"
                    : "bg-amber-400 text-stone-950"
                  : "text-stone-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icone className="h-3.5 w-3.5" />
              {rotulo}
            </button>
          );
        })}
      </div>
    </li>
  );
}

export function AdminSettingsTab() {
  const {
    siteConfig,
    updateSiteConfig,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetAllToFactory,
  } = useData();
  const { playSound } = useSound();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatedTokenDisplay, setGeneratedTokenDisplay] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  const [customToken, setCustomToken] = useState("");
  const [tokenMsg, setTokenMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [announcementText, setAnnouncementText] = useState(
    siteConfig.announcementText || "Novas inscrições abertas para o Clube de Ciências!"
  );
  const [announcementActive, setAnnouncementActive] = useState(
    siteConfig.announcementActive || false
  );
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    setAnnouncementText(
      siteConfig.announcementText || "Novas inscrições abertas para o Clube de Ciências!"
    );
    setAnnouncementActive(siteConfig.announcementActive || false);
  }, [siteConfig.announcementText, siteConfig.announcementActive]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    playSound("pop-bubble");
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleGenerateRandomToken = async () => {
    playSound("pop-bubble");
    const newToken = generateSecure10DigitToken();
    const newHash = await hashPassword(newToken);

    updateSiteConfig({ masterTokenHash: newHash });

    setGeneratedTokenDisplay(newToken);
    navigator.clipboard.writeText(newToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);

    setTokenMsg({
      type: "success",
      text: "Novo token de 10 caracteres gerado, protegido com PBKDF2-SHA-256 (600 mil iterações) e copiado!",
    });
  };

  const handleSaveCustomToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customToken.replace(/[^a-zA-Z0-9]/g, "").trim();

    if (clean.length !== 10) {
      setTokenMsg({
        type: "error",
        text: `O token deve conter exatamente 10 letras ou números (atualmente tem ${clean.length}).`,
      });
      return;
    }

    playSound("pop-bubble");
    const newHash = await hashPassword(clean);
    updateSiteConfig({ masterTokenHash: newHash });

    setGeneratedTokenDisplay(clean);
    setCustomToken("");
    setTokenMsg({
      type: "success",
      text: "Token Mestre protegido com PBKDF2-SHA-256 e salvo com sucesso!",
    });
    setTimeout(() => setTokenMsg(null), 4000);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    playSound("pop-bubble");
    updateSiteConfig({
      announcementText,
      announcementActive,
    });
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  const handleExport = () => {
    playSound("pop-bubble");
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `ceclos_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const jsonStr = exportDatabaseJSON();
    navigator.clipboard.writeText(jsonStr);
    playSound("pop-bubble");
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateUpload(file, "json");
    if (!check.ok) {
      setImportStatus(check.error || "Arquivo rejeitado.");
      setTimeout(() => setImportStatus(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJSON(content);
        if (success) {
          playSound("pop-bubble");
          setImportStatus("Banco de dados restaurado com sucesso.");
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus("Erro ao processar o arquivo JSON.");
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFactoryReset = () => {
    if (
      confirm(
        "ATENÇÃO: Deseja redefinir os dados para a configuração original de fábrica? Todas as modificações locais serão redefinidas."
      )
    ) {
      playSound("subtle-click");
      resetAllToFactory();
      alert("Configuração restaurada com sucesso.");
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#121216] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Construction className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Áreas em desenvolvimento</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Quando uma área ficar pronta, troque a situação aqui. Dá para voltar para “Em
              desenvolvimento” a qualquer momento.
            </p>
          </div>
        </div>
        <ul className="space-y-2.5">
          {AREAS_EM_DESENVOLVIMENTO.map((area) => (
            <SituacaoDaArea
              key={area.id}
              area={area}
              pronta={areaEstaPronta(siteConfig, area)}
              aoMudar={(pronta) => {
                playSound(pronta ? "pop-bubble" : "subtle-click");
                updateSiteConfig(mudarSituacao(area, pronta));
              }}
            />
          ))}
        </ul>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#121216] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Token Mestre de Acesso (10 Dígitos)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  PBKDF2
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                O token puro nunca é armazenado em texto plano. Apenas o hash criptográfico é
                verificado.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>HASH ATIVO</span>
            <span className="text-emerald-400">Verificação Ativa</span>
          </div>
          <div className="font-mono text-xs text-stone-400 truncate select-all">
            {siteConfig.masterTokenHash || "Nenhum token configurado"}
          </div>
        </div>

        {generatedTokenDisplay && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-amber-400/30 bg-amber-400/10 space-y-2"
          >
            <div className="text-[11px] font-semibold text-amber-300">
              Novo token de 10 dígitos gerado (copie e guarde em local seguro):
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xl font-bold text-white tracking-widest">
                {generatedTokenDisplay}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(generatedTokenDisplay)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedToken ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar Token</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-white">Gerar Token Aleatório</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Gera um novo código seguro de 10 dígitos usando a Web Crypto API.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateRandomToken}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white border border-white/[0.08] transition-colors cursor-pointer"
            >
              <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Gerar Novo Token</span>
            </button>
          </div>

          <form
            onSubmit={handleSaveCustomToken}
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between space-y-3"
          >
            <div>
              <h4 className="text-xs font-bold text-white">Definir Token Manual</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Digite exatamente 10 caracteres alfanuméricos para salvar.
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                maxLength={10}
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                placeholder="Ex: 8492017354"
                className="w-full px-3 py-1.5 rounded-lg border border-white/[0.08] bg-[#0E0E12] font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={customToken.length !== 10}
                className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Salvar Token ({customToken.length}/10)
              </button>
            </div>
          </form>
        </div>

        {tokenMsg && (
          <p
            className={`text-xs font-medium ${
              tokenMsg.type === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {tokenMsg.text}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#121216] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Megaphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Faixa de Aviso Global</h3>
            <p className="text-[11px] text-stone-400">
              Banner no cabeçalho do site para avisos de eventos e prazos.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="announcementActive"
              checked={announcementActive}
              onChange={(e) => {
                const nextVal = e.target.checked;
                setAnnouncementActive(nextVal);
                updateSiteConfig({ announcementActive: nextVal });
                playSound("subtle-click");
                setAnnouncementSaved(true);
                setTimeout(() => setAnnouncementSaved(false), 2000);
              }}
              className="h-4 w-4 rounded accent-amber-400 cursor-pointer"
            />
            <label
              htmlFor="announcementActive"
              className="font-medium text-stone-200 cursor-pointer select-none"
            >
              Exibir faixa de comunicado público no topo do site
            </label>
          </div>

          <div>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              onBlur={() => {
                updateSiteConfig({ announcementText, announcementActive });
              }}
              className="w-full px-3 py-2 rounded-xl border border-white/[0.08] bg-[#0E0E12] text-xs text-white focus:border-amber-400 focus:outline-none"
              placeholder="Ex: Inscrições abertas para a FECIBA 2026!"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all cursor-pointer"
            >
              Salvar Comunicado
            </button>

            {announcementSaved && (
              <span className="text-xs font-semibold text-emerald-400">
                ✓ Comunicado salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#121216] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Download className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Backup & Exportação do Banco</h3>
            <p className="text-[11px] text-stone-400">
              Exporte todos os membros, projetos e parceiros em formato JSON.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Baixar Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowJsonInspector(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
          >
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Inspecionar JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-stone-200 transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-400" />
            <span>Restaurar Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {importStatus && <p className="text-xs font-medium text-amber-300">{importStatus}</p>}
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-rose-500/20 bg-rose-950/10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-300">Redefinição para Padrão de Fábrica</h3>
            <p className="text-[11px] text-stone-400">
              Restaura a base de dados para o estado inicial padrão do CECLOS.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFactoryReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-300 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span>Restaurar Base Padrão</span>
        </button>
      </div>

      <AnimatePresence>
        {showJsonInspector && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowJsonInspector(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-white/[0.12] bg-[#141419] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-amber-400" />
                  <span>Inspetor de Dados JSON</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowJsonInspector(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto rounded-xl bg-[#0E0E12] p-3.5 border border-white/[0.06] font-mono text-[11px] text-stone-300">
                <pre>{exportDatabaseJSON()}</pre>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-semibold cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Tudo</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
