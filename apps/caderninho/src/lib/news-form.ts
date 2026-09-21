export const PRATELEIRAS = ["git", "mundo"] as const;
export type Prateleira = (typeof PRATELEIRAS)[number];

export function prateleiraCanon(v: string): Prateleira | null {
  const s = v.trim().toLowerCase();
  if (s === "git" || s === "github" || s === "nosso git" || s === "nosso_git") {
    return "git";
  }
  if (s === "mundo") {
    return "mundo";
  }
  return null;
}

export function tituloNews(v: string) {
  const t = v.replace(/\s+/g, " ").trim();
  if (t.length < 2 || t.length > 160) {
    return null;
  }
  return t;
}

export function corpoNews(v: string) {
  const t = v.trim();
  if (t.length < 2 || t.length > 8000) {
    return null;
  }
  return t;
}

export function fonteNews(v: string) {
  return v.replace(/\s+/g, " ").trim().slice(0, 80);
}

export function linkSeguro(v: string) {
  const t = v.trim();
  if (!t) {
    return "";
  }
  if (t.length > 500) {
    return null;
  }
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return null;
    }
    return t;
  } catch {
    return null;
  }
}

export function rotuloPrateleira(p: string) {
  return p === "git" ? "Nosso Git" : "Mundo";
}
