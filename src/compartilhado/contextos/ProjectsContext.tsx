import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  StudentProject,
  StudentUser,
  ProjectFeedback,
  ProjectStatus,
} from "@/compartilhado/tipos/project.types";
import { MEMBERS } from "@/compartilhado/dados/members.data";
import { ProjectsContext, PROJECTS_STORAGE_KEY } from "./projects-context";
import { migrarCaminhos } from "@/compartilhado/utils/caminhos-publicos";

function enrichProjectWithImage(proj: StudentProject): StudentProject {
  const member = MEMBERS.find(
    (m) =>
      m.id === proj.studentId ||
      m.name.toLowerCase().trim() === proj.studentName.toLowerCase().trim()
  );

  const studentGrade = proj.studentGrade || "Ensino Médio";

  const studentImage = proj.studentImage || member?.image || "";

  const studentRole = proj.studentRole || member?.role || "Jovem Cientista";

  return {
    ...proj,
    studentImage,
    studentGrade,
    studentRole,
  };
}

const INITIAL_PROJECTS: StudentProject[] = [
  {
    id: "proj-1",
    studentId: "isaque",
    studentName: "Isaque Santos Bomfim",
    studentGrade: "3º Ano - Ensino Médio",
    studentRole: "Criador do Projeto & Desenvolvedor Web",
    studentImage: "/membros/Isaque.jpg",
    studentEmail: "isaque.dev@ceclos.ba.gov.br",
    title: "Estação Meteorológica IoT para o Território do Sisal",
    emoji: "📡",
    coverGradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    pillar: "tecnologia",
    status: "featured",
    summary:
      "Construção de uma estação meteorológica autônoma com microcontroladores ESP32, telemetria em tempo real e sensores para monitorar o microclima e índices pluviométricos no semiárido.",
    content: `# Introdução ao Projeto

A região do Semiárido Baiano apresenta desafios climáticos singulares. O objetivo desta pesquisa aplicada é construir uma estação de baixo custo utilizando prototipagem eletrônica e conectividade em nuvem.

## Objetivos Específicos
- Desenvolver o hardware com placas ESP32 e sensores DHT22 / BMP280.
- Programar o firmware em C++ / Arduino Framework.
- Criar um dashboard web interativo para os agricultores e a comunidade escolar acompanharem índices pluviométricos.

## Diário de Bordo & Testes
- **Semana 1:** Calibração dos sensores e montagem do protótipo em protoboard.
- **Semana 2:** Teste de envio de pacotes via MQTT. Latência média de 120ms.
- **Semana 3:** Instalação preliminar no telhado do laboratório CECLOS.`,
    methodology: {
      problemStatement:
        "Como democratizar o acesso a dados micrometeorológicos em tempo real para escolas e comunidades rurais do Território do Sisal?",
      hypothesis:
        "A integração de sensores de baixo custo com microcontroladores IoT permite coletar dados ambientais com precisão equivalente a estações comerciais, a uma fração do custo.",
      materials:
        "Microcontroladores ESP32, sensores DHT22 (temperatura e umidade), BMP280 (pressão atmosférica), anemômetro impresso em 3D, painel solar 5W, bateria Li-Ion 18650 e servidor web.",
      results:
        "O protótipo operou de forma ininterrupta por 45 dias, registrando variações térmicas de 18°C a 37.4°C e transmitindo 100% dos dados para a plataforma.",
      references:
        "Moreno, V. M. (2025). Metodologias de Iniciação Científica no Semiárido. FECIBA. Santos, I. (2025). Arquitetura de Redes IoT para Monitoramento Ambiental.",
    },
    tags: ["Arduino", "IoT", "Semiárido", "Sustentabilidade", "Hardware"],
    createdAt: "2025-02-15",
    updatedAt: "2025-03-10",
    adminFeedback: {
      author: "Prof. Victor Montalvão Moreno",
      comment:
        "Excelente trabalho de integração entre computação e realidade local. Aprovado com louvor para submissão na etapa territorial da FECIBA.",
      badge: "Aprovado para FECIBA",
      evaluatedAt: "2025-03-12",
    },
  },
  {
    id: "proj-maria-1",
    studentId: "membro-19",
    studentName: "Maria Laura Miranda Nascimento",
    studentGrade: "2º Ano - Ensino Médio",
    studentRole: "Jovem Pesquisadora · Biotecnologia & Fitoquímica",
    studentImage: "/membros/Laura Miranda.jpeg",
    studentEmail: "maria.laura@ceclos.ba.gov.br",
    title: "Potencial Antimicrobiano de Extratos de Plantas da Caatinga",
    emoji: "🌿",
    coverGradient: "from-emerald-500/20 via-yellow-500/10 to-transparent",
    pillar: "biotecnologia",
    status: "featured",
    summary:
      "Avaliação in vitro da atividade antibacteriana de extratos etanólicos de espécies nativas do bioma Caatinga contra bactérias comuns.",
    content: `# Investigação Fitoquímica da Caatinga — Maria Laura

A flora do Semiárido desenvolve metabólitos secundários potentes devido ao estresse hídrico e à alta incidência solar. Investigamos as propriedades biológicas de espécies tradicionais da medicina popular de Valente.

## Metodologia de Extração
- Coleta botânica autorizada no município de Valente.
- Maceração a frio com álcool de cereais por 7 dias.
- Filtração e concentração do extrato em banho-maria.
- Teste de difusão em disco em placas de Petri com ágar nutriente.`,
    methodology: {
      problemStatement:
        "Os extratos de plantas nativas da Caatinga possuem ação inibitória mensurável contra cepas bacterianas em ambiente laboratorial escolar?",
      hypothesis:
        "Compostos fenólicos presentes nas folhas e cascas de espécies nativas inibem a proliferação bacteriana por meio do rompimento de membranas celulares.",
      materials:
        "Amostras vegetais, álcool etílico 70%, papel filtro qualitativo, placas de Petri, meio de cultura ágar, bico de Bunsen, estufa de incubação e paquímetro digital.",
      results:
        "Observamos a formação de halos de inibição de até 14mm nos extratos concentrados, comprovando a atividade biológica preliminar.",
      references:
        "Matos, F. J. A. (2009). Farmácias Vivas. Editora UFC. Lorenzi, H. (2008). Plantas Medicinais no Brasil.",
    },
    tags: ["Biotecnologia", "Caatinga", "Química", "Microbiologia"],
    createdAt: "2025-02-28",
    updatedAt: "2025-03-08",
    adminFeedback: {
      author: "Prof. Victor Montalvão Moreno",
      comment: "Rigor metodológico admirável nos ensaios fitoquímicos com espécies nativas.",
      badge: "Destaque Científico",
      evaluatedAt: "2025-03-09",
    },
  },
  {
    id: "proj-sophia-1",
    studentId: "membro-1",
    studentName: "Laura Oliveira Santos",
    studentGrade: "3º Ano - Ensino Médio",
    studentRole: "Jovem Pesquisadora · Biopolímeros & Sustentabilidade",
    studentImage: "/membros/Laura.jpeg",
    studentEmail: "laura.santos@ceclos.ba.gov.br",
    title: "Biopolímeros e Embalagens Biodegradáveis à Base de Palma",
    emoji: "🌱",
    coverGradient: "from-lime-500/20 via-emerald-500/10 to-transparent",
    pillar: "investigacao",
    status: "in_progress",
    summary:
      "Síntese de filmes biodegradáveis utilizando a mucilagem e fibras de palma forrageira como alternativa ecológica aos plásticos derivados de petróleo.",
    content: `# Desenvolvimento de Bioplásticos Sustentáveis — Laura Oliveira

A palma forrageira (Opuntia ficus-indica) é amplamente cultivada no semiárido. Esta pesquisa investiga o aproveitamento de sua mucilagem rica em polissacarídeos para produção de biopolímeros flexíveis.

## Formulação dos Filmes
- Extração aquosa da mucilagem por trituração e centrifugação.
- Adição de plastificante natural (glicerol vegetal).
- Secagem por método casting a 50°C em estufa ventilada por 24 horas.`,
    methodology: {
      problemStatement:
        "É viável sintetizar filmes poliméricos biodegradáveis com boa resistência mecânica utilizando a mucilagem da palma forrageira?",
      hypothesis:
        "A alta concentração de polissacarídeos mucilaginosos associada ao glicerol confere elasticidade e capacidade formadora de filme.",
      materials:
        "Cladódios de palma forrageira, glicerol vegetal P.A., água destilada, placas de Teflon, estufa de circulação de ar e dinamômetro escolar.",
      results:
        "Obtivemos filmes homogêneos e translúcidos com espessura média de 0.12mm e degradação completa em solo em 21 dias.",
      references:
        "Silva, R. et al. (2023). Biopolímeros da Flora Neotropical. Revista Brasileira de Polímeros.",
    },
    tags: ["Biopolímeros", "Palma Forrageira", "Sustentabilidade", "Ecologia"],
    createdAt: "2025-03-05",
    updatedAt: "2025-03-12",
  },
  {
    id: "proj-astronomy-1",
    studentId: "membro-7",
    studentName: "João Pedro Oliveira Cardoso",
    studentGrade: "2º Ano - Ensino Médio",
    studentRole: "Jovem Pesquisador · Astronomia & Óptica",
    studentImage: "/membros/João.jpeg",
    studentEmail: "joao.pedro@ceclos.ba.gov.br",
    title: "Mapeamento da Poluição Luminosa e Carta Celeste do Sertão",
    emoji: "🔭",
    coverGradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    pillar: "astronomia",
    status: "featured",
    summary:
      "Avaliação da qualidade do céu noturno no semiárido utilizando fotômetros digitais e telescópios newtonianos para catalogação de corpos celestes.",
    content: `# Astronomia Observacional no Semiárido — João Pedro

A baixa umidade relativa do ar e os amplos horizontes do sertão baiano proporcionam condições ideais para observação astronômica. Este projeto cataloga o céu profundo e monitora a interferência de luz urbana.

## Instrumentação
- Telescópio Refletor Newtoniano 114mm / 900mm.
- Fotômetro Sky Quality Meter (SQM) para magnitude visual por segundo de arco quadrado.
- Câmera CMOS acoplada para astrofotografia lunar e planetária.`,
    methodology: {
      problemStatement:
        "Qual o índice de escuridão do céu noturno no município e quais regiões rurais apresentam menor poluição luminosa para observação científica?",
      hypothesis:
        "O céu rural do sertão atinge classificação Bortle Classe 2 a 3, viabilizando observação de objetos Messier sem filtros de interferência.",
      materials:
        "Telescópio refletor 114mm, ocular Plössl 25mm e 10mm, medidor SQM-L, app de astrometria e diário de observação.",
      results:
        "Mapeados 18 pontos de observação com média de 21.4 mag/arcsec², confirmando céu excepcional para astrofotografia amadora e acadêmica.",
      references:
        "Bortle, J. E. (2001). The Bortle Dark-Sky Scale. Sky & Telescope. Mourão, R. R. F. (2004). Manual do Astrônomo.",
    },
    tags: ["Astronomia", "Astrofotografia", "Poluição Luminosa", "Óptica"],
    createdAt: "2025-02-10",
    updatedAt: "2025-03-14",
    adminFeedback: {
      author: "Prof. Victor Montalvão Moreno",
      comment:
        "Trabalho primoroso com dados quantitativos precisos. Destaque para a Mostra de Astronomia.",
      badge: "Destaque Científico",
      evaluatedAt: "2025-03-15",
    },
  },
  {
    id: "proj-water-1",
    studentId: "membro-6",
    studentName: "Ana Beatriz Mascarenhas de Jesus",
    studentGrade: "3º Ano - Ensino Médio",
    studentRole: "Jovem Pesquisadora · Tecnologia Solar & Termodinâmica",
    studentImage: "/membros/Beatriz.jpeg",
    studentEmail: "ana.beatriz@ceclos.ba.gov.br",
    title: "Dessalinização Solar com Condensador Termomagnético de Baixo Custo",
    emoji: "💧",
    coverGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    pillar: "tecnologia",
    status: "featured",
    summary:
      "Desenvolvimento de um protótipo de dessalinizador solar passivo com lentes Fresnel e condensação por convecção natural para comunidades do semiárido.",
    content: `# Dessalinização Solar de Águas Subterrâneas — Ana Beatriz

A água de poços tubulares no semiárido frequentemente apresenta alta salinidade. Desenvolvemos um destilador térmico autônomo acionado puramente por irradiação solar.`,
    methodology: {
      problemStatement:
        "Como produzir água potável a partir de fontes salobras utilizando energia solar térmica e materiais de fácil reposição?",
      hypothesis:
        "A concentração focalizada por lentes e circulação de ar aquecido eleva a taxa de evaporação em até 300% em relação a tanques planos convencionais.",
      materials:
        "Caixa isotérmica, chapa de alumínio pintada em preto fosco, vidro temperado 4mm, condutor de cobre e medidor de TDS/condutividade.",
      results:
        "Produção média de 4.8 litros de água dessalinizada por dia por m² de coletor, com redução de TDS de 3.200 ppm para 85 ppm (padrão potável).",
      references:
        "Cirilo, J. A. (2008). Políticas de Recursos Hídricos no Semiárido. Revista Brasileira de Recursos Hídricos.",
    },
    tags: ["Recursos Hídricos", "Energia Solar", "Sustentabilidade", "Engenharia"],
    createdAt: "2025-03-01",
    updatedAt: "2025-03-16",
    adminFeedback: {
      author: "Prof. Josué Pimentel Dos Santos",
      comment: "Solução de altíssimo impacto social e rigor termodinâmico exemplar.",
      badge: "Aprovado para FECIBA",
      evaluatedAt: "2025-03-17",
    },
  },
  {
    id: "proj-soil-1",
    studentId: "membro-13",
    studentName: "Gabriel Neri Almeida",
    studentGrade: "1º Ano - Ensino Médio",
    studentRole: "Jovem Pesquisador · Agroecologia & Ciência do Solo",
    studentImage: "/membros/Gabriel.jpeg",
    studentEmail: "gabriel.neri@ceclos.ba.gov.br",
    title: "Recuperação de Solos Degradados com Biochar da Casca de Sisal",
    emoji: "🧪",
    coverGradient: "from-amber-600/20 via-yellow-600/10 to-transparent",
    pillar: "investigacao",
    status: "in_progress",
    summary:
      "Pirólise lenta de resíduos da agroindústria do sisal para produção de condicionador de solo com alta capacidade de retenção hídrica e troca catiônica.",
    content: `# Biochar de Sisal para Agricultura Familiar — Gabriel Neri

O processamento do sisal gera toneladas de resíduos orgânicos que são descartados sem tratamento. Investigamos a conversão deste bioproduto em carvão ativado vegetal (biochar).`,
    methodology: {
      problemStatement:
        "O biochar produzido a partir da palha do sisal melhora a retenção de umidade e o desenvolvimento radicular de mudas nativas em solo semiárido?",
      hypothesis:
        "A estrutura porosa do biochar atua como micro-reservatório de água e nutrientes, reduzindo o estresse hídrico em períodos de estiagem.",
      materials:
        "Resíduo de sisal desidratado, reator de pirólise artesanal (forno tambor), solo argilo-arenoso, sementes de umbuzeiro e balança de precisão.",
      results:
        "Aumento de 42% na retenção de água do solo tratado e aceleração de 28% no crescimento radicular das mudas em 60 dias de teste.",
      references: "Lehmann, J. (2009). Biochar for Environmental Management. Earthscan.",
    },
    tags: ["Sisal", "Biochar", "Solo", "Agricultura Familiar", "Economia Circular"],
    createdAt: "2025-03-04",
    updatedAt: "2025-03-18",
  },
];

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<StudentProject[]>([]);

  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const data = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (data) {
          const parsed: StudentProject[] = migrarCaminhos(JSON.parse(data));
          const enriched = parsed.map(enrichProjectWithImage);
          setProjects(enriched);
        } else {
          const initialEnriched = INITIAL_PROJECTS.map(enrichProjectWithImage);
          setProjects(initialEnriched);
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialEnriched));
        }
      } catch {
        setProjects(INITIAL_PROJECTS.map(enrichProjectWithImage));
      }
    };

    loadFromStorage();
    window.addEventListener("ceclos_projects_updated", loadFromStorage);
    window.addEventListener("storage", loadFromStorage);

    return () => {
      window.removeEventListener("ceclos_projects_updated", loadFromStorage);
      window.removeEventListener("storage", loadFromStorage);
    };
  }, []);

  const saveProjects = useCallback((newProjects: StudentProject[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
      window.dispatchEvent(new Event("ceclos_projects_updated"));
    } catch (e) {
      console.error("Erro ao salvar projetos:", e);
    }
  }, []);

  const getStudentProjects = useCallback(
    (studentId: string) => {
      return projects.filter((p) => p.studentId === studentId);
    },
    [projects]
  );

  const getProjectById = useCallback(
    (id: string) => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const createProject = useCallback(
    (data: Partial<StudentProject>, student?: Partial<StudentUser>): StudentProject => {
      const now = new Date().toISOString().split("T")[0];
      const studentId = student?.id || data.studentId || `std-${Date.now()}`;
      const studentName = student?.name || data.studentName || "Jovem Pesquisador";
      const studentEmail = student?.email || data.studentEmail || "pesquisador@ceclos.ba.gov.br";

      const rawProject: StudentProject = {
        id: data.id || `proj-${Date.now()}`,
        studentId,
        studentName,
        studentEmail,
        studentGrade: data.studentGrade || student?.schoolYear || "Ensino Médio",
        studentRole: data.studentRole || "Jovem Cientista",
        studentImage: data.studentImage || student?.avatar || "",
        title: data.title || "Novo Projeto Sem Título",
        emoji: data.emoji || "🔬",
        coverGradient: data.coverGradient || "from-yellow-400/20 via-amber-500/10 to-transparent",
        pillar: data.pillar || "geral",
        status: data.status || "draft",
        summary: data.summary || "Escreva um resumo do seu projeto científico...",
        content:
          data.content ||
          `# ${data.title || "Meu Projeto Científico"}\n\nComece a descrever sua pesquisa, experimentos e observações aqui...`,
        methodology: data.methodology || {
          problemStatement: "",
          hypothesis: "",
          materials: "",
          results: "",
          references: "",
        },
        tags: data.tags && data.tags.length > 0 ? data.tags : ["Iniciação Científica", "CECLOS"],
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      const newProject = enrichProjectWithImage(rawProject);
      const updated = [newProject, ...projects];
      saveProjects(updated);
      return newProject;
    },
    [projects, saveProjects]
  );

  const updateProject = useCallback(
    (id: string, data: Partial<StudentProject>) => {
      const now = new Date().toISOString().split("T")[0];
      const updated = projects.map((p) => {
        if (p.id === id) {
          const merged: StudentProject = {
            ...p,
            ...data,
            methodology: {
              ...p.methodology,
              ...(data.methodology || {}),
            },
            updatedAt: now,
          };
          return enrichProjectWithImage(merged);
        }
        return p;
      });
      saveProjects(updated);
    },
    [projects, saveProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      const updated = projects.filter((p) => p.id !== id);
      saveProjects(updated);
    },
    [projects, saveProjects]
  );

  const addAdminFeedback = useCallback(
    (projectId: string, feedback: ProjectFeedback) => {
      const updated = projects.map((p) => {
        if (p.id === projectId) {
          const newStatus: ProjectStatus = feedback.badge?.includes("Aprovado")
            ? "approved"
            : feedback.badge?.includes("Destaque")
              ? "featured"
              : "review";

          return {
            ...p,
            status: newStatus,
            adminFeedback: feedback,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return p;
      });
      saveProjects(updated);
    },
    [projects, saveProjects]
  );

  const updateProjectStatus = useCallback(
    (projectId: string, status: ProjectStatus) => {
      const updated = projects.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
        return p;
      });
      saveProjects(updated);
    },
    [projects, saveProjects]
  );

  const resetProjects = useCallback(() => {
    const initialEnriched = INITIAL_PROJECTS.map(enrichProjectWithImage);
    saveProjects(initialEnriched);
  }, [saveProjects]);

  const value = useMemo(
    () => ({
      projects,
      getStudentProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      addAdminFeedback,
      updateProjectStatus,
      resetProjects,
    }),
    [
      projects,
      getStudentProjects,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      addAdminFeedback,
      updateProjectStatus,
      resetProjects,
    ]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}
