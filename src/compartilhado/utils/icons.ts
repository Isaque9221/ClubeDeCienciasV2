import type React from "react";
import {
  Dna,
  Cpu,
  Telescope,
  FlaskConical,
  Code2,
  Atom,
  Microscope,
  Compass,
  Globe2,
  Zap,
} from "lucide-react";

export const ICON_MAP: Record<string, React.ElementType> = {
  Dna,
  Cpu,
  Telescope,
  FlaskConical,
  Code2,
  Atom,
  Microscope,
  Compass,
  Globe2,
  Zap,
};

export function getIconComponent(name: string): React.ElementType {
  return ICON_MAP[name] || Atom;
}
