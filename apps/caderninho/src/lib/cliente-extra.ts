export type ExtraCliente = {
  empresa: string;
  cargo: string;
  email: string;
  telefone: string;
  whatsapp: string;
  cidade: string;
  origem: string;
  documento: string;
};

const VAZIO: ExtraCliente = {
  empresa: "",
  cargo: "",
  email: "",
  telefone: "",
  whatsapp: "",
  cidade: "",
  origem: "",
  documento: "",
};

export function lerExtra(raw: string | null | undefined): ExtraCliente {
  const base = { ...VAZIO };
  if (!raw || raw === "{}") {
    return base;
  }
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    for (const k of Object.keys(base) as (keyof ExtraCliente)[]) {
      const v = j[k];
      if (typeof v === "string") {
        base[k] = v.trim();
      }
    }
  } catch {
    return base;
  }
  return base;
}

export function extraDeForm(get: (name: string) => string): ExtraCliente {
  return {
    empresa: get("empresa").slice(0, 120),
    cargo: get("cargo").slice(0, 80),
    email: get("email").slice(0, 120),
    telefone: get("telefone").slice(0, 40),
    whatsapp: get("whatsapp").slice(0, 40),
    cidade: get("cidade").slice(0, 80),
    origem: get("origem").slice(0, 80),
    documento: get("documento").slice(0, 40),
  };
}

export function gravarExtra(extra: ExtraCliente) {
  return JSON.stringify(extra);
}

export function contatoDe(extra: ExtraCliente, contato: string) {
  const t = contato.trim();
  if (t) {
    return t;
  }
  return [extra.telefone || extra.whatsapp, extra.email].filter(Boolean).join(" · ");
}

export function resumoFicha(extra: ExtraCliente) {
  return [extra.cargo, extra.empresa, extra.cidade].filter(Boolean).join(" · ");
}
