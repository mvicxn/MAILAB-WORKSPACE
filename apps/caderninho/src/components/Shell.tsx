"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Bell,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Contact,
  FolderKanban,
  Kanban,
  ListChecks,
  LogOut,
  Newspaper,
  UsersRound,
  Wrench,
} from "lucide-react";

import { pulso, sair } from "@/app/actions";
import { Avatar } from "@/components/Avatar";
import { ChatMesa } from "@/components/ChatMesa";
import { Logo } from "@/components/Logo";
import { Paleta } from "@/components/Paleta";
import { Toaster } from "@/components/Toast";
import { TemaToggle } from "@/components/TemaToggle";

const GRUPOS = [
  {
    nome: "Dia",
    itens: [
      ["Hoje", "/hoje", CalendarDays],
      ["Avisos", "/avisos", Bell],
      ["Tarefas", "/tarefas", ListChecks],
      ["Agenda", "/agenda", CalendarRange],
    ],
  },
  {
    nome: "Casa",
    itens: [
      ["Pipeline", "/pipeline", Kanban],
      ["Projetos", "/projetos", FolderKanban],
      ["Clientes", "/clientes", Contact],
    ],
  },
  {
    nome: "Sala",
    itens: [
      ["News", "/news", Newspaper],
      ["Equipe", "/equipe", UsersRound],
      ["Manutenção", "/manutencao", Wrench],
      ["Números", "/relatorio", BarChart3],
    ],
  },
] as const;

function ativo(path: string, href: string) {
  if (href === "/hoje") {
    return path === "/hoje";
  }
  if (href === "/projetos") {
    return path.startsWith("/projetos") || path.startsWith("/quadro");
  }
  if (href === "/tarefas") {
    return path.startsWith("/tarefas");
  }
  if (href === "/clientes") {
    return path.startsWith("/clientes");
  }
  if (href === "/manutencao") {
    return path.startsWith("/manutencao") || path.startsWith("/ponte");
  }
  return path === href || path.startsWith(`${href}/`);
}

type Pessoa = { id: string; nome: string; funcao: string; tipo: string; vistoAt?: string | null };

function ShellInner({
  nome,
  funcao,
  euId,
  pessoas,
  projetos,
  rotina,
  emCampo,
  newsNovas,
  avisosNovos,
  children,
}: {
  nome: string;
  funcao: string;
  euId: string;
  pessoas: Pessoa[];
  projetos: { id: string; nome: string }[];
  rotina: boolean;
  emCampo: { id: string; titulo: string; nome: string; assigneeId?: string }[];
  newsNovas: number;
  avisosNovos: number;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const full = path.includes("/quadro");
  const [visto, setVisto] = useState<Record<string, string | null>>(() => {
    const m: Record<string, string | null> = {};
    for (const p of pessoas) {
      m[p.id] = p.vistoAt ?? null;
    }
    return m;
  });
  const campoIds = emCampo.map((e) => e.assigneeId).filter((id): id is string => Boolean(id));
  const onNovo = useCallback(
    (tipo: "cliente" | "tarefa" | "evento" | "projeto") => {
      if (tipo === "cliente") {
        router.push("/clientes/novo");
      }
      if (tipo === "tarefa") {
        router.push("/tarefas/nova");
      }
      if (tipo === "evento") {
        router.push("/agenda");
      }
      if (tipo === "projeto") {
        router.push("/projetos/novo");
      }
    },
    [router],
  );

  useEffect(() => {
    let viva = true;
    async function tick() {
      const r = await pulso();
      if (!viva || !r.ok) {
        return;
      }
      setVisto(r.visto);
    }
    void tick();
    const t = setInterval(() => void tick(), 25000);
    return () => {
      viva = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="relative z-10 flex min-h-full">
      <aside className="rail sticky top-0 flex h-screen w-[4.9rem] shrink-0 flex-col justify-between overflow-hidden px-2 py-5 lg:w-[16.75rem] lg:px-4">
        <div className="rail-scroll min-h-0 flex-1 overflow-y-auto">
          <Link href="/hoje" className="block px-1">
            <Logo size={34} marca />
          </Link>
          <p className="mt-4 hidden px-1 text-[0.62rem] font-semibold tracking-[0.2em] text-[var(--rail-mute)] uppercase lg:block">
            Escritório
          </p>
          <nav className="mt-6">
            {GRUPOS.map((g) => (
              <div key={g.nome} className="nav-grupo">
                <p className="nav-grupo-nome">{g.nome}</p>
                <div className="grid gap-0.5">
                  {g.itens.map(([label, href, Icon]) => {
                    const on = ativo(path, href);
                    const ping =
                      (href === "/news" && newsNovas > 0 && path !== "/news") ||
                      (href === "/avisos" && avisosNovos > 0 && path !== "/avisos");
                    return (
                      <Link key={href} href={href} className={`rail-link justify-center lg:justify-start ${on ? "on" : ""}`} title={label}>
                        <span className="relative">
                          <Icon size={18} />
                          {ping ? <span className="rail-dot" /> : null}
                        </span>
                        <span className="hidden lg:inline">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          {projetos.length > 0 ? (
            <div className="mt-7 hidden lg:block">
              <p className="nav-grupo-nome">Mesas abertas</p>
              {projetos.map((p) => (
                <Link
                  key={p.id}
                  href={`/projetos/${p.id}`}
                  className={`side-proj ${path.startsWith(`/projetos/${p.id}`) ? "on" : ""}`}
                >
                  {p.nome}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-3">
          <Link href="/manutencao" className="hidden items-center gap-2 px-1 text-xs text-[var(--rail-mute)] lg:flex">
            <span className={`live ${rotina ? "" : "off"}`} />
            {rotina ? (emCampo.length ? `${emCampo.length} Grok em campo` : "Carlos ligado") : "Carlos sem ligação"}
          </Link>
          <div className="flex items-center gap-3 px-1">
            <Avatar nome={nome} size={36} />
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">{nome}</p>
              <p className="truncate text-xs text-[var(--rail-mute)]">{funcao}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 px-1 lg:flex-row">
            <TemaToggle />
            <ChatMesa euId={euId} pessoas={pessoas} visto={visto} campoIds={campoIds} rotina={rotina} />
            <form action={sair}>
              <button type="submit" className="icon-btn" title="Sair da conta">
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={full ? "min-w-0 flex-1 p-3" : "min-w-0 flex-1 px-5 py-8 lg:px-12 lg:py-10"}>{children}</div>
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
  pessoas: Pessoa[];
  projetos: { id: string; nome: string }[];
  rotina: boolean;
  emCampo: { id: string; titulo: string; nome: string; assigneeId?: string }[];
  newsNovas: number;
  avisosNovos: number;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-full" />}>
      <ShellInner {...props} />
    </Suspense>
  );
}
