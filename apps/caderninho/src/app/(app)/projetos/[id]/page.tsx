import Link from "next/link";
import { notFound } from "next/navigation";

import { atualizarProjeto, excluirProjeto, impactoProjeto } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Excluir } from "@/components/Excluir";
import { CartaoTarefa } from "@/components/CartaoTarefa";
import { FormTarefa } from "@/components/FormTarefa";
import { QuadroVivo } from "@/components/QuadroVivo";
import { Relato } from "@/components/Relato";
import { usuarioAtual } from "@/lib/auth";
import { COLUNAS, COMERCIAL, formatarPrazo, LABEL_COMERCIAL, paraInputData, statusCanon } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

const ABAS = [
  ["mesa", "Mesa"],
  ["quadro", "Quadro"],
  ["arquivos", "Arquivos"],
  ["comercial", "Comercial"],
] as const;

export default async function ProjetoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { id } = await params;
  const { aba: abaRaw } = await searchParams;
  const aba = ABAS.some((a) => a[0] === abaRaw) ? abaRaw! : "mesa";
  const [user, projeto, users] = await Promise.all([
    usuarioAtual(prisma),
    prisma.projeto.findUnique({
      where: { id },
      include: {
        cliente: true,
        tarefas: {
          where: { deletedAt: null },
          include: {
            assignee: true,
            projeto: true,
            arquivos: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    }),
    prisma.user.findMany({ where: { ativo: true }, orderBy: [{ tipo: "asc" }, { nome: "asc" }] }),
  ]);
  if (!projeto || projeto.deletedAt) {
    notFound();
  }
  const impacto = await impactoProjeto(projeto.id);
  const porColuna = Object.fromEntries(
    COLUNAS.map((c) => [c.id, projeto.tarefas.filter((t) => statusCanon(t.status) === c.id)]),
  ) as Record<string, typeof projeto.tarefas>;
  const arquivos = projeto.tarefas.flatMap((t) => t.arquivos.map((a) => ({ ...a, tarefa: t.titulo })));
  const quadro = aba === "quadro" ? await prisma.quadro.findUnique({ where: { sala: projeto.quadroId } }) : null;

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">{projeto.cliente?.nome ?? "Interno"}</p>
          <h1 className="display mt-2 text-5xl">{projeto.nome}</h1>
          {(projeto.proximo ?? "").trim() ? (
            <p className="mt-3 max-w-2xl text-[var(--mute)]">
              <span className="text-[var(--gold)]">Próximo. </span>
              {projeto.proximo}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip gold">{LABEL_COMERCIAL[projeto.comercial] ?? projeto.comercial}</span>
            {(projeto.valor ?? "").trim() ? <span className="chip">{projeto.valor}</span> : null}
            {projeto.prazo ? <span className="chip">{formatarPrazo(projeto.prazo)}</span> : null}
          </div>
        </div>
        <nav className="tabs">
          {ABAS.map(([idAba, label]) => (
            <Link key={idAba} href={`/projetos/${projeto.id}?aba=${idAba}`} className={`tab ${aba === idAba ? "on" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {aba === "mesa" ? (
        <>
          <FormTarefa
            users={users}
            projetoId={projeto.id}
            clienteId={projeto.clienteId ?? undefined}
            euId={user?.id}
            voltar={`/projetos/${projeto.id}`}
          />
          <section className="grid gap-4 lg:grid-cols-3">
            {COLUNAS.map((c) => (
              <div key={c.id} className="panel p-4">
                <div className="col-head">
                  <h2 className="display text-2xl">{c.label}</h2>
                  <span className="text-sm text-[var(--mute)]">{porColuna[c.id].length}</span>
                </div>
                <div className="grid gap-2">
                  {porColuna[c.id].length === 0 ? (
                    <p className="text-sm text-[var(--mute)]">Vazio.</p>
                  ) : (
                    porColuna[c.id].map((t) => <CartaoTarefa key={t.id} t={t} />)
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      ) : null}

      {aba === "quadro" ? (
        <QuadroVivo sala={projeto.quadroId} snapshotInicial={quadro?.snapshot ?? ""} />
      ) : null}

      {aba === "arquivos" ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {arquivos.length === 0 ? (
            <p className="text-[var(--mute)]">Ainda sem arquivo. Anexe dentro da tarefa.</p>
          ) : (
            arquivos.map((arq) => {
              const foto = /\.(png|jpe?g|gif|webp|svg)$/i.test(arq.nome);
              return (
                <a key={arq.id} href={`/api/arquivos/${arq.id}`} className="panel block p-4">
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/arquivos/${arq.id}`} alt={arq.nome} className="mb-3 max-h-48 w-full rounded-xl object-cover" />
                  ) : null}
                  <p className="text-sm font-medium">{arq.nome}</p>
                  <p className="mt-1 text-xs text-[var(--mute)]">{arq.tarefa}</p>
                </a>
              );
            })
          )}
        </section>
      ) : null}

      {aba === "comercial" ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {projeto.descricao.trim() ? (
            <section className="panel p-6">
              <p className="kicker">Entrega</p>
              <div className="mt-3 text-[var(--mute)]">
                <Relato texto={projeto.descricao} />
              </div>
            </section>
          ) : (
            <section className="panel p-6">
              <p className="kicker">Entrega</p>
              <p className="mt-3 text-sm text-[var(--mute)]">Ainda sem nota do que se cobra neste projeto.</p>
            </section>
          )}
          <form action={formAction(atualizarProjeto)} className="panel grid gap-3 p-6">
            <p className="kicker">Números</p>
            <input type="hidden" name="id" value={projeto.id} />
            <input name="nome" required defaultValue={projeto.nome} className="field" />
            <textarea name="descricao" rows={3} defaultValue={projeto.descricao} className="field" placeholder="O que vamos entregar" />
            <input name="cliente" defaultValue={projeto.cliente?.nome ?? ""} placeholder="Cliente" className="field" />
            <input name="valor" defaultValue={projeto.valor ?? ""} placeholder="Valor combinado" className="field" />
            <input name="prazo" type="date" defaultValue={paraInputData(projeto.prazo)} className="field" />
            <select name="comercial" className="field" defaultValue={projeto.comercial ?? "interno"}>
              {COMERCIAL.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input name="proximo" defaultValue={projeto.proximo ?? ""} placeholder="Próximo passo que move o dinheiro" className="field" />
            <select name="status" className="field" defaultValue={projeto.status}>
              <option value="aberto">Aberto</option>
              <option value="pausado">Pausado</option>
              <option value="concluido">Concluído</option>
            </select>
            <button type="submit" className="btn w-fit">
              Guardar
            </button>
          </form>
          <Excluir
            id={projeto.id}
            pergunta={`Excluir projeto ${projeto.nome}?`}
            impacto={`Tem ${impacto.tarefas} tarefas e ${impacto.eventos} eventos ligados. Eles ficam, sem este projeto.`}
            action={excluirProjeto}
          />
        </div>
      ) : null}
    </main>
  );
}
