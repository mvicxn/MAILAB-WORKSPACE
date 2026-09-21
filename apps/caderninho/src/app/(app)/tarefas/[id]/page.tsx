import Link from "next/link";
import { notFound } from "next/navigation";

import { anexarArquivo, atualizarTarefa, excluirTarefa, mudarStatusTarefa, registrarTrabalho } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { Acionar } from "@/components/Acionar";
import { Avatar } from "@/components/Avatar";
import { DiarioVivo } from "@/components/DiarioVivo";
import { Relato } from "@/components/Relato";
import { usuarioAtual } from "@/lib/auth";
import { atrasada, COLUNAS, formatarPrazo, paraInputData, statusCanon } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { prisma } from "@/lib/prisma";

export default async function TarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, tarefa, users, projetos] = await Promise.all([
    usuarioAtual(prisma),
    prisma.tarefa.findUnique({
      where: { id },
      include: {
        assignee: true,
        criador: true,
        projeto: { include: { cliente: true } },
        arquivos: { orderBy: { createdAt: "desc" } },
        atualizacoes: { include: { autor: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.user.findMany({ where: { ativo: true }, orderBy: [{ tipo: "asc" }, { nome: "asc" }] }),
    prisma.projeto.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!tarefa || tarefa.deletedAt) {
    notFound();
  }
  const late = atrasada(tarefa.status, tarefa.prazo);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const grokVivo = tarefa.assignee.tipo === "ia" && Boolean(tarefa.acionadoAt) && statusCanon(tarefa.status) !== "concluida";

  return (
    <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
      <div className="grid gap-6">
        <div>
          <p className="text-sm text-[var(--mute)]">
            {tarefa.projeto ? (
              <Link href={`/projetos/${tarefa.projeto.id}`} className="text-[var(--accent)]">
                {tarefa.projeto.nome}
              </Link>
            ) : (
              "Interno"
            )}
            {tarefa.projeto?.valor ? ` · ${tarefa.projeto.valor}` : ""}
            {late ? " · atraso" : ""}
          </p>
          <h1 className="display mt-3 text-5xl">{tarefa.titulo}</h1>
        </div>

        {tarefa.descricao.trim() ? (
          <section className="panel p-6">
            <p className="kicker">Notas</p>
            <div className="mt-3">
              <Relato texto={tarefa.descricao} />
            </div>
          </section>
        ) : null}

        <section className="grid gap-3">
          <h2 className="display text-3xl">Diário</h2>
          <form action={formAction(registrarTrabalho)} className="panel grid gap-3 p-5">
            <input type="hidden" name="tarefaId" value={tarefa.id} />
            <textarea name="texto" required rows={4} placeholder="O que ficou pronto. Markdown vale." className="field" />
            <button type="submit" className="btn w-fit">
              Registrar entrega
            </button>
          </form>
          <DiarioVivo
            tarefaId={tarefa.id}
            vivo={grokVivo}
            inicial={tarefa.atualizacoes.map((i) => ({
              id: i.id,
              texto: i.texto,
              createdAt: i.createdAt.toISOString(),
              autor: { nome: i.autor.nome, tipo: i.autor.tipo },
            }))}
          />
        </section>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-8 lg:self-start">
        <section className="panel grid gap-4 p-5">
          <p className="flex items-center gap-2 text-sm">
            <Avatar nome={tarefa.assignee.nome} tipo={tarefa.assignee.tipo} size={28} />
            <span>
              <span className="block font-medium">{tarefa.assignee.nome}</span>
              <span className="text-[var(--mute)]">
                {tarefa.assignee.tipo === "ia" ? "Grok" : "Sócio"} · {formatarPrazo(tarefa.prazo)}
              </span>
            </span>
          </p>
          {grokVivo ? (
            <p className="flex items-center gap-2 text-xs text-[var(--gold)]">
              <span className="live" /> Em campo
            </p>
          ) : null}
          <form action={formAction(mudarStatusTarefa)} className="flex flex-wrap gap-2">
            <input type="hidden" name="id" value={tarefa.id} />
            {COLUNAS.map((c) => (
              <button
                key={c.id}
                name="status"
                value={c.id}
                className={statusCanon(tarefa.status) === c.id ? "btn" : "btn-ghost"}
              >
                {c.label}
              </button>
            ))}
          </form>
        </section>

        {socio && tarefa.assignee.tipo === "ia" ? (
          <Acionar tarefaId={tarefa.id} nome={tarefa.assignee.nome} grande />
        ) : null}

        <section className="panel grid gap-3 p-5">
          <p className="kicker">Arquivos</p>
          <form action={formAction(anexarArquivo)} className="grid gap-3">
            <input type="hidden" name="tarefaId" value={tarefa.id} />
            <input name="arquivo" type="file" required />
            <button type="submit" className="btn-ghost w-fit text-sm">
              Anexar
            </button>
          </form>
          {tarefa.arquivos.map((arq) => {
            const foto = /\.(png|jpe?g|gif|webp|svg)$/i.test(arq.nome);
            return (
              <a key={arq.id} href={`/api/arquivos/${arq.id}`} className="block">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/arquivos/${arq.id}`} alt={arq.nome} className="mb-2 max-h-40 rounded-xl" />
                ) : null}
                <span className="text-sm underline">{arq.nome}</span>
              </a>
            );
          })}
        </section>

        <details>
          <summary className="cursor-pointer text-sm text-[var(--mute)]">Editar</summary>
          <form action={formAction(atualizarTarefa)} className="panel mt-3 grid gap-3 p-5">
            <input type="hidden" name="id" value={tarefa.id} />
            <input name="titulo" required defaultValue={tarefa.titulo} className="field" />
            <textarea name="descricao" rows={3} defaultValue={tarefa.descricao} className="field" />
            <select name="assigneeId" className="field" defaultValue={tarefa.assigneeId}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
            <input name="prazo" type="date" defaultValue={paraInputData(tarefa.prazo)} className="field" />
            <select name="projetoId" className="field" defaultValue={tarefa.projetoId ?? ""}>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            <input type="hidden" name="status" value={statusCanon(tarefa.status)} />
            <button type="submit" className="btn w-fit">
              Salvar
            </button>
          </form>
          <div className="mt-3">
            <Excluir id={tarefa.id} pergunta={`Excluir tarefa ${tarefa.titulo}?`} action={excluirTarefa} />
          </div>
        </details>
      </aside>
    </main>
  );
}
