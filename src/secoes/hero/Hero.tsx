import { HeroDesktop } from "./HeroDesktop";

export interface HeroProps {
  onOpenMembers?: () => void;
  onOpenProjects?: () => void;
  onOpenTrajetoria?: () => void;
}

export function Hero({ onOpenMembers, onOpenProjects, onOpenTrajetoria }: HeroProps) {
  return (
    <HeroDesktop
      onOpenMembers={onOpenMembers}
      onOpenProjects={onOpenProjects}
      onOpenTrajetoria={onOpenTrajetoria}
    />
  );
}
