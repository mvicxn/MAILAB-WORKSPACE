import { desativarPessoa } from "@/app/actions";
import { formAction } from "@/lib/form-action";
import { Acionar } from "@/components/Acionar";
import { Avatar } from "@/components/Avatar";
import { Contratar } from "@/app/(app)/equipe/Contratar";
import { Reveal } from "@/components/Reveal";
import { usuarioAtual } from "@/lib/auth";
import { CARGOS, ehHumano } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { prisma } from "@/lib/prisma";

export default async function EquipePage() {
  const user = await usuarioAtual(prisma);
  const gente = await prisma.user.findMany({
    where: { ativo: true },
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
  });
  const socio = user ? ehHumano(user.papel, user.tipo) : false;
  const mailabLigada = socio ? await rotinaMailabLigada() : false;
  const socios = gente.filter((p) => p.tipo === "humano");
  const time = gente.filter((p) => p.tipo !== "humano");

  return (
    <main className="mx-auto grid max-w-4xl gap-10">
      <Reveal>
        <p className="kicker">Estúdio</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Equipe</h1>
        <p className="mt-4 max-w-xl text-[var(--mute)]">
          Dois sócios. Um Grok por função. Chat no canto. Trabalho na ficha.
        </p>
        <p className="mt-4 flex items-center gap-2 text-sm">
          <span className={`live ${mailabLigada ? "" : "off"}`} />
          {mailabLigada ? "Rotina MAI LAB ligada neste computador." : "Rotina MAI LAB ainda não está neste PC."}
        </p>
      </Reveal>

      <section className="grid gap-3">
        <h2 className="display text-3xl">Sócios</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {socios.map((p) => (
            <div key={p.id} className="panel flex items-center gap-4 p-5">
              <Avatar nome={p.nome} size={48} />
              <div>
                <p className="font-medium">{p.nome}</p>
                <p className="mt-1 text-sm text-[var(--mute)]">{p.funcao} · decide dinheiro, contrato e merge</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="display text-3xl">Grok</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {time.map((p) => {
            const cargo = CARGOS.find((c) => c.ficha === p.ficha);
            return (
              <div key={p.id} className="panel grid gap-4 p-5">
                <div className="flex items-start gap-4">
                  <Avatar nome={p.nome} tipo="ia" size={48} />
                  <div>
                    <p className="font-medium">{p.nome}</p>
                    <p className="mt-1 text-sm text-[var(--mute)]">{p.funcao}</p>
                  </div>
                </div>
                {cargo ? <p className="text-sm leading-relaxed text-[var(--mute)]">{cargo.mesa}</p> : null}
                {socio ? <Acionar userId={p.id} nome={p.nome} /> : null}
                {socio ? (
                  <form action={formAction(desativarPessoa)}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn-ghost text-sm text-[var(--danger)]">
                      Desativar
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {socio ? (
        <details>
          <summary className="cursor-pointer text-sm text-[var(--mute)]">Ponte do Grok Bot</summary>
          <div className="mt-4">
            <Contratar mailabLigada={mailabLigada} />
          </div>
        </details>
      ) : null}
    </main>
  );
}
