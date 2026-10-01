import { createContext } from "react";
import type { SoundContextType } from "@/compartilhado/tipos/sound.types";

export const SoundContext = createContext<SoundContextType | undefined>(undefined);
