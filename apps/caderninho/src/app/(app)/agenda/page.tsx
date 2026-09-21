import { Calendario } from "@/components/Calendario";
import { eventosDoPeriodo } from "@/app/actions";
import { usuarioAtual } from "@/lib/auth";
import { vivo } from "@/lib/casa";
import { chaveDia, diasDoMes } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function AgendaPage() {
  const user = await usuarioAtual(prisma);
  const hoje = chaveDia(new Date());
  const [y, m] = hoje.split("-").map(Number);
  const grade = diasDoMes(y, m);
  const de = grade[0];
  const ate = grade[grade.length - 1];
  const [itens, pessoas, clientes, projetos] = await Promise.all([
    eventosDoPeriodo(de, ate),
    prisma.user.findMany({ where: { ativo: true, empresaId: "mai" }, orderBy: [{ tipo: "asc" }, { nome: "asc" }], select: { id: true, nome: true } }),
    prisma.cliente.findMany({ where: vivo, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.projeto.findMany({ where: vivo, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  return (
    <Calendario
      inicial={itens}
      deInicial={hoje}
      pessoas={pessoas}
      clientes={clientes}
      projetos={projetos}
      euId={user?.id ?? ""}
    />
  );
}
