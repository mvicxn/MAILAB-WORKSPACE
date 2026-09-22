import { vivo } from "@/lib/casa";
import { atrasada, concluida, riscoAtraso } from "@/lib/datas";
import { ehHumano } from "@/lib/equipe";
import { rotinaMailabLigada } from "@/lib/grok-ponte";
import { contarNewsNovas } from "@/lib/news";
import { prisma } from "@/lib/prisma";

export type Aviso = {
  id: string;
  tipo: "atraso" | "risco" | "tarefa" | "news" | "grok" | "rotina" | "cliente";
  nivel: "urgente" | "atencao" | "info";
  titulo: string;
  texto: string;
  href: string;
};

export async function listarAvisos(user: { id: string; papel: string; tipo: string }) {
  const socio = ehHumano(user.papel, user.tipo);
  const [tarefas, newsNovas, rotina, prospeccao] = await Promise.all([
    prisma.tarefa.findMany({
      where: { ...vivo },
      include: { assignee: true, projeto: true },
      orderBy: [{ prazo: "asc" }, { updatedAt: "desc" }],
    }),
    contarNewsNovas(user.id),
    socio ? rotinaMailabLigada() : Promise.resolve(true),
    prisma.cliente.findMany({
      where: { ...vivo, status: "prospeccao" },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const avisos: Aviso[] = [];
  const abertas = tarefas.filter((t) => !concluida(t.status));
  const atrasos = abertas.filter((t) => atrasada(t.status, t.prazo));
  const riscos = abertas.filter((t) => riscoAtraso(t.status, t.prazo));
  const minhas = abertas.filter((t) => t.assigneeId === user.id);
  const campo = abertas.filter((t) => t.assignee.tipo === "ia" && t.acionadoAt);

  for (const t of atrasos) {
    avisos.push({
      id: `atraso-${t.id}`,
      tipo: "atraso",
      nivel: "urgente",
      titulo: t.titulo,
      texto: `Atraso · ${t.assignee.nome}${t.projeto ? ` · ${t.projeto.nome}` : ""}`,
      href: `/tarefas/${t.id}`,
    });
  }
  for (const t of riscos) {
    avisos.push({
      id: `risco-${t.id}`,
      tipo: "risco",
      nivel: "atencao",
      titulo: t.titulo,
      texto: `Pode atrasar · ${t.assignee.nome}${t.projeto ? ` · ${t.projeto.nome}` : ""}`,
      href: `/tarefas/${t.id}`,
    });
  }
  for (const t of minhas.filter((x) => !atrasada(x.status, x.prazo) && !riscoAtraso(x.status, x.prazo))) {
    avisos.push({
      id: `minha-${t.id}`,
      tipo: "tarefa",
      nivel: "info",
      titulo: t.titulo,
      texto: `No seu nome${t.projeto ? ` · ${t.projeto.nome}` : ""}`,
      href: `/tarefas/${t.id}`,
    });
  }
  if (newsNovas > 0) {
    avisos.push({
      id: "news",
      tipo: "news",
      nivel: "info",
      titulo: newsNovas === 1 ? "1 news sem ler" : `${newsNovas} news sem ler`,
      texto: "Git da casa e o que o Carlos viu no mundo.",
      href: "/news",
    });
  }
  for (const t of campo) {
    avisos.push({
      id: `grok-${t.id}`,
      tipo: "grok",
      nivel: "info",
      titulo: `${t.assignee.nome} em campo`,
      texto: t.titulo,
      href: `/tarefas/${t.id}`,
    });
  }
  if (socio && !rotina) {
    avisos.push({
      id: "rotina",
      tipo: "rotina",
      nivel: "atencao",
      titulo: "Carlos sem ligação neste PC",
      texto: "Falta o endereço da rotina. Sem isto ele não acorda.",
      href: "/manutencao",
    });
  }
  for (const c of prospeccao) {
    const falta = !c.proximo.trim()
      ? "sem próximo passo"
      : !c.contato.trim()
        ? "sem contato"
        : "em prospecção";
    if (!c.proximo.trim() || !c.contato.trim()) {
      avisos.push({
        id: `cli-${c.id}`,
        tipo: "cliente",
        nivel: "atencao",
        titulo: c.nome,
        texto: `Prospecção · ${falta}`,
        href: `/clientes/${c.id}`,
      });
    }
  }

  const peso = { urgente: 0, atencao: 1, info: 2 };
  avisos.sort((a, b) => peso[a.nivel] - peso[b.nivel]);
  return avisos;
}

export async function contarAvisos(user: { id: string; papel: string; tipo: string }) {
  const lista = await listarAvisos(user);
  return lista.filter((a) => a.nivel !== "info" || a.tipo === "tarefa" || a.tipo === "news").length;
}
