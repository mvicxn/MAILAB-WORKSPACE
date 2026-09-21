"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { headers } from "next/headers";

import { autenticarCredencial, criarSessao, sairSessao, usuarioAtual } from "@/lib/auth";
import { guardarAnexo } from "@/lib/anexo";
import { fazerBackupLocal } from "@/lib/backup";
import { recortarPedido } from "@/lib/carlos";
import { contratarTimeNoBanco } from "@/lib/contratar";
import { montarBriefing } from "@/lib/despacho";
import { ehHumano } from "@/lib/equipe";
import { acordarGrok, cargoDaFicha, gravarRotinaMailab, hookDoCargo, urlDoEscritorio } from "@/lib/grok-ponte";
import { ipDoPedido, limparFalhasLogin, loginBloqueado, registrarFalhaLogin } from "@/lib/login-lock";
import { prisma } from "@/lib/prisma";
import { garantirSocios } from "@/lib/socios";
import { trilha, gravarTags } from "@/lib/trilha";
import { concluida, statusCanon } from "@/lib/datas";

function texto(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function eu() {
  const user = await usuarioAtual(prisma);
  if (!user) {
    redirect("/entrar");
  }
  return user;
}

export type EstadoLogin = { erro?: string };

export async function entrar(_prev: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  let userId = "";
  let nome = "";
  try {
    await garantirSocios();
    const login = texto(formData, "login");
    const senha = texto(formData, "senha");
    const ip = ipDoPedido(await headers());
    if (loginBloqueado(ip, login)) {
      return { erro: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
    }
    const user = await autenticarCredencial(login, senha);
    if (!user) {
      registrarFalhaLogin(ip, login);
      return { erro: "Login ou senha incorretos." };
    }
    limparFalhasLogin(ip, login);
    await criarSessao(user.id);
    userId = user.id;
    nome = user.nome;
  } catch {
    return { erro: "Falha no servidor. Tente de novo." };
  }
  if (userId) {
    await trilha({
      userId,
      tipo: "login",
      texto: `${nome} entrou no escritório`,
      acao: "login",
      entidade: "user",
      entidadeId: userId,
    });
  }
  redirect("/hoje");
}

export async function sair() {
  await sairSessao();
  redirect("/entrar");
}

async function acordarFuncionarioId(userId: string, tarefaId?: string, recado?: string) {
  const pessoa = await prisma.user.findUnique({ where: { id: userId } });
  if (!pessoa || pessoa.tipo !== "ia" || !pessoa.ficha) {
    return { ok: false as const, erro: "isso não é um Grok da mesa" };
  }
  const cargo = cargoDaFicha(pessoa.ficha);
  const hook = await hookDoCargo(pessoa.ficha);
  let tarefa_url: string | undefined;
  let tarefa_titulo: string | undefined;
  let briefing = recado || cargo?.entrega || `Trabalhe no MAI LAB como ${pessoa.nome}. Abra Hoje.`;
  if (tarefaId) {
    const t = await prisma.tarefa.findUnique({ where: { id: tarefaId } });
    tarefa_titulo = t?.titulo;
    tarefa_url = `${hook.escritorio}/tarefas/${tarefaId}`;
    briefing = await montarBriefing(tarefaId, recado || "");
    if (t && !concluida(t.status)) {
      await prisma.tarefa.update({
        where: { id: tarefaId },
        data: { acionadoAt: new Date(), status: "pendente" },
      });
    }
  }
  return acordarGrok({
    ficha: pessoa.ficha,
    email: pessoa.email,
    senha: hook.senha,
    nome: pessoa.nome,
    funcao: pessoa.funcao,
    mesa: cargo?.mesa ?? pessoa.funcao,
    escritorio_url: hook.escritorio,
    tarefa_id: tarefaId,
    tarefa_url,
    tarefa_titulo,
    entrega_url: `${hook.escritorio}/api/mesa/entrega`,
    recado: briefing,
  });
}

export async function acordarNaTarefa(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { ok: false as const, erro: "só sócio acorda o time" };
  }
  const tarefaId = texto(formData, "tarefaId");
  if (!tarefaId) {
    return { ok: false as const, erro: "falta a tarefa" };
  }
  const tarefa = await prisma.tarefa.findUnique({ where: { id: tarefaId } });
  if (!tarefa) {
    return { ok: false as const, erro: "tarefa sumiu" };
  }
  const r = await acordarFuncionarioId(tarefa.assigneeId, tarefa.id);
  revalidatePath(`/tarefas/${tarefaId}`);
  revalidatePath("/hoje");
  revalidatePath("/projetos");
  return r;
}

export async function acordarFuncionario(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { ok: false as const, erro: "só sócio acorda o time" };
  }
  const userId = texto(formData, "userId");
  if (!userId) {
    return { ok: false as const, erro: "falta a pessoa" };
  }
  return acordarFuncionarioId(
    userId,
    undefined,
        "Plantão. Abra Hoje, assuma as tarefas da sua mesa e registre o que fez no diário.",
  );
}

export async function acordarPlantao() {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { ok: false as const, erro: "só sócio acorda o time" };
  }
  const time = await prisma.user.findMany({ where: { tipo: "ia", ativo: true } });
  const resultados = [];
  for (const pessoa of time) {
    resultados.push({
      nome: pessoa.nome,
      ...(await acordarFuncionarioId(
        pessoa.id,
        undefined,
        "Plantão. Abra Hoje, assuma a mesa e registre no diário de cada tarefa.",
      )),
    });
  }
  return { ok: true as const, resultados };
}

export async function solicitarAoCarlos(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return;
  }
  const pedidoTexto = texto(formData, "texto");
  if (!pedidoTexto) {
    return;
  }
  const todoMundo = texto(formData, "todoMundo") === "sim";
  const recortes = recortarPedido(pedidoTexto, "", todoMundo);
  const carlos = await prisma.user.findFirst({ where: { ficha: "ceo" } });
  const time = await prisma.user.findMany({ where: { tipo: "ia", ativo: true } });
  const pedido = await prisma.pedido.create({
    data: {
      texto: pedidoTexto,
      todoMundo,
      criadorId: user.id,
    },
  });
  const prazo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const criadas: { assigneeId: string; tarefaId: string; recado: string }[] = [];
  for (const recorte of recortes) {
    const dono = time.find((p) => p.ficha === recorte.cargo.ficha);
    if (!dono) {
      continue;
    }
    const tarefa = await prisma.tarefa.create({
      data: {
        titulo: recorte.titulo,
        descricao: recorte.descricao,
        assigneeId: dono.id,
        criadorId: carlos?.id ?? user.id,
        pedidoId: pedido.id,
        prazo,
        estimativaMin: 60,
      },
    });
    criadas.push({
      assigneeId: dono.id,
      tarefaId: tarefa.id,
      recado: recorte.descricao,
    });
  }
  revalidatePath("/solicitar");
  revalidatePath("/tarefas");
  revalidatePath("/hoje");
  revalidatePath("/painel");
  after(() => {
    for (const item of criadas) {
      void acordarFuncionarioId(item.assigneeId, item.tarefaId, item.recado);
    }
  });
  redirect(`/solicitar/${pedido.id}`);
}

export async function salvarRotinaMailab(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { ok: false as const, erro: "só sócio grava a rotina" };
  }
  const url = texto(formData, "url");
  const key = texto(formData, "key");
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false as const, erro: "URL inválida." };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false as const, erro: "A URL da rotina precisa ser https." };
  }
  if (key.length < 8) {
    return { ok: false as const, erro: "Key curta demais." };
  }
  await gravarRotinaMailab(url, key);
  revalidatePath("/equipe");
  return { ok: true as const };
}

export async function contratarTime() {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { erro: "só sócio contrata o time" as const };
  }
  const resultado = await contratarTimeNoBanco();
  revalidatePath("/equipe");
  revalidatePath("/entrar");
  revalidatePath("/tarefas");
  revalidatePath("/hoje");
  revalidatePath("/painel");
  return resultado;
}

export async function criarCliente(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return;
  }
  const nome = texto(formData, "nome");
  if (!nome) {
    return;
  }
  const criado = await prisma.cliente.create({
    data: {
      nome,
      tipo: texto(formData, "tipo") || "lead",
      status: texto(formData, "status") || "conversando",
      contato: texto(formData, "contato"),
      notas: texto(formData, "notas"),
      proximo: texto(formData, "proximo"),
    },
  });
  await gravarTags(texto(formData, "tags"), { clienteId: criado.id });
  await trilha({
    userId: user.id,
    tipo: "cliente",
    texto: `Cliente ${criado.nome}`,
    clienteId: criado.id,
    acao: "criar",
    entidade: "cliente",
    entidadeId: criado.id,
  });
  revalidatePath("/clientes");
  revalidatePath("/hoje");
  revalidatePath("/pipeline");
  redirect(`/clientes/${criado.id}`);
}

async function clientePorNome(nome: string) {
  const n = nome.trim();
  if (!n) {
    return null;
  }
  const existente = await prisma.cliente.findFirst({ where: { nome: n } });
  if (existente) {
    return existente.id;
  }
  const criado = await prisma.cliente.create({ data: { nome: n } });
  return criado.id;
}

export async function criarProjeto(formData: FormData) {
  const user = await eu();
  const nome = texto(formData, "nome");
  if (!nome) {
    return;
  }
  const prazoRaw = texto(formData, "prazo");
  const projeto = await prisma.projeto.create({
    data: {
      nome,
      descricao: texto(formData, "descricao"),
      clienteId: await clientePorNome(texto(formData, "cliente")),
      valor: texto(formData, "valor"),
      proximo: texto(formData, "proximo"),
      comercial: texto(formData, "comercial") || "interno",
      prazo: prazoRaw ? prazoDe(prazoRaw) : null,
    },
  });
  await gravarTags(texto(formData, "tags"), { projetoId: projeto.id });
  await trilha({
    userId: user.id,
    tipo: "projeto",
    texto: `Projeto ${projeto.nome}`,
    projetoId: projeto.id,
    clienteId: projeto.clienteId,
    acao: "criar",
    entidade: "projeto",
    entidadeId: projeto.id,
  });
  revalidatePath("/projetos");
  revalidatePath("/hoje");
  revalidatePath("/pipeline");
  revalidatePath("/agenda");
  redirect(`/projetos/${projeto.id}`);
}

function prazoDe(raw: string) {
  if (!raw) {
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T18:00:00`);
  }
  return new Date(raw);
}

async function projetoDaCasa(projetoId: string | null) {
  if (projetoId) {
    return projetoId;
  }
  const interno = await prisma.projeto.findFirst({ where: { nome: "MAI interno" } });
  return interno?.id ?? null;
}

export async function criarTarefa(formData: FormData) {
  const user = await eu();
  const titulo = texto(formData, "titulo");
  const assigneeId = texto(formData, "assigneeId");
  if (!titulo || !assigneeId) {
    return;
  }
  const descricao = texto(formData, "descricao");
  const clienteId = texto(formData, "clienteId") || null;
  const projetoId = await projetoDaCasa(texto(formData, "projetoId") || null);
  const prazo = prazoDe(texto(formData, "prazo"));
  const voltar = texto(formData, "voltar");

  const dono = await prisma.user.findUnique({ where: { id: assigneeId } });
  const grok = dono?.tipo === "ia";
  const tarefa = await prisma.tarefa.create({
    data: {
      titulo,
      descricao,
      assigneeId,
      criadorId: user.id,
      estimativaMin: 60,
      prazo,
      clienteId,
      projetoId,
      status: grok ? "pendente" : "a_fazer",
      acionadoAt: grok ? new Date() : null,
    },
  });

  after(() => {
    if (grok) {
      void acordarFuncionarioId(assigneeId, tarefa.id);
    }
  });
  await trilha({
    userId: user.id,
    tipo: "tarefa",
    texto: `Tarefa: ${titulo}`,
    tarefaId: tarefa.id,
    projetoId,
    clienteId,
    acao: "criar",
    entidade: "tarefa",
    entidadeId: tarefa.id,
  });
  revalidatePath("/hoje");
  revalidatePath("/projetos");
  revalidatePath("/agenda");
  revalidatePath("/pipeline");
  if (projetoId) {
    revalidatePath(`/projetos/${projetoId}`);
  }
  redirect(voltar || `/tarefas/${tarefa.id}`);
}

export async function mudarStatusTarefa(formData: FormData) {
  const user = await eu();
  const id = texto(formData, "id");
  const status = texto(formData, "status");
  if (!id) {
    return;
  }
  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: { status: statusCanon(status) },
  });
  await trilha({
    userId: user.id,
    tipo: "status",
    texto: `${tarefa.titulo} → ${statusCanon(status)}`,
    tarefaId: id,
    projetoId: tarefa.projetoId,
    acao: "editar",
    entidade: "tarefa",
    entidadeId: id,
    detalhe: statusCanon(status),
  });
  revalidatePath(`/tarefas/${id}`);
  revalidatePath("/hoje");
  revalidatePath("/projetos");
  revalidatePath("/agenda");
  if (tarefa.projetoId) {
    revalidatePath(`/projetos/${tarefa.projetoId}`);
  }
}

export async function registrarTrabalho(formData: FormData) {
  const user = await eu();
  const tarefaId = texto(formData, "tarefaId");
  const textoLivre = texto(formData, "texto");
  if (!tarefaId || !textoLivre) {
    return;
  }
  await prisma.atualizacao.create({
    data: { tarefaId, autorId: user.id, texto: textoLivre },
  });
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { status: "pendente" },
  });
  const t = await prisma.tarefa.findUnique({ where: { id: tarefaId } });
  await trilha({
    userId: user.id,
    tipo: "entrega",
    texto: `Entrega em ${t?.titulo ?? "tarefa"}`,
    tarefaId,
    projetoId: t?.projetoId,
    clienteId: t?.clienteId,
    acao: "editar",
    entidade: "tarefa",
    entidadeId: tarefaId,
  });
  revalidatePath(`/tarefas/${tarefaId}`);
  revalidatePath("/hoje");
  revalidatePath("/projetos");
  revalidatePath("/relatorio");
}

export async function anexarArquivo(formData: FormData) {
  await eu();
  const tarefaId = texto(formData, "tarefaId");
  const file = formData.get("arquivo");
  if (!tarefaId || !(file instanceof File) || file.size === 0) {
    return;
  }
  await guardarAnexo(tarefaId, file.name, Buffer.from(await file.arrayBuffer()));
  revalidatePath(`/tarefas/${tarefaId}`);
}

export async function atualizarCliente(formData: FormData) {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return;
  }
  const id = texto(formData, "id");
  const nome = texto(formData, "nome");
  if (!id || !nome) {
    return;
  }
  await prisma.cliente.update({
    where: { id },
    data: {
      nome,
      tipo: texto(formData, "tipo") || "lead",
      status: texto(formData, "status") || "conversando",
      contato: texto(formData, "contato"),
      notas: texto(formData, "notas"),
      proximo: texto(formData, "proximo"),
    },
  });
  await gravarTags(texto(formData, "tags"), { clienteId: id });
  await trilha({
    userId: user.id,
    tipo: "cliente",
    texto: `Atualizou ${nome}`,
    clienteId: id,
    acao: "editar",
    entidade: "cliente",
    entidadeId: id,
  });
  revalidatePath(`/clientes/${id}`);
  revalidatePath("/clientes");
  revalidatePath("/hoje");
  revalidatePath("/pipeline");
}

export async function atualizarProjeto(formData: FormData) {
  await eu();
  const id = texto(formData, "id");
  const nome = texto(formData, "nome");
  if (!id || !nome) {
    return;
  }
  const prazoRaw = texto(formData, "prazo");
  await prisma.projeto.update({
    where: { id },
    data: {
      nome,
      descricao: texto(formData, "descricao"),
      clienteId: await clientePorNome(texto(formData, "cliente")),
      status: texto(formData, "status") || "aberto",
      valor: texto(formData, "valor"),
      proximo: texto(formData, "proximo"),
      comercial: texto(formData, "comercial") || "interno",
      prazo: prazoRaw ? prazoDe(prazoRaw) : null,
    },
  });
  revalidatePath(`/projetos/${id}`);
  revalidatePath("/projetos");
  revalidatePath("/hoje");
  revalidatePath("/pipeline");
  revalidatePath("/agenda");
}

export async function mudarComercial(formData: FormData) {
  const user = await eu();
  const id = texto(formData, "id");
  const comercial = texto(formData, "comercial") || "interno";
  if (!id) {
    return;
  }
  const projeto = await prisma.projeto.update({
    where: { id },
    data: { comercial },
  });
  await trilha({
    userId: user.id,
    tipo: "pipeline",
    texto: `${projeto.nome} → ${comercial}`,
    projetoId: id,
    clienteId: projeto.clienteId,
    acao: "editar",
    entidade: "projeto",
    entidadeId: id,
    detalhe: comercial,
  });
  revalidatePath("/pipeline");
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${id}`);
  revalidatePath("/hoje");
}

export async function atualizarTarefa(formData: FormData) {
  await eu();
  const id = texto(formData, "id");
  const titulo = texto(formData, "titulo");
  const assigneeId = texto(formData, "assigneeId");
  if (!id || !titulo || !assigneeId) {
    return;
  }
  const prazoRaw = texto(formData, "prazo");
  await prisma.tarefa.update({
    where: { id },
    data: {
      titulo,
      descricao: texto(formData, "descricao"),
      assigneeId,
      prazo: prazoRaw ? new Date(prazoRaw.includes("T") ? prazoRaw : `${prazoRaw}T18:00:00`) : null,
      projetoId: texto(formData, "projetoId") || null,
      status: texto(formData, "status") || "a_fazer",
    },
  });
  revalidatePath(`/tarefas/${id}`);
  revalidatePath("/hoje");
  revalidatePath("/projetos");
}

export async function salvarQuadro(sala: string, snapshot: string) {
  await eu();
  await prisma.quadro.upsert({
    where: { sala },
    create: { sala, snapshot },
    update: { snapshot },
  });
}

export async function fazerBackup() {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return;
  }
  await fazerBackupLocal();
  revalidatePath("/hoje");
  revalidatePath("/painel");
}

export async function carregarDiario(tarefaId: string) {
  await eu();
  if (!tarefaId) {
    return [];
  }
  return prisma.atualizacao.findMany({
    where: { tarefaId },
    include: { autor: { select: { nome: true, tipo: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function carregarChat(outroId: string) {
  const user = await eu();
  return prisma.conversa.findFirst({
    where: {
      OR: [
        { humanoId: user.id, funcionarioId: outroId },
        { humanoId: outroId, funcionarioId: user.id },
      ],
    },
    include: {
      funcionario: true,
      mensagens: { include: { autor: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function enviarChat(outroId: string, textoLivre: string) {
  const user = await eu();
  const msg = textoLivre.trim();
  if (!msg) {
    return { ok: false as const, erro: "escreva a mensagem" };
  }
  if (outroId === user.id) {
    return { ok: false as const, erro: "escolha outra pessoa" };
  }
  const outro = await prisma.user.findUnique({ where: { id: outroId } });
  if (!outro || !outro.ativo) {
    return { ok: false as const, erro: "pessoa inválida" };
  }
  let conversa = await prisma.conversa.findFirst({
    where: {
      OR: [
        { humanoId: user.id, funcionarioId: outroId },
        { humanoId: outroId, funcionarioId: user.id },
      ],
    },
  });
  if (!conversa) {
    conversa = await prisma.conversa.create({
      data: { humanoId: user.id, funcionarioId: outroId },
    });
  }
  await prisma.mensagem.create({
    data: {
      conversaId: conversa.id,
      autorId: user.id,
      papel: user.tipo === "ia" ? "ia" : "humano",
      texto: msg,
    },
  });

  if (outro.tipo === "ia") {
    const historico = await prisma.mensagem.findMany({
      where: { conversaId: conversa.id },
      orderBy: { createdAt: "desc" },
      take: 16,
    });
    const casa = await urlDoEscritorio();
    const hook = await hookDoCargo(outro.ficha);
    const cargo = cargoDaFicha(outro.ficha);
    const r = await acordarGrok({
      ficha: outro.ficha,
      email: outro.email,
      senha: hook.senha,
      nome: outro.nome,
      funcao: outro.funcao,
      mesa: cargo?.mesa ?? outro.funcao,
      escritorio_url: hook.escritorio || casa,
      recado: msg,
      conversa_id: conversa.id,
      historico: historico.reverse().map((m) => ({ papel: m.papel, texto: m.texto })),
      resposta_url: `${(hook.escritorio || casa).replace(/\/$/, "")}/api/mesa/chat`,
      modo: "chat",
    });
    if (r.ok && r.texto) {
      await prisma.mensagem.create({
        data: {
          conversaId: conversa.id,
          autorId: outro.id,
          papel: "ia",
          texto: r.texto,
        },
      });
    }
    const atual = await prisma.conversa.findUnique({
      where: { id: conversa.id },
      include: {
        funcionario: true,
        mensagens: { include: { autor: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!r.ok) {
      return { ok: false as const, erro: r.erro, conversa: atual };
    }
    return { ok: true as const, conversa: atual };
  }

  const atual = await prisma.conversa.findUnique({
    where: { id: conversa.id },
    include: {
      funcionario: true,
      mensagens: { include: { autor: true }, orderBy: { createdAt: "asc" } },
    },
  });
  return { ok: true as const, conversa: atual };
}
