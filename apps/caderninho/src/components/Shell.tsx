"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback } from "react";
import { BarChart3, CalendarDays, CalendarRange, Contact, FolderKanban, Kanban, LogOut, UsersRound } from "lucide-react";

import { sair } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { ChatMesa } from "@/components/ChatMesa";
import { Logo } from "@/components/Logo";
import { Paleta } from "@/components/Paleta";
import { Toaster } from "@/components/Toast";
import { TemaToggle } from "@/components/TemaToggle";

const NAV = [
  ["Hoje", "/hoje", CalendarDays],
  ["Pipeline", "/pipeline", Kanban],
  ["Projetos", "/projetos", FolderKanban],
  ["Clientes", "/clientes", Contact],
  ["Agenda", "/agenda", CalendarRange],
  ["Equipe", "/equipe", UsersRound],
  ["Números", "/relatorio", BarChart3],
] as const;

function ShellInner({
  nome,
  funcao,
  euId,
  pessoas,
  projetos,
  rotina,
  emCampo,
  children,
}: {
  nome: string;
  funcao: string;
  euId: string;
  pessoas: { id: string; nome: string; funcao: string; tipo: string }[];
  projetos: { id: string; nome: string }[];
  rotina: boolean;
  emCampo: { id: string; titulo: string; nome: string }[];
  children: React.ReactNode;
}) {
  const path = usePathname();
  const busca = useSearchParams();
  const router = useRouter();
  const full = path.startsWith("/quadro") || busca.get("aba") === "quadro";
  const onNovo = useCallback(
    (tipo: "cliente" | "tarefa" | "evento") => {
      if (tipo === "cliente") {
        router.push("/clientes");
      }
      if (tipo === "tarefa") {
        router.push("/hoje");
      }
      if (tipo === "evento") {
        router.push("/agenda");
      }
    },
    [router],
  );

  return (
    <div className="relative z-10 flex min-h-full">
      <aside className="sticky top-0 flex h-screen w-[4.9rem] shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--rail)_88%,transparent)] px-2 py-5 backdrop-blur-md lg:w-[16.5rem] lg:px-4">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Link href="/hoje" className="block px-1">
            <Logo size={36} />
          </Link>
          <p className="mt-3 hidden px-1 text-[0.68rem] font-semibold tracking-[0.22em] text-[var(--gold)] uppercase lg:block">
            Escritório
          </p>
          <nav className="mt-6 grid gap-1">
            {NAV.map(([label, href, Icon]) => {
              const on =
                path === href ||
                path.startsWith(`${href}/`) ||
                (href === "/hoje" && path.startsWith("/tarefas/")) ||
                (href === "/projetos" && path.startsWith("/quadro"));
              return (
                <Link key={href} href={href} className={`rail-link justify-center lg:justify-start ${on ? "on" : ""}`} title={label}>
                  <Icon size={18} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
          {projetos.length > 0 ? (
            <div className="mt-8 hidden lg:block">
              <p className="px-2 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
                Mesas
              </p>
              {projetos.map((p) => (
                <Link
                  key={p.id}
                  href={`/projetos/${p.id}`}
                  className={`side-proj ${path === `/projetos/${p.id}` ? "on" : ""}`}
                >
                  {p.nome}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-3">
          <div className="hidden items-center gap-2 px-1 text-xs text-[var(--mute)] lg:flex">
            <span className={`live ${rotina ? "" : "off"}`} />
            {rotina ? (emCampo.length ? `${emCampo.length} Grok em campo` : "Rotina ligada") : "Grok dormindo"}
          </div>
          <div className="flex items-center gap-3 px-1">
            <Avatar nome={nome} size={36} />
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold">{nome}</p>
              <p className="truncate text-xs text-[var(--mute)]">{funcao}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 px-1 lg:flex-row">
            <TemaToggle />
            <ChatMesa euId={euId} pessoas={pessoas} />
            <form action={sair}>
              <button type="submit" className="icon-btn" title="Sair da conta">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={full ? "min-w-0 flex-1 p-3" : "min-w-0 flex-1 px-5 py-6 lg:px-10 lg:py-9"}>{children}</div>
      </div>
      <Toaster />
      <Paleta euId={euId} onNovo={onNovo} />
    </div>
  );
}

export function Shell(props: {
  nome: string;
  funcao: string;
  euId: string;
  pessoas: { id: string; nome: string; funcao: string; tipo: string }[];
  projetos: { id: string; nome: string }[];
  rotina: boolean;
  emCampo: { id: string; titulo: string; nome: string }[];
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-full" />}>
      <ShellInner {...props} />
    </Suspense>
  );
}
