import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const PUBLICOS = [
  /^\/entrar(?:\/)?$/,
  /^\/_next\//,
  /^\/api\/mesa\//,
  /^\/favicon\.ico$/,
  /^\/mai-logo\.png$/,
];

function chaveSessao() {
  return new TextEncoder().encode(process.env.MAI_SECRET || "");
}

function ehPublico(path: string) {
  return PUBLICOS.some((r) => r.test(path));
}

async function tokenValido(token: string) {
  if (!token || (process.env.MAI_SECRET || "").length < 24) {
    return false;
  }
  try {
    await jwtVerify(token, chaveSessao());
    return true;
  } catch {
    return false;
  }
}

function comCabecalhos(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  return res;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("mai")?.value ?? "";
  const ok = await tokenValido(token);

  if (!ehPublico(path) && !ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    const res = NextResponse.redirect(url);
    if (token) {
      res.cookies.delete("mai");
    }
    return comCabecalhos(res);
  }

  if (path.startsWith("/entrar") && ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/hoje";
    return comCabecalhos(NextResponse.redirect(url));
  }

  return comCabecalhos(NextResponse.next());
}

export const config = {
  matcher: ["/((?!api/quadro-ws).*)"],
};
