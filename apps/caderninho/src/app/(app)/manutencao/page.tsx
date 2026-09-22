import { Contratar } from "@/app/(app)/equipe/Contratar";
import { fazerBackup, restaurarDaLixeira } from "@/app/actions";
import { Pagina } from "@/components/Pagina";
import { formAction } from "@/lib/form-action";
import { usuarioAtual } from "@/lib/auth";
import { ultimoBackup } from "@/lib/backup";
import { formatarQuando } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { prisma } from "@/lib/prisma";

export default async function ManutencaoPage() {
  const user = await usuarioAtual(prisma);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  if (!socio) {
    return (
      <Pagina kicker="Casa" titulo="Manutenção" texto="Só sócio mexe na ligação, no backup e na lixeira.">
        <p className="text-[var(--mute)]">Peça a Maicon ou Ian.</p>
      </Pagina>
    );
  }

  const [mailabLigada, backup, clientes, projetos, tarefas] = await Promise.all([
    rotinaMailabLigada(),
    ultimoBackup(),
    prisma.cliente.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" }, take: 20 }),
    prisma.projeto.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" }, take: 20 }),
    prisma.tarefa.findMany({ where: { deletedAt: { not: null } }, orderBy: { deletedAt: "desc" }, take: 20 }),
  ]);

  const pendencias: string[] = [];
  if (!mailabLigada) {
    pendencias.push("Carlos sem ligação neste PC — ele não acorda.");
  }
  if (!backup) {
    pendencias.push("Ainda não tem backup neste computador.");
  }
  const lixo = clientes.length + projetos.length + tarefas.length;
  if (lixo > 0) {
    pendencias.push(`${lixo} item${lixo === 1 ? "" : "s"} na lixeira.`);
  }

  return (
    <Pagina
      kicker="Casa"
      titulo="Manutenção"
      texto="Pendências da máquina: ligação do Carlos, backup deste PC e o que foi pra lixeira."
    >
      {pendencias.length > 0 ? (
        <section className="panel grid gap-2 p-7">
          <p className="kicker">Pendências</p>
          {pendencias.map((p) => (
            <p key={p} className="text-sm text-[var(--mute)]">
              {p}
            </p>
          ))}
        </section>
      ) : (
        <p className="text-sm text-[var(--mute)]">Nenhuma pendência de máquina agora.</p>
      )}

      <Contratar mailabLigada={mailabLigada} />

      <section className="panel grid gap-4 p-7">
        <p className="kicker">Cópia</p>
        <h2 className="display text-2xl">Backup deste PC</h2>
        <p className="text-sm text-[var(--mute)]">
          Cópia do banco nesta pasta. Não sobe pro Git. Último arquivo: {backup ?? "ainda nenhum neste PC"}.
        </p>
        <form action={formAction(fazerBackup)}>
          <button type="submit" className="btn w-fit">
            Fazer backup agora
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        <h2 className="display text-3xl">Lixeira</h2>
        {lixo === 0 ? (
          <p className="text-sm text-[var(--mute)]">Nada excluído. Excluir some da lista, não apaga o banco.</p>
        ) : (
          <div className="grid gap-3">
            {clientes.map((c) => (
              <form key={c.id} action={formAction(restaurarDaLixeira)} className="panel flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs text-[var(--mute)]">Cliente{c.deletedAt ? ` · ${formatarQuando(c.deletedAt)}` : ""}</p>
                  <p className="font-medium">{c.nome}</p>
                </div>
                <input type="hidden" name="tipo" value="cliente" />
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="btn-ghost">
                  Restaurar
                </button>
              </form>
            ))}
            {projetos.map((p) => (
              <form key={p.id} action={formAction(restaurarDaLixeira)} className="panel flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs text-[var(--mute)]">Projeto{p.deletedAt ? ` · ${formatarQuando(p.deletedAt)}` : ""}</p>
                  <p className="font-medium">{p.nome}</p>
                </div>
                <input type="hidden" name="tipo" value="projeto" />
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn-ghost">
                  Restaurar
                </button>
              </form>
            ))}
            {tarefas.map((t) => (
              <form key={t.id} action={formAction(restaurarDaLixeira)} className="panel flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs text-[var(--mute)]">Tarefa{t.deletedAt ? ` · ${formatarQuando(t.deletedAt)}` : ""}</p>
                  <p className="font-medium">{t.titulo}</p>
                </div>
                <input type="hidden" name="tipo" value="tarefa" />
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className="btn-ghost">
                  Restaurar
                </button>
              </form>
            ))}
          </div>
        )}
      </section>
    </Pagina>
  );
}
