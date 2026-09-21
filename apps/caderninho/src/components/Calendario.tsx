"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  concluirEvento,
  criarEvento,
  duplicarEvento,
  excluirEvento,
  eventosDoPeriodo,
  moverEvento,
  tarefaDeEvento,
  atualizarEvento,
} from "@/app/actions";
import { toast } from "@/components/Toast";
import { adicionarDias, chaveDia, diasDoMes, instanteSp, nomeMes } from "@/lib/datas";
import { TIPOS_EVENTO } from "@/lib/evento";

type Item = Awaited<ReturnType<typeof eventosDoPeriodo>>[number];
type Vista = "mes" | "semana" | "dia" | "agenda";
type Pessoa = { id: string; nome: string };
type Nomeado = { id: string; nome: string };

const SEM = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const HORAS = Array.from({ length: 14 }, (_, i) => i + 7);

function ymd(d: Date) {
  return chaveDia(d);
}

export function Calendario({
  inicial,
  deInicial,
  pessoas,
  clientes,
  projetos,
  euId,
}: {
  inicial: Item[];
  deInicial: string;
  pessoas: Pessoa[];
  clientes: Nomeado[];
  projetos: Nomeado[];
  euId: string;
}) {
  const hoje = ymd(new Date());
  const [ancora, setAncora] = useState(deInicial.slice(0, 7) + "-01");
  const [vista, setVista] = useState<Vista>("mes");
  const [dia, setDia] = useState(hoje);
  const [itens, setItens] = useState(inicial);
  const [userId, setUserId] = useState("");
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [sel, setSel] = useState<Item | null>(null);
  const [criar, setCriar] = useState<{ dia: string; inicio?: string; fim?: string } | null>(null);
  const [editar, setEditar] = useState<Item | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const [y, m] = ancora.split("-").map(Number);
  const grade = useMemo(() => diasDoMes(y, m), [y, m]);
  const de = vista === "dia" ? dia : vista === "semana" ? semanaDe(dia) : grade[0];
  const ate = vista === "dia" ? dia : vista === "semana" ? adicionarDias(semanaDe(dia), 6) : grade[grade.length - 1];

  useEffect(() => {
    start(async () => {
      const lista = await eventosDoPeriodo(de, ate, { userId: userId || undefined, q: q || undefined });
      setItens(lista);
    });
  }, [de, ate, userId, q]);

  const visiveis = itens.filter((i) => (!tipo ? true : i.tipo === tipo) && i.status !== "cancelado");
  const porDia = (d: string) => visiveis.filter((i) => i.dia === d);

  function irHoje() {
    setDia(hoje);
    setAncora(`${hoje.slice(0, 7)}-01`);
    if (vista === "mes") {
      setVista("dia");
    }
  }

  function abrirDia(d: string) {
    setDia(d);
    setVista("dia");
  }

  async function drop(item: Item, novoDia: string) {
    if (item.origem !== "evento") {
      toast("Tarefa e prazo de projeto não arrastam. Abre a ficha.", "erro");
      return;
    }
    const before = itens;
    setItens((xs) => xs.map((x) => (x.id === item.id ? { ...x, dia: novoDia } : x)));
    const r = await moverEvento({ id: item.eventoId, dia: novoDia, diaOrigem: item.dia });
    if (!r.ok) {
      setItens(before);
      toast(r.erro, "erro");
      return;
    }
    toast("Movido.");
    router.refresh();
  }

  return (
    <div className="cal">
      <header className="cal-bar">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="kicker">Calendário</p>
            <h1 className="display mt-1 text-4xl capitalize">{nomeMes(ancora)}</h1>
          </div>
          <div className="flex flex-wrap gap-1">
            <button type="button" className="pill" onClick={() => setAncora(somarMes(ancora, -1))}>
              ←
            </button>
            <button type="button" className="pill" onClick={irHoje}>
              Hoje
            </button>
            <button type="button" className="pill" onClick={() => setAncora(somarMes(ancora, 1))}>
              →
            </button>
            {(["mes", "semana", "dia", "agenda"] as Vista[]).map((v) => (
              <button key={v} type="button" className={`pill ${vista === v ? "on" : ""}`} onClick={() => setVista(v)}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <select className="field w-auto" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Todos</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <select className="field w-auto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Tipo</option>
            {TIPOS_EVENTO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <input className="field max-w-xs" placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="btn" onClick={() => setCriar({ dia, inicio: "09:00", fim: "10:00" })}>
            + Evento
          </button>
        </div>
        {pending ? <p className="mt-2 text-xs text-[var(--mute)]">Atualizando…</p> : null}
      </header>

      <div className="cal-body">
        <aside className="cal-mini hidden lg:block">
          <Mini ancora={ancora} hoje={hoje} sel={vista === "dia" ? dia : ""} onPick={abrirDia} onMes={setAncora} />
        </aside>
        <div className="min-w-0">
          {vista === "mes" ? (
            <Mes grade={grade} ancora={ancora} hoje={hoje} porDia={porDia} onDia={abrirDia} onDrop={drop} onNovo={(d) => setCriar({ dia: d })} onItem={setSel} />
          ) : null}
          {vista === "semana" ? (
            <Semana inicio={semanaDe(dia)} hoje={hoje} porDia={porDia} onDia={abrirDia} onSlot={(d, h) => setCriar({ dia: d, inicio: h, fim: horaMais(h, 1) })} onItem={setSel} />
          ) : null}
          {vista === "dia" ? (
            <Dia dia={dia} hoje={hoje} itens={porDia(dia)} onSlot={(h, h2) => setCriar({ dia, inicio: h, fim: h2 })} onItem={setSel} onResize={async (item, fim) => {
              const r = await moverEvento({ id: item.eventoId, dia: item.dia, inicio: hhmm(item.inicio), fim, diaOrigem: item.dia });
              if (!r.ok) toast(r.erro, "erro");
              else { toast("Duração guardada."); router.refresh(); }
            }} />
          ) : null}
          {vista === "agenda" ? (
            <Lista itens={visiveis} onItem={setSel} />
          ) : null}
        </div>
      </div>

      {sel ? (
        <Ficha
          item={sel}
          onClose={() => setSel(null)}
            onEdit={() => {
            setCriar({ dia: sel.dia, inicio: hhmm(sel.inicio), fim: hhmm(sel.fim) });
            setEditar(sel);
            setSel(null);
          }}
          onDup={async () => {
            const r = await duplicarEvento(sel.eventoId);
            if (!r.ok) toast(r.erro, "erro");
            else { toast("Cópia criada."); setSel(null); router.refresh(); }
          }}
          onDel={async () => {
            const r = await excluirEvento({ id: sel.eventoId, escopo: "este", dia: sel.dia });
            if (!r.ok) toast(r.erro, "erro");
            else { toast("Excluído."); setSel(null); router.refresh(); }
          }}
          onOk={async () => {
            const r = await concluirEvento(sel.eventoId);
            if (!r.ok) toast(r.erro, "erro");
            else { toast("Atualizado."); router.refresh(); }
          }}
          onTarefa={async () => {
            const r = await tarefaDeEvento(sel.eventoId);
            if (!r.ok) toast(r.erro, "erro");
            else router.push(`/tarefas/${r.id}`);
          }}
        />
      ) : null}

      {criar ? (
        <DrawerEvento
          dia={criar.dia}
          inicio={criar.inicio}
          fim={criar.fim}
          item={editar}
          euId={euId}
          pessoas={pessoas}
          clientes={clientes}
          projetos={projetos}
          onClose={() => {
            setCriar(null);
            setEditar(null);
          }}
          onSave={async (fd) => {
            const r = editar ? await atualizarEvento(fd) : await criarEvento(fd);
            if (!r.ok) {
              toast(r.erro, "erro");
              return;
            }
            toast(editar ? "Evento atualizado." : "Evento criado.");
            setCriar(null);
            setEditar(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function semanaDe(dia: string) {
  const w = instanteSp(dia, "12:00").getUTCDay();
  const shift = (w + 6) % 7;
  return adicionarDias(dia, -shift);
}

function somarMes(ancora: string, n: number) {
  const [y, m] = ancora.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  return dt.toISOString().slice(0, 7) + "-01";
}

function hhmm(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
}

function horaMais(h: string, n: number) {
  const [hh, mm] = h.split(":").map(Number);
  const t = hh + n;
  return `${String(Math.min(t, 23)).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function Mini({
  ancora,
  hoje,
  sel,
  onPick,
  onMes,
}: {
  ancora: string;
  hoje: string;
  sel: string;
  onPick: (d: string) => void;
  onMes: (d: string) => void;
}) {
  const [y, m] = ancora.split("-").map(Number);
  const grade = diasDoMes(y, m);
  return (
    <div className="panel p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button type="button" onClick={() => onMes(somarMes(ancora, -1))}>←</button>
        <span className="capitalize">{nomeMes(ancora)}</span>
        <button type="button" onClick={() => onMes(somarMes(ancora, 1))}>→</button>
      </div>
      <div className="mini-grid">
        {SEM.map((s) => (
          <span key={s} className="mini-h">{s[0]}</span>
        ))}
        {grade.map((d) => (
          <button
            key={d}
            type="button"
            className={`mini-d ${d.slice(0, 7) !== ancora.slice(0, 7) ? "mute" : ""} ${d === hoje ? "hoje" : ""} ${d === sel ? "sel" : ""}`}
            onClick={() => onPick(d)}
          >
            {Number(d.slice(8))}
          </button>
        ))}
      </div>
    </div>
  );
}

function Mes({
  grade,
  ancora,
  hoje,
  porDia,
  onDia,
  onDrop,
  onNovo,
  onItem,
}: {
  grade: string[];
  ancora: string;
  hoje: string;
  porDia: (d: string) => Item[];
  onDia: (d: string) => void;
  onDrop: (i: Item, d: string) => void;
  onNovo: (d: string) => void;
  onItem: (i: Item) => void;
}) {
  return (
    <div className="mes">
      {SEM.map((s) => (
        <div key={s} className="mes-h">{s}</div>
      ))}
      {grade.map((d) => {
        const lista = porDia(d);
        const extra = lista.length > 3 ? lista.length - 3 : 0;
        return (
          <div
            key={d}
            className={`mes-cell ${d.slice(0, 7) !== ancora.slice(0, 7) ? "fora" : ""} ${d === hoje ? "hoje" : ""}`}
            onClick={() => onDia(d)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onNovo(d);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("text/mai-evento");
              if (raw) {
                onDrop(JSON.parse(raw) as Item, d);
              }
            }}
          >
            <span className="mes-n">{Number(d.slice(8))}</span>
            {lista.slice(0, 3).map((i) => (
              <button
                key={i.id}
                type="button"
                draggable={i.origem === "evento"}
                className="mes-ev"
                style={{ borderLeftColor: i.cor }}
                onClick={(e) => {
                  e.stopPropagation();
                  onItem(i);
                }}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/mai-evento", JSON.stringify(i));
                }}
              >
                {i.titulo}
              </button>
            ))}
            {extra ? <span className="mes-more">+{extra}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function Semana({
  inicio,
  hoje,
  porDia,
  onDia,
  onSlot,
  onItem,
}: {
  inicio: string;
  hoje: string;
  porDia: (d: string) => Item[];
  onDia: (d: string) => void;
  onSlot: (d: string, h: string) => void;
  onItem: (i: Item) => void;
}) {
  const dias = Array.from({ length: 7 }, (_, i) => adicionarDias(inicio, i));
  return (
    <div className="semana">
      <div />
      {dias.map((d) => (
        <button key={d} type="button" className={`sem-h ${d === hoje ? "hoje" : ""}`} onClick={() => onDia(d)}>
          {Number(d.slice(8))}
        </button>
      ))}
      {HORAS.map((h) => (
        <div key={h} className="sem-linha contents">
          <div className="sem-hora">{String(h).padStart(2, "0")}:00</div>
          {dias.map((d) => {
            const slot = `${String(h).padStart(2, "0")}:00`;
            const aqui = porDia(d).filter((i) => !i.diaInteiro && Number(hhmm(i.inicio).slice(0, 2)) === h);
            return (
              <div key={`${d}${h}`} className="sem-cell" onClick={() => onSlot(d, slot)}>
                {aqui.map((i) => (
                  <button key={i.id} type="button" className="mes-ev" style={{ borderLeftColor: i.cor }} onClick={(e) => { e.stopPropagation(); onItem(i); }}>
                    {i.titulo}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Dia({
  dia,
  hoje,
  itens,
  onSlot,
  onItem,
  onResize,
}: {
  dia: string;
  hoje: string;
  itens: Item[];
  onSlot: (h: string, h2: string) => void;
  onItem: (i: Item) => void;
  onResize: (i: Item, fim: string) => void;
}) {
  const allDay = itens.filter((i) => i.diaInteiro);
  const timed = itens.filter((i) => !i.diaInteiro);
  const [drag, setDrag] = useState<string | null>(null);
  return (
    <div>
      <p className="mb-3 text-sm text-[var(--mute)]">
        {instanteSp(dia, "12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        {dia === hoje ? " · hoje" : ""}
      </p>
      {allDay.length ? (
        <div className="mb-4 grid gap-1">
          {allDay.map((i) => (
            <button key={i.id} type="button" className="mes-ev" style={{ borderLeftColor: i.cor }} onClick={() => onItem(i)}>
              {i.titulo} · {i.tipo}
            </button>
          ))}
        </div>
      ) : null}
      <div className="dia-grid">
        {HORAS.map((h) => {
          const slot = `${String(h).padStart(2, "0")}:00`;
          const aqui = timed.filter((i) => Number(hhmm(i.inicio).slice(0, 2)) === h);
          return (
            <div
              key={h}
              className="dia-row"
              onMouseDown={() => setDrag(slot)}
              onMouseUp={() => {
                if (drag) onSlot(drag, horaMais(slot, 1));
                setDrag(null);
              }}
            >
              <span className="sem-hora">{slot}</span>
              <div className="dia-track">
                {aqui.map((i) => (
                  <div key={i.id} className="dia-ev" style={{ borderLeftColor: i.cor }}>
                    <button type="button" onClick={() => onItem(i)}>
                      {hhmm(i.inicio)}–{hhmm(i.fim)} {i.titulo}
                    </button>
                    {i.origem === "evento" ? (
                      <input
                        type="time"
                        defaultValue={hhmm(i.fim)}
                        className="resize-h"
                        onBlur={(e) => onResize(i, e.target.value)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Lista({ itens, onItem }: { itens: Item[]; onItem: (i: Item) => void }) {
  const ordem = [...itens].sort((a, b) => a.inicio.localeCompare(b.inicio));
  if (ordem.length === 0) {
    return <p className="text-[var(--mute)]">Nada neste período.</p>;
  }
  return (
    <div className="grid gap-2">
      {ordem.map((i) => (
        <button key={i.id} type="button" className="link-card text-left" onClick={() => onItem(i)}>
          <p className="text-xs text-[var(--mute)]">{i.dia} · {i.diaInteiro ? "dia inteiro" : `${hhmm(i.inicio)}–${hhmm(i.fim)}`}</p>
          <p className="mt-1 font-medium">{i.titulo}</p>
          <p className="mt-1 text-sm text-[var(--mute)]">{i.dono} {i.cliente ? `· ${i.cliente}` : ""}</p>
        </button>
      ))}
    </div>
  );
}

function Ficha({
  item,
  onClose,
  onEdit,
  onDup,
  onDel,
  onOk,
  onTarefa,
}: {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
  onDup: () => void;
  onDel: () => void;
  onOk: () => void;
  onTarefa: () => void;
}) {
  return (
    <div className="drawer-bg" onClick={onClose}>
      <div className="drawer panel p-5" onClick={(e) => e.stopPropagation()}>
        <p className="kicker">{item.tipo}</p>
        <h2 className="display mt-2 text-3xl">{item.titulo}</h2>
        <p className="mt-2 text-sm text-[var(--mute)]">
          {item.diaInteiro ? "Dia inteiro" : `${hhmm(item.inicio)} – ${hhmm(item.fim)}`} · {item.dono}
        </p>
        {item.cliente ? (
          <p className="mt-3 text-sm">
            Cliente:{" "}
            {item.clienteId ? <Link href={`/clientes/${item.clienteId}`}>{item.cliente}</Link> : item.cliente}
            {item.contato ? ` · ${item.contato}` : ""}
          </p>
        ) : null}
        {item.local ? <p className="mt-2 text-sm">{item.local}</p> : null}
        {item.descricao ? <p className="mt-3 text-sm text-[var(--mute)]">{item.descricao}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {item.origem === "evento" ? (
            <>
              <button type="button" className="btn" onClick={onEdit}>Editar</button>
              <button type="button" className="btn-ghost" onClick={onOk}>{item.status === "feito" ? "Reabrir" : "Concluir"}</button>
              <button type="button" className="btn-ghost" onClick={onDup}>Duplicar</button>
              <button type="button" className="btn-ghost" onClick={onTarefa}>Criar tarefa</button>
              <button type="button" className="btn-ghost text-[var(--danger)]" onClick={onDel}>Excluir</button>
            </>
          ) : item.link ? (
            <Link href={item.link} className="btn">Abrir</Link>
          ) : null}
          <button type="button" className="btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

function DrawerEvento({
  dia,
  inicio,
  fim,
  item,
  euId,
  pessoas,
  clientes,
  projetos,
  onClose,
  onSave,
}: {
  dia: string;
  inicio?: string;
  fim?: string;
  item: Item | null;
  euId: string;
  pessoas: Pessoa[];
  clientes: Nomeado[];
  projetos: Nomeado[];
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  const serie = Boolean(item?.serie);
  return (
    <div className="drawer-bg" onClick={onClose}>
      <form
        className="drawer panel grid gap-3 p-5"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(() => onSave(fd));
        }}
      >
        <p className="kicker">{item ? "Editar" : "Novo evento"}</p>
        {item ? <input type="hidden" name="id" value={item.eventoId} /> : null}
        <input type="hidden" name="diaOrigem" value={item?.dia ?? dia} />
        <input name="titulo" required defaultValue={item?.titulo ?? ""} placeholder="Título" className="field" />
        <textarea name="descricao" rows={2} defaultValue={item?.descricao ?? ""} placeholder="Descrição" className="field" />
        <input name="dia" type="date" defaultValue={item?.dia ?? dia} className="field" />
        <label className="flex items-center gap-2 text-sm">
          <input name="diaInteiro" type="checkbox" value="sim" defaultChecked={item?.diaInteiro} /> Dia inteiro
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input name="inicio" type="time" defaultValue={inicio ?? (item ? hhmm(item.inicio) : "09:00")} className="field" />
          <input name="fim" type="time" defaultValue={fim ?? (item ? hhmm(item.fim) : "10:00")} className="field" />
        </div>
        <select name="userId" className="field" defaultValue={item?.userId || euId}>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <select name="clienteId" className="field" defaultValue={item?.clienteId ?? ""}>
          <option value="">Sem cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select name="projetoId" className="field" defaultValue={item?.projetoId ?? ""}>
          <option value="">Sem projeto</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <select name="tipo" className="field" defaultValue={item?.tipo ?? "reuniao"}>
          {TIPOS_EVENTO.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <input name="local" defaultValue={item?.local ?? ""} placeholder="Local" className="field" />
        <input name="link" defaultValue={item?.link ?? ""} placeholder="Link" className="field" />
        <select name="recorrencia" className="field" defaultValue="">
          <option value="">Sem repetir</option>
          <option value="diaria">Todos os dias</option>
          <option value="uteis">Dias úteis</option>
          <option value="semanal">Semanal</option>
          <option value="quinzenal">Quinzenal</option>
          <option value="mensal">Mensal</option>
          <option value="anual">Anual</option>
        </select>
        <input name="recUntil" type="date" className="field" />
        {serie ? (
          <select name="escopo" className="field" defaultValue="serie">
            <option value="este">Somente este</option>
            <option value="futuro">Este e os próximos</option>
            <option value="serie">Toda a série</option>
          </select>
        ) : null}
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>{pending ? "Salvando…" : "Guardar"}</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

