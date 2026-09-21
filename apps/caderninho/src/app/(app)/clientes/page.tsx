import Link from "next/link";

import { Pagina } from "@/components/Pagina";
import { Vazio } from "@/components/Vazio";
import { ehHumano } from "@/lib/equipe";
import { usuarioAtual } from "@/lib/auth";
import { STATUS_CLIENTE } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClientesPage() {
  const user = await usuarioAtual(prisma);
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const clientes = await prisma.cliente.findMany({
    where: { deletedAt: null },
    include: { projetos: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <Pagina
      kicker="Pessoas"
      titulo="Clientes"
      texto="Gente real. Lista vazia é honesta. Ficha e movimento ficam em salas separadas."
      acao={
        socio ? (
          <Link href="/clientes/novo" className="btn">
            Nova ficha
          </Link>
        ) : null
      }
    >
      {clientes.length === 0 ? (
        <Vazio
          titulo="Ninguém na lista."
          texto="Quando existir conversa de verdade, entra aqui."
          href={socio ? "/clientes/novo" : undefined}
          acao={socio ? "Abrir ficha" : undefined}
        />
      ) : (
        <section className="grid gap-3">
          {clientes.map((c) => (
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
          ))}
        </section>
      )}
    </Pagina>
  );
}
