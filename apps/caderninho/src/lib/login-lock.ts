type Balde = { n: number; ate: number };

const porIp = new Map<string, Balde>();
const porLogin = new Map<string, Balde>();

const JANELA_MS = 15 * 60 * 1000;
const MAX_IP = 12;
const MAX_LOGIN = 6;

function tocar(mapa: Map<string, Balde>, chave: string, agora: number): Balde {
  const atual = mapa.get(chave);
  if (!atual || atual.ate <= agora) {
    const novo = { n: 0, ate: agora + JANELA_MS };
    mapa.set(chave, novo);
    return novo;
  }
  return atual;
}

export function ipDoPedido(h: Headers) {
  const cf = h.get("cf-connecting-ip");
  if (cf) {
    return cf.trim();
  }
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) {
    return xff;
  }
  return h.get("x-real-ip")?.trim() || "local";
}

export function loginBloqueado(ip: string, login: string) {
  const agora = Date.now();
  const a = porIp.get(ip);
  const b = porLogin.get(login.trim().toLowerCase());
  if (a && a.ate > agora && a.n >= MAX_IP) {
    return true;
  }
  if (b && b.ate > agora && b.n >= MAX_LOGIN) {
    return true;
  }
  return false;
}

export function registrarFalhaLogin(ip: string, login: string) {
  const agora = Date.now();
  const a = tocar(porIp, ip, agora);
  a.n += 1;
  const b = tocar(porLogin, login.trim().toLowerCase(), agora);
  b.n += 1;
}

export function limparFalhasLogin(ip: string, login: string) {
  porIp.delete(ip);
  porLogin.delete(login.trim().toLowerCase());
}
