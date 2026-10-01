import { useState } from "react";
import {
  iniciaisDoParceiro,
  logoReservaDoParceiro,
  resolvePartnerLogo,
} from "@/compartilhado/utils/logo-do-parceiro";

interface LogoDoParceiroProps {
  partner: { id: string; name: string; logo?: string };
  className?: string;
  alt?: string;
}

export function LogoDoParceiro({ partner, className = "", alt = "" }: LogoDoParceiroProps) {
  const [falharam, setFalharam] = useState<string[]>([]);
  const fonte = [resolvePartnerLogo(partner), logoReservaDoParceiro(partner)].find(
    (candidata): candidata is string => !!candidata && !falharam.includes(candidata)
  );

  if (!fonte) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={!alt || undefined}
        className="logo-parceiro-iniciais"
      >
        {iniciaisDoParceiro(partner.name)}
      </span>
    );
  }

  return (
    <img
      key={fonte}
      src={fonte}
      alt={alt}
      decoding="async"
      draggable={false}
      className={className}
      onError={() => setFalharam((lista) => [...lista, fonte])}
    />
  );
}
