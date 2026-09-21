import Link from "next/link";
import { notFound } from "next/navigation";

import { Sala } from "@/components/Sala";
import { lerExtra } from "@/lib/cliente-extra";
import { STATUS_CLIENTE } from "@/lib/datas";
import { prisma } from "@/lib/prisma";

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || cliente.deletedAt) {
    notFound();
  }

  const extra = lerExtra(cliente.extra);
  const linha = [extra.cargo, extra.empresa, cliente.contato || extra.email || extra.telefone].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <header className="grid gap-5">
        <div>
          <p className="kicker">
            <Link href="/clientes" className="text-[var(--gold)]">
              Clientes
            </Link>
            {` · ${STATUS_CLIENTE[cliente.status] ?? cliente.status}`}
          </p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{cliente.nome}</h1>
          {linha ? <p className="mt-3 text-[var(--mute)]">{linha}</p> : null}
        </div>
        <Sala
          base={`/clientes/${id}`}
          itens={[
            ["Pessoa", ""],
            ["Ficha", "/ficha"],
          ]}
        />
      </header>
      {children}
    </div>
  );
}
