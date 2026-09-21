import Link from "next/link";

import { criarCliente } from "@/app/actions";
import { Reveal } from "@/components/Reveal";
import { ehHumano } from "@/lib/equipe";
import { usuarioAtual } from "@/lib/auth";
import { STATUS_CLIENTE } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClientesPage() {
  const user = await usuarioAtual(prisma);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const clientes = await prisma.cliente.findMany({
    include: { projetos: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto grid max-w-4xl gap-8">
      <Reveal>
        <p className="kicker">Pessoas</p>
        <h1 className="display mt-3 text-5xl">Clientes</h1>
        <p className="mt-4 max-w-xl text-[var(--mute)]">
          Gente real. Lista vazia é honesta. Sem nome inventado.
        </p>
      </Reveal>

      {socio ? (
        <form action={criarCliente} className="panel grid gap-3 p-6">
          <p className="kicker">Abrir ficha</p>
          <input name="nome" required placeholder="Nome" className="field" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="contato" placeholder="Telefone ou e-mail" className="field" />
            <select name="status" className="field" defaultValue="conversando">
              <option value="conversando">Em conversa</option>
              <option value="proposta">Proposta</option>
              <option value="fechou">Fechado</option>
              <option value="ativo">Ativo</option>
              <option value="morreu">Encerrado</option>
            </select>
          </div>
          <input name="proximo" placeholder="Próximo passo" className="field" />
          <input name="tags" placeholder="Tags, separadas por vírgula" className="field" />
          <textarea name="notas" rows={2} placeholder="Notas" className="field" />
          <input type="hidden" name="tipo" value="lead" />
          <button type="submit" className="btn w-fit">
            Guardar pessoa
          </button>
        </form>
      ) : null}

      <section className="grid gap-3">
        {clientes.length === 0 ? (
          <div className="panel p-8">
            <p className="display text-2xl">Ninguém na lista.</p>
            <p className="mt-2 text-sm text-[var(--mute)]">Quando existir conversa de verdade, entra aqui.</p>
          </div>
        ) : (
          clientes.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className="link-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.nome}</p>
                  <p className="mt-1 text-sm text-[var(--mute)]">
                    {c.contato || "Sem contato"} · {c.projetos.length} projeto
                    {c.proximo ? ` · ${c.proximo}` : ""}
                  </p>
                  {c.tags.length ? (
                    <p className="mt-2 flex flex-wrap gap-1">
                      {c.tags.map((x) => (
                        <span key={x.tagId} className="chip gold">
                          {x.tag.nome}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
                <span className="chip">{STATUS_CLIENTE[c.status] ?? c.status}</span>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
