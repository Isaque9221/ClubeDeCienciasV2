import { createContext } from "react";
import type { Member } from "@/compartilhado/tipos/member.types";
import type { Partner } from "@/compartilhado/tipos/partner.types";
import { PADROES_DO_PAINEL } from "@/secoes/padroes-do-painel";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteConfig {
  masterTokenHash?: string;
  adminPassword?: string;
  lastBackupDate?: string;
  announcementText?: string;
  announcementActive?: boolean;

  siteTitle?: string;
  siteSubtitle?: string;
  tagline?: string;
  locationCity?: string;
  heroVideoUrl?: string;
  fontFamily?: string;
  primaryColor?: string;

  heroTitleTop?: string;
  heroTitleHighlight?: string;
  heroTitleBottom?: string;
  heroBtn1Title?: string;
  heroBtn1Subtitle?: string;
  heroBtn2Title?: string;
  heroBtn2Subtitle?: string;
  heroBtn3Title?: string;
  heroBtn3Subtitle?: string;
  heroBtn3Badge?: string;
  heroBtn4Title?: string;
  heroBtn4Subtitle?: string;
  heroBtn4Badge?: string;

  aboutBadge?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  awardTitle?: string;
  awardSubtitle?: string;
  awardBadge?: string;

  leader1Name?: string;
  leader1Role?: string;
  leader1Area?: string;
  leader1Bio?: string;
  leader1Image?: string;
  leader1Quote?: string;
  leader1SuperTag?: string;
  leader1Tags?: string;
  leader1Stat1Value?: string;
  leader1Stat1Label?: string;
  leader1Stat2Value?: string;
  leader1Stat2Label?: string;
  leader1Stat3Value?: string;
  leader1Stat3Label?: string;

  leader2Name?: string;
  leader2Role?: string;
  leader2Area?: string;
  leader2Bio?: string;
  leader2Image?: string;
  leader2Quote?: string;
  leader2SuperTag?: string;
  leader2Tags?: string;
  leader2Stat1Value?: string;
  leader2Stat1Label?: string;
  leader2Stat2Value?: string;
  leader2Stat2Label?: string;
  leader2Stat3Value?: string;
  leader2Stat3Label?: string;

  pillar1Title?: string;
  pillar1Sub?: string;
  pillar1Tagline?: string;
  pillar1Desc?: string;

  pillar2Title?: string;
  pillar2Sub?: string;
  pillar2Tagline?: string;
  pillar2Desc?: string;

  pillar3Title?: string;
  pillar3Sub?: string;
  pillar3Tagline?: string;
  pillar3Desc?: string;

  pillar4Title?: string;
  pillar4Sub?: string;
  pillar4Tagline?: string;
  pillar4Desc?: string;

  pillar5Title?: string;
  pillar5Sub?: string;
  pillar5Tagline?: string;
  pillar5Desc?: string;

  pillar6Title?: string;
  pillar6Sub?: string;
  pillar6Tagline?: string;
  pillar6Desc?: string;

  stat1Value?: string;
  stat1Label?: string;
  stat1Desc?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat2Desc?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat3Desc?: string;
  stat4Value?: string;
  stat4Label?: string;
  stat4Desc?: string;

  ticker1?: string;
  ticker2?: string;

  quoteText?: string;
  quoteAuthor?: string;
  quoteLocation?: string;

  ctaBadge?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaBtnText?: string;

  contactEmail?: string;
  contactAddress?: string;
  contactInstagram?: string;
  contactInstagramUrl?: string;
  coordinates?: string;
  altitude?: string;
  biome?: string;
  footerQuote?: string;

  membersPageTitle?: string;
  membersPageSubtitle?: string;
  membersPageBadge?: string;

  exploreLabel?: string;
  exploreTitle?: string;

  aboutTabsCallLeft?: string;
  aboutTabsCallRight?: string;

  aboutTab1Title?: string;
  aboutTab1Sub?: string;
  aboutTab1Desc?: string;
  aboutTab2Title?: string;
  aboutTab2Sub?: string;
  aboutTab2Desc?: string;
  aboutTab3Title?: string;
  aboutTab3Sub?: string;
  aboutTab3Desc?: string;
  aboutTab4Title?: string;
  aboutTab4Sub?: string;
  aboutTab4Desc?: string;

  aboutMission1Badge?: string;
  aboutMission1Title?: string;
  aboutMission1Sub?: string;
  aboutMission1Desc?: string;
  aboutMission2Badge?: string;
  aboutMission2Title?: string;
  aboutMission2Sub?: string;
  aboutMission2Desc?: string;
  aboutMission3Badge?: string;
  aboutMission3Title?: string;
  aboutMission3Sub?: string;
  aboutMission3Desc?: string;

  pillarsBadge?: string;
  pillarsTitle?: string;
  pillarsSubtitle?: string;

  teamBadge?: string;
  teamTitle?: string;
  teamSubtitle?: string;

  faqBadge?: string;
  faqTitle?: string;
  faqTitleHighlight?: string;

  mentorsBadge?: string;
  mentorsTitle?: string;
  mentorsSubtitle?: string;
  mentorsCounterLabel?: string;
  mentorsAwardLabel?: string;
  mentorsCardFooter?: string;
  mentorsProfileBtn?: string;
  mentorsDirectoryBtn?: string;

  bridgesBadge?: string;
  bridgesTitle?: string;
  bridgesSubtitle?: string;
  bridgesCounterFronts?: string;
  bridgesCounterOrgs?: string;

  manifestoText?: string;
  manifestoAuthor?: string;
  manifestoSignature?: string;

  ctaBtnSecondaryText?: string;
  ctaBtnMessage?: string;
  ctaPhone?: string;
  ctaWhatsappMessage?: string;

  footerTopBrand?: string;
  footerPartnersBadge?: string;
  footerPartnersTitle?: string;
  footerPartnersSubtitle?: string;
  layoutSections?: string;
  elementPositions?: string;
  footerPartnersSpeed?: string;
  footerNavTitle?: string;
  footerContactsTitle?: string;
  footerSignatureBig?: string;
  footerSignatureSmall?: string;
  footerCreditsBrand?: string;
  footerCreditsAuthor?: string;

  journeyBackBtn?: string;
  journeyBrand?: string;
  journeyBadge?: string;
  journeyTitle?: string;
  journeySubtitle?: string;
  journeyFinalBadge?: string;
  journeyFinalTitle?: string;
  journeyFinalText?: string;
  journeyFinalBtnProjects?: string;
  journeyFinalBtnMembers?: string;

  projectsBrand?: string;
  projectsBadge?: string;
  projectsTitle?: string;
  projectsSubtitle?: string;
  projectsSearchPlaceholder?: string;
  projectsCardBtn?: string;
  projectsEmptyTitle?: string;
  projectsEmptySubtitle?: string;
  projectsStatus?: string;
  mapStatus?: string;
  projectsDevBadge?: string;
  projectsDevTitle?: string;
  projectsDevMessage?: string;

  muralTitle?: string;
  muralHighlight?: string;
  muralCaption?: string;
  membersLeadershipBadge?: string;
  membersLeadershipTitle?: string;
  membersMentorsBadge?: string;
  membersMentorsTitle?: string;
  membersMentorsSubtitle?: string;
  membersDirectoryBadge?: string;
  membersDirectoryTitle?: string;
  membersDirectorySubtitle?: string;
  membersSearchPlaceholder?: string;
  membersCtaTitle?: string;
  membersCtaText?: string;
  membersCtaBtn?: string;

  loadingChoiceBadge?: string;
  loadingChoiceTitle?: string;
  loadingChoiceHighlight?: string;
  loadingChoiceSubtitle?: string;

  heroBtnTrajetoriaTitle?: string;
  heroBtnTrajetoriaSubtitle?: string;
  heroBtnTrajetoriaBadge?: string;

  awardLogo?: string;
  aboutTab1Items?: string;
  aboutTab2Items?: string;
  aboutTab3Items?: string;
  aboutTab4Items?: string;

  pillar1Items?: string;
  pillar2Items?: string;
  pillar3Items?: string;
  pillar4Items?: string;
  pillar5Items?: string;
  pillar6Items?: string;

  bridgesGroup1Title?: string;
  bridgesGroup1Summary?: string;
  bridgesGroup1PartnerName?: string;
  bridgesGroup1PartnerBadge?: string;
  bridgesGroup1PartnerDetail?: string;

  bridgesGroup2Title?: string;
  bridgesGroup2Summary?: string;
  bridgesGroup2P1Name?: string;
  bridgesGroup2P1Badge?: string;
  bridgesGroup2P1Detail?: string;
  bridgesGroup2P2Name?: string;
  bridgesGroup2P2Badge?: string;
  bridgesGroup2P2Detail?: string;

  bridgesGroup3Title?: string;
  bridgesGroup3Summary?: string;
  bridgesGroup3P1Name?: string;
  bridgesGroup3P1Badge?: string;
  bridgesGroup3P1Detail?: string;
  bridgesGroup3P2Name?: string;
  bridgesGroup3P2Badge?: string;
  bridgesGroup3P2Detail?: string;

  bridgesGroup4Title?: string;
  bridgesGroup4Summary?: string;
  bridgesGroup4PartnerName?: string;
  bridgesGroup4PartnerBadge?: string;
  bridgesGroup4PartnerDetail?: string;

  contactScheduleNotice?: string;

  loadingCard1Title?: string;
  loadingCard1Subtitle?: string;
  loadingCard1Badge?: string;
  loadingCard1Highlight?: string;
  loadingCard1Status?: string;
  loadingCard1Image?: string;

  loadingCard2Title?: string;
  loadingCard2Subtitle?: string;
  loadingCard2Badge?: string;
  loadingCard2Highlight?: string;
  loadingCard2Status?: string;
  loadingCard2Image?: string;

  loadingCard3Title?: string;
  loadingCard3Subtitle?: string;
  loadingCard3Badge?: string;
  loadingCard3Highlight?: string;
  loadingCard3Status?: string;
  loadingCard3Image?: string;

  loadingCard4Title?: string;
  loadingCard4Subtitle?: string;
  loadingCard4Badge?: string;
  loadingCard4Highlight?: string;
  loadingCard4Status?: string;
  loadingCard4Image?: string;

  journeyStat1Value?: string;
  journeyStat1Label?: string;
  journeyStat1Desc?: string;
  journeyStat2Value?: string;
  journeyStat2Label?: string;
  journeyStat2Desc?: string;
  journeyStat3Value?: string;
  journeyStat3Label?: string;
  journeyStat3Desc?: string;
  journeyStat4Value?: string;
  journeyStat4Label?: string;
  journeyStat4Desc?: string;

  journeyMilestone1Year?: string;
  journeyMilestone1Month?: string;
  journeyMilestone1Badge?: string;
  journeyMilestone1Title?: string;
  journeyMilestone1Desc?: string;
  journeyMilestone1Highlights?: string;

  journeyMilestone2Year?: string;
  journeyMilestone2Month?: string;
  journeyMilestone2Badge?: string;
  journeyMilestone2Title?: string;
  journeyMilestone2Desc?: string;
  journeyMilestone2Highlights?: string;

  journeyMilestone3Year?: string;
  journeyMilestone3Month?: string;
  journeyMilestone3Badge?: string;
  journeyMilestone3Title?: string;
  journeyMilestone3Desc?: string;
  journeyMilestone3Highlights?: string;

  journeyMilestone4Year?: string;
  journeyMilestone4Month?: string;
  journeyMilestone4Badge?: string;
  journeyMilestone4Title?: string;
  journeyMilestone4Desc?: string;
  journeyMilestone4Highlights?: string;

  faqs?: FAQItem[];
}

export interface DataContextType {
  members: Member[];
  mentors: Member[];
  partners: Partner[];
  siteConfig: SiteConfig;

  addMember: (member: Omit<Member, "id">) => void;
  updateMember: (id: string, updated: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  resetMembers: () => void;
  reorderMembers: (newMembers: Member[]) => void;
  moveMember: (fromIndex: number, toIndex: number) => void;
  renumberMembers: () => void;

  addPartner: (partner: Omit<Partner, "id">) => void;
  updatePartner: (id: string, updated: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  resetPartners: () => void;

  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  erroDeSalvamento: string | null;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  resetAllToFactory: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DEFAULT_CONFIG: SiteConfig = {
  ...PADROES_DO_PAINEL,

  masterTokenHash: import.meta.env.VITE_MASTER_TOKEN_HASH || "",
  announcementActive: false,
  announcementText: "Novas inscrições abertas para o Clube de Ciências!",
};
