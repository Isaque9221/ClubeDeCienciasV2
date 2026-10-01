import { useContext } from "react";
import { SoundContext } from "@/compartilhado/contextos/sound-context";
import type { SoundContextType } from "@/compartilhado/tipos/sound.types";

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound deve ser utilizado dentro de um SoundProvider");
  }
  return context;
};
