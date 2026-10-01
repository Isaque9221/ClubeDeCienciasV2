export type MemberCategory =
  "lideranca" | "astronomia_fisica" | "biotec_quimica" | "tecnologia_robotica" | "terra_exatas";

export interface Member {
  id: string;
  name: string;
  role: string;
  area: string;
  image?: string;
  imagePosition?: string;
  iconName: string;
  color: string;
  quote: string;
  tag: string;
  category: MemberCategory;
  num?: string;
}

export interface MemberStat {
  label: string;
  value: string;
}
