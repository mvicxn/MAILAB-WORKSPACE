import { autenticarCredencial, usuarioAtual } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function autenticarMesa(email: string, senha: string) {
  const ident = email.trim();
  if (ident || senha) {
    return autenticarCredencial(ident, senha);
  }
  const sessao = await usuarioAtual(prisma);
  if (!sessao) {
    return null;
  }
  return prisma.user.findFirst({ where: { id: sessao.id, ativo: true } });
}

export async function camposDoPedido(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("multipart/form-data") || ctype.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    const get = (k: string) => String(form.get(k) ?? "").trim();
    return {
      email: get("email"),
      senha: String(form.get("senha") ?? ""),
      prateleira: get("prateleira"),
      titulo: get("titulo"),
      corpo: get("corpo") || get("texto"),
      link: get("link"),
      fonte: get("fonte"),
    };
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const get = (k: string) => String(body[k] ?? "").trim();
  return {
    email: get("email"),
    senha: String(body.senha ?? ""),
    prateleira: get("prateleira") || get("shelf"),
    titulo: get("titulo") || get("title"),
    corpo: get("corpo") || get("texto") || get("body"),
    link: get("link") || get("url"),
    fonte: get("fonte") || get("source"),
  };
}
