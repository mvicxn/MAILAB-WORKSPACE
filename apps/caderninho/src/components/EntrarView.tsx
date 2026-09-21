"use client";

import { useActionState } from "react";

import { entrar, type EstadoLogin } from "@/app/actions";
import { Logo } from "@/components/Logo";
import { TemaToggle } from "@/components/TemaToggle";

const inicial: EstadoLogin = {};

export function EntrarView() {
  const [estado, action, pendente] = useActionState(entrar, inicial);

  return (
    <main className="relative z-10 grid min-h-full lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden px-16 py-14 lg:flex">
        <Logo size={52} />
        <div className="max-w-xl">
          <p className="kicker">MAI LAB CORP</p>
          <h1 className="display mt-5 text-7xl leading-[0.95]">
            Dois sócios.
            <br />
            Um estúdio.
            <br />
            Trabalho que cobra.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-[var(--mute)]">
            Projetos, prazo, valor e o time Grok na mesma mesa. Ian e Maicon decidem.
            A casa executa.
          </p>
        </div>
        <p className="text-xs tracking-[0.22em] text-[var(--mute)] uppercase">Escritório interno · São Paulo</p>
      </section>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="panel w-full max-w-[26.5rem] p-9">
          <div className="mb-8 flex items-center justify-between">
            <div className="lg:hidden">
              <Logo size={36} />
            </div>
            <span className="hidden lg:block" />
            <TemaToggle />
          </div>
          <p className="kicker">Acesso</p>
          <h2 className="display mt-2 text-4xl">Entrar</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">
            Conta da casa. Sócio ou Grok. Sem lista de nomes nesta tela.
          </p>

          <form action={action} className="mt-8 grid gap-4">
            <label className="grid gap-1.5 text-sm">
              Login
              <input
                name="login"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="field"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Senha
              <input
                name="senha"
                type="password"
                required
                autoComplete="current-password"
                className="field"
              />
            </label>
            {estado.erro ? (
              <p className="text-sm text-[var(--danger)]" role="alert">
                {estado.erro}
              </p>
            ) : null}
            <button className="btn mt-2" type="submit" disabled={pendente}>
              {pendente ? "Entrando…" : "Entrar no escritório"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
