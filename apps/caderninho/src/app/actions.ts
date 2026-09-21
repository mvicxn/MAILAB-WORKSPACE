"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";

import { headers } from "next/headers";

import { autenticarCredencial, criarSessao, sairSessao, usuarioAtual } from "@/lib/auth";
import {
  assertBackup,
  assertCliente,
  assertHumano,
  assertProjeto,
  assertTarefa,
  comercialCanon,
  falha,
  idSeguro,
  statusClienteCanon,
  statusProjetoCanon,
  tipoClienteCanon,
} from "@/lib/autorizar";
import { guardarAnexo } from "@/lib/anexo";
import { fazerBackupLocal } from "@/lib/backup";
import { recortarPedido } from "@/lib/carlos";
import { EMPRESA, vivo } from "@/lib/casa";
import { garantirCarlosNoBanco } from "@/lib/contratar";
import { montarBriefing } from "@/lib/despacho";
import { ehCarlos, ehHumano, FICHA_CARLOS } from "@/lib/equipe";
import { corDoTipo, expandirSerie, parseRecorrencia, type Recorrencia } from "@/lib/evento";
import { acordarGrok, gravarRotinaMailab, hookDoCarlos, urlDoEscritorio } from "@/lib/grok-ponte";
import { ipDoPedido, limparFalhasLogin, loginBloqueado, registrarFalhaLogin } from "@/lib/login-lock";
import { prisma } from "@/lib/prisma";
import { garantirSocios } from "@/lib/socios";
import { trilha, gravarTags } from "@/lib/trilha";
import { adicionarDias, chaveDia, concluida, instanteSp, prazoDe, statusCanon } from "@/lib/datas";

function texto(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function revalidateCasa(...extras: string[]) {
  for (const p of ["/hoje", "/projetos", "/pipeline", "/agenda", "/clientes", "/relatorio", "/equipe", ...extras].filter(Boolean)) {
    revalidatePath(p);
  }
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
  const user = await usuarioAtual(prisma);
  if (user) {
    await trilha({
      userId: user.id,
      tipo: "logout",
      texto: `${user.nome} saiu`,
      acao: "logout",
      entidade: "user",
      entidadeId: user.id,
    });
  }
  await sairSessao();
  redirect("/entrar");
}

async function acordarFuncionarioId(userId: string, tarefaId?: string, recado?: string) {
  const pessoa = await prisma.user.findUnique({ where: { id: userId } });
  if (!pessoa || pessoa.tipo !== "ia" || !ehCarlos(pessoa.papel, pessoa.ficha)) {
    return { ok: false as const, erro: "só o Carlos entra em campo" };
  }
  const hook = await hookDoCarlos();
  let tarefa_url: string | undefined;
  let tarefa_titulo: string | undefined;
  let briefing = recado || `Trabalhe no MAI LAB. Abra Hoje.`;
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
    email: pessoa.email,
    senha: hook.senha,
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
    return { ok: false as const, erro: "só sócio acorda o Carlos" };
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
    return { ok: false as const, erro: "só sócio acorda o Carlos" };
  }
  const userId = texto(formData, "userId");
  if (!userId) {
    return { ok: false as const, erro: "falta a pessoa" };
  }
  return acordarFuncionarioId(
    userId,
    undefined,
    "Plantão. Abra Hoje, assume as tarefas da mesa e registra o que fez no diário.",
  );
}

export async function acordarPlantao() {
  const user = await eu();
  if (!ehHumano(user.papel, user.tipo)) {
    return { ok: false as const, erro: "só sócio acorda o Carlos" };
  }
  const carlos = await prisma.user.findFirst({
    where: { ficha: FICHA_CARLOS, tipo: "ia", ativo: true },
  });
  if (!carlos) {
    return { ok: false as const, erro: "Carlos ainda não está no banco" };
  }
  const r = await acordarFuncionarioId(
    carlos.id,
    undefined,
    "Plantão. Abra Hoje, assume a mesa e registra no diário de cada tarefa.",
  );
  return { ok: true as const, resultados: [{ nome: carlos.nome, ...r }] };
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
  const recortes = recortarPedido(pedidoTexto);
  const carlos = await prisma.user.findFirst({ where: { ficha: FICHA_CARLOS, tipo: "ia", ativo: true } });
  if (!carlos) {
    return;
  }
  const pedido = await prisma.pedido.create({
    data: {
      texto: pedidoTexto,
      todoMundo: false,
      criadorId: user.id,
    },
  });
  const prazo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const recorte = recortes[0];
  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: recorte.titulo,
      descricao: recorte.descricao,
      assigneeId: carlos.id,
      criadorId: user.id,
      pedidoId: pedido.id,
      prazo,
      estimativaMin: 60,
    },
  });
  revalidatePath("/hoje");
  after(() => {
    void acordarFuncionarioId(carlos.id, tarefa.id, recorte.descricao);
  });
  redirect(`/tarefas/${tarefa.id}`);
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
    return { erro: "só sócio liga o Carlos" as const };
  }
  const resultado = await garantirCarlosNoBanco();
  revalidatePath("/equipe");
  revalidatePath("/entrar");
  revalidatePath("/hoje");
  return resultado;
}

export async function criarCliente(formData: FormData) {
  const user = await eu();
  const bloqueio = assertCliente(user);
  if (bloqueio) {
    return bloqueio;
  }
  const nome = texto(formData, "nome");
  if (!nome) {
    return falha("falta o nome");
  }
  const criado = await prisma.cliente.create({
    data: {
      nome,
      tipo: tipoClienteCanon(texto(formData, "tipo")),
      status: statusClienteCanon(texto(formData, "status")),
      contato: texto(formData, "contato"),
      notas: texto(formData, "notas"),
      proximo: texto(formData, "proximo"),
      empresaId: EMPRESA,
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
  revalidateCasa();
  redirect(`/clientes/${criado.id}`);
}

async function clientePorNome(nome: string, podeCriar: boolean) {
  const n = nome.trim();
  if (!n) {
    return null;
  }
  const existente = await prisma.cliente.findFirst({ where: { nome: n, ...vivo } });
  if (existente) {
    return existente.id;
  }
  if (!podeCriar) {
    return null;
  }
  const criado = await prisma.cliente.create({ data: { nome: n, empresaId: EMPRESA } });
  return criado.id;
}

export async function criarProjeto(formData: FormData) {
  const user = await eu();
  const bloqueio = assertProjeto(user);
  if (bloqueio) {
    return bloqueio;
  }
  const nome = texto(formData, "nome");
  if (!nome) {
    return falha("falta o nome do projeto");
  }
  const prazoRaw = texto(formData, "prazo");
  const projeto = await prisma.projeto.create({
    data: {
      nome,
      descricao: texto(formData, "descricao"),
      clienteId: await clientePorNome(texto(formData, "cliente"), ehHumano(user.papel, user.tipo)),
      valor: texto(formData, "valor"),
      proximo: texto(formData, "proximo"),
      comercial: comercialCanon(texto(formData, "comercial")),
      prazo: prazoRaw ? prazoDe(prazoRaw) : null,
      empresaId: EMPRESA,
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
  revalidateCasa(`/projetos/${projeto.id}`);
  redirect(`/projetos/${projeto.id}`);
}

async function projetoDaCasa(projetoId: string | null) {
  if (projetoId) {
    const p = await prisma.projeto.findFirst({ where: { id: projetoId, ...vivo } });
    return p?.id ?? null;
  }
  const interno = await prisma.projeto.findFirst({ where: { nome: "MAI interno", ...vivo } });
  return interno?.id ?? null;
}

export async function criarTarefa(formData: FormData) {
  const user = await eu();
  const bloqueio = assertTarefa(user);
  if (bloqueio) {
    return bloqueio;
  }
  const titulo = texto(formData, "titulo");
  const assigneeId = texto(formData, "assigneeId");
  if (!titulo || !assigneeId) {
    return falha("falta título ou responsável");
  }
  const descricao = texto(formData, "descricao");
  const clienteId = texto(formData, "clienteId") || null;
  const projetoId = await projetoDaCasa(texto(formData, "projetoId") || null);
  const prazo = prazoDe(texto(formData, "prazo"));
  const voltar = texto(formData, "voltar");

  const dono = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!dono || !dono.ativo) {
    return falha("responsável inválido");
  }
  if (dono.tipo === "ia" && !ehCarlos(dono.papel, dono.ficha)) {
    return falha("o Grok da mesa é o Carlos");
  }
  const grok = dono.tipo === "ia";
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
      empresaId: EMPRESA,
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
  revalidateCasa(projetoId ? `/projetos/${projetoId}` : "");
  redirect(voltar || `/tarefas/${tarefa.id}`);
}

export async function mudarStatusTarefa(formData: FormData) {
  const user = await eu();
  const id = texto(formData, "id");
  const status = statusCanon(texto(formData, "status"));
  if (!idSeguro(id)) {
    return falha("tarefa inválida");
  }
  const atual = await prisma.tarefa.findFirst({ where: { id, ...vivo } });
  if (!atual) {
    return falha("tarefa sumiu");
  }
  const tarefa = await prisma.tarefa.update({
    where: { id },
    data: { status },
  });
  await trilha({
    userId: user.id,
    tipo: "status",
    texto: `${tarefa.titulo} → ${status}`,
    tarefaId: id,
    projetoId: tarefa.projetoId,
    acao: "editar",
    entidade: "tarefa",
    entidadeId: id,
    detalhe: status,
  });
  revalidateCasa(`/tarefas/${id}`, tarefa.projetoId ? `/projetos/${tarefa.projetoId}` : "");
}

export async function registrarTrabalho(formData: FormData) {
  const user = await eu();
  const tarefaId = texto(formData, "tarefaId");
  const textoLivre = texto(formData, "texto");
  if (!idSeguro(tarefaId) || !textoLivre) {
    return falha("falta o texto da entrega");
  }
  const t0 = await prisma.tarefa.findFirst({ where: { id: tarefaId, ...vivo } });
  if (!t0) {
    return falha("tarefa sumiu");
  }
  await prisma.atualizacao.create({
    data: { tarefaId, autorId: user.id, texto: textoLivre },
  });
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { status: "pendente" },
  });
  await trilha({
    userId: user.id,
    tipo: "entrega",
    texto: `Entrega em ${t0.titulo}`,
    tarefaId,
    projetoId: t0.projetoId,
    clienteId: t0.clienteId,
    acao: "editar",
    entidade: "tarefa",
    entidadeId: tarefaId,
  });
  revalidateCasa(`/tarefas/${tarefaId}`);
}

export async function anexarArquivo(formData: FormData) {
  await eu();
  const tarefaId = texto(formData, "tarefaId");
  const file = formData.get("arquivo");
  if (!idSeguro(tarefaId) || !(file instanceof File) || file.size === 0) {
    return falha("anexo inválido");
  }
  try {
    await guardarAnexo(tarefaId, file.name, Buffer.from(await file.arrayBuffer()));
  } catch (e) {
    return falha(e instanceof Error ? e.message : "anexo recusado");
  }
  revalidateCasa(`/tarefas/${tarefaId}`);
}

export async function atualizarCliente(formData: FormData) {
  const user = await eu();
  const bloqueio = assertCliente(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  const nome = texto(formData, "nome");
  if (!idSeguro(id) || !nome) {
    return falha("ficha incompleta");
  }
  await prisma.cliente.update({
    where: { id },
    data: {
      nome,
      tipo: tipoClienteCanon(texto(formData, "tipo")),
      status: statusClienteCanon(texto(formData, "status")),
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
  revalidateCasa(`/clientes/${id}`);
}

export async function atualizarProjeto(formData: FormData) {
  const user = await eu();
  const bloqueio = assertProjeto(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  const nome = texto(formData, "nome");
  if (!idSeguro(id) || !nome) {
    return falha("projeto incompleto");
  }
  const prazoRaw = texto(formData, "prazo");
  await prisma.projeto.update({
    where: { id },
    data: {
      nome,
      descricao: texto(formData, "descricao"),
      clienteId: await clientePorNome(texto(formData, "cliente"), ehHumano(user.papel, user.tipo)),
      status: statusProjetoCanon(texto(formData, "status")),
      valor: texto(formData, "valor"),
      proximo: texto(formData, "proximo"),
      comercial: comercialCanon(texto(formData, "comercial")),
      prazo: prazoRaw ? prazoDe(prazoRaw) : null,
    },
  });
  revalidateCasa(`/projetos/${id}`);
}

export async function mudarComercial(formData: FormData) {
  const user = await eu();
  const bloqueio = assertProjeto(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  const comercial = comercialCanon(texto(formData, "comercial"));
  if (!idSeguro(id)) {
    return falha("projeto inválido");
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
  revalidateCasa(`/projetos/${id}`);
}

export async function atualizarTarefa(formData: FormData) {
  const user = await eu();
  const bloqueio = assertTarefa(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  const titulo = texto(formData, "titulo");
  const assigneeId = texto(formData, "assigneeId");
  if (!idSeguro(id) || !titulo || !assigneeId) {
    return falha("tarefa incompleta");
  }
  const prazoRaw = texto(formData, "prazo");
  const dono = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!dono || !dono.ativo) {
    return falha("responsável inválido");
  }
  if (dono.tipo === "ia" && !ehCarlos(dono.papel, dono.ficha)) {
    return falha("o Grok da mesa é o Carlos");
  }
  await prisma.tarefa.update({
    where: { id },
    data: {
      titulo,
      descricao: texto(formData, "descricao"),
      assigneeId,
      prazo: prazoRaw ? prazoDe(prazoRaw) : null,
      projetoId: texto(formData, "projetoId") || null,
      status: statusCanon(texto(formData, "status")),
    },
  });
  revalidateCasa(`/tarefas/${id}`);
}

export async function salvarQuadro(sala: string, snapshot: string) {
  const user = await eu();
  if (!sala || sala.length > 80) {
    return falha("sala inválida");
  }
  if (user.tipo !== "humano" && user.ficha !== FICHA_CARLOS) {
    return falha("sem permissão no quadro");
  }
  await prisma.quadro.upsert({
    where: { sala },
    create: { sala, snapshot },
    update: { snapshot },
  });
}

export async function fazerBackup() {
  const user = await eu();
  const bloqueio = assertBackup(user);
  if (bloqueio) {
    return bloqueio;
  }
  await fazerBackupLocal();
  revalidateCasa();
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
    if (!ehCarlos(outro.papel, outro.ficha)) {
      return { ok: false as const, erro: "o chat do Grok é só com o Carlos" };
    }
    const casa = await urlDoEscritorio();
    const hook = await hookDoCarlos();
    const r = await acordarGrok({
      email: outro.email,
      senha: hook.senha,
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

export async function impactoCliente(id: string) {
  await eu();
  const [tarefas, projetos, eventos] = await Promise.all([
    prisma.tarefa.count({ where: { clienteId: id, ...vivo } }),
    prisma.projeto.count({ where: { clienteId: id, ...vivo } }),
    prisma.evento.count({ where: { clienteId: id, ...vivo } }),
  ]);
  return { tarefas, projetos, eventos };
}

export async function excluirCliente(formData: FormData) {
  const user = await eu();
  const bloqueio = assertCliente(user) || assertHumano(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  if (!idSeguro(id)) {
    return falha("cliente inválido");
  }
  const c = await prisma.cliente.findFirst({ where: { id, ...vivo } });
  if (!c) {
    return falha("já estava fora");
  }
  await prisma.cliente.update({ where: { id }, data: { deletedAt: new Date() } });
  await trilha({
    userId: user.id,
    tipo: "cliente",
    texto: `Excluiu ${c.nome}`,
    clienteId: id,
    acao: "excluir",
    entidade: "cliente",
    entidadeId: id,
  });
  revalidateCasa();
  redirect("/clientes");
}

export async function restaurarCliente(id: string) {
  const user = await eu();
  const bloqueio = assertCliente(user);
  if (bloqueio) {
    return bloqueio;
  }
  await prisma.cliente.update({ where: { id }, data: { deletedAt: null } });
  await trilha({
    userId: user.id,
    tipo: "cliente",
    texto: "Restaurou cliente",
    clienteId: id,
    acao: "restaurar",
    entidade: "cliente",
    entidadeId: id,
  });
  revalidateCasa(`/clientes/${id}`);
}

export async function impactoProjeto(id: string) {
  await eu();
  const [tarefas, eventos] = await Promise.all([
    prisma.tarefa.count({ where: { projetoId: id, ...vivo } }),
    prisma.evento.count({ where: { projetoId: id, ...vivo } }),
  ]);
  return { tarefas, eventos };
}

export async function excluirProjeto(formData: FormData) {
  const user = await eu();
  const bloqueio = assertProjeto(user) || assertHumano(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  if (!idSeguro(id)) {
    return falha("projeto inválido");
  }
  const p = await prisma.projeto.findFirst({ where: { id, ...vivo } });
  if (!p || p.nome === "MAI interno") {
    return falha(p?.nome === "MAI interno" ? "o projeto interno da casa não sai" : "projeto sumiu");
  }
  await prisma.projeto.update({ where: { id }, data: { deletedAt: new Date() } });
  await trilha({
    userId: user.id,
    tipo: "projeto",
    texto: `Excluiu ${p.nome}`,
    projetoId: id,
    acao: "excluir",
    entidade: "projeto",
    entidadeId: id,
  });
  revalidateCasa();
  redirect("/projetos");
}

export async function excluirTarefa(formData: FormData) {
  const user = await eu();
  const bloqueio = assertTarefa(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  if (!idSeguro(id)) {
    return falha("tarefa inválida");
  }
  const t = await prisma.tarefa.findFirst({ where: { id, ...vivo } });
  if (!t) {
    return falha("tarefa sumiu");
  }
  await prisma.tarefa.update({ where: { id }, data: { deletedAt: new Date() } });
  await trilha({
    userId: user.id,
    tipo: "tarefa",
    texto: `Excluiu ${t.titulo}`,
    tarefaId: id,
    projetoId: t.projetoId,
    acao: "excluir",
    entidade: "tarefa",
    entidadeId: id,
  });
  revalidateCasa();
  redirect(t.projetoId ? `/projetos/${t.projetoId}` : "/hoje");
}

export async function desativarPessoa(formData: FormData) {
  const user = await eu();
  const bloqueio = assertHumano(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  const pessoa = await prisma.user.findUnique({ where: { id } });
  if (!pessoa || pessoa.tipo === "humano" || ehCarlos(pessoa.papel, pessoa.ficha)) {
    return falha("não dá para desligar sócio nem o Carlos por aqui");
  }
  await prisma.user.update({ where: { id }, data: { ativo: false } });
  await trilha({
    userId: user.id,
    tipo: "equipe",
    texto: `Desativou ${pessoa.nome}`,
    acao: "excluir",
    entidade: "user",
    entidadeId: id,
  });
  revalidateCasa();
}

export async function ativarPessoa(formData: FormData) {
  const user = await eu();
  const bloqueio = assertHumano(user);
  if (bloqueio) {
    return bloqueio;
  }
  const id = texto(formData, "id");
  await prisma.user.update({ where: { id }, data: { ativo: true } });
  revalidateCasa();
}

function recDoForm(formData: FormData): string {
  const freq = texto(formData, "recorrencia");
  if (!freq) {
    return "";
  }
  const rec: Recorrencia = { freq: freq as Recorrencia["freq"] };
  const until = texto(formData, "recUntil");
  const count = Number(texto(formData, "recCount") || "0");
  const days = texto(formData, "recDays");
  if (until) {
    rec.until = until;
  }
  if (count > 0) {
    rec.count = count;
  }
  if (days) {
    rec.weekdays = days.split(",").map(Number).filter((n) => n >= 0 && n <= 6);
  }
  return JSON.stringify(rec);
}

export async function criarEvento(formData: FormData) {
  const user = await eu();
  const titulo = texto(formData, "titulo") || "Compromisso";
  const dia = texto(formData, "dia") || chaveDia(new Date());
  const diaInteiro = texto(formData, "diaInteiro") === "sim";
  const iniH = texto(formData, "inicio") || "09:00";
  const fimH = texto(formData, "fim") || "10:00";
  const inicio = diaInteiro ? instanteSp(dia, "00:00") : instanteSp(dia, iniH);
  let fim = diaInteiro ? instanteSp(dia, "23:59") : instanteSp(dia, fimH);
  if (fim.getTime() <= inicio.getTime()) {
    fim = new Date(inicio.getTime() + 60 * 60 * 1000);
  }
  const tipo = texto(formData, "tipo") || "reuniao";
  const dono = texto(formData, "userId") || user.id;
  const criado = await prisma.evento.create({
    data: {
      titulo,
      descricao: texto(formData, "descricao"),
      inicio,
      fim,
      diaInteiro,
      userId: dono,
      clienteId: texto(formData, "clienteId") || null,
      projetoId: texto(formData, "projetoId") || null,
      tarefaId: texto(formData, "tarefaId") || null,
      local: texto(formData, "local"),
      link: texto(formData, "link"),
      status: "aberto",
      prioridade: texto(formData, "prioridade") || "normal",
      cor: texto(formData, "cor") || corDoTipo(tipo),
      tipo,
      recorrencia: recDoForm(formData),
      notas: texto(formData, "notas"),
      empresaId: EMPRESA,
    },
  });
  const parts = texto(formData, "participantes");
  if (parts) {
    for (const pid of parts.split(",").map((s) => s.trim()).filter(idSeguro)) {
      await prisma.eventoParticipante.create({ data: { eventoId: criado.id, userId: pid } }).catch(() => null);
    }
  }
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: `Evento ${titulo}`,
    clienteId: criado.clienteId,
    projetoId: criado.projetoId,
    tarefaId: criado.tarefaId,
    acao: "criar",
    entidade: "evento",
    entidadeId: criado.id,
  });
  revalidateCasa();
  return { ok: true as const, id: criado.id };
}

export async function atualizarEvento(formData: FormData) {
  const user = await eu();
  const id = texto(formData, "id");
  const escopo = texto(formData, "escopo") || "serie";
  if (!idSeguro(id)) {
    return falha("evento inválido");
  }
  const atual = await prisma.evento.findFirst({ where: { id, ...vivo } });
  if (!atual) {
    return falha("evento sumiu");
  }
  const dia = texto(formData, "dia") || chaveDia(atual.inicio);
  const diaOrigem = texto(formData, "diaOrigem") || dia;
  const diaInteiro = texto(formData, "diaInteiro") === "sim";
  const iniH = texto(formData, "inicio") || "09:00";
  const fimH = texto(formData, "fim") || "10:00";
  const inicio = diaInteiro ? instanteSp(dia, "00:00") : instanteSp(dia, iniH);
  let fim = diaInteiro ? instanteSp(dia, "23:59") : instanteSp(dia, fimH);
  if (fim.getTime() <= inicio.getTime()) {
    fim = new Date(inicio.getTime() + 60 * 60 * 1000);
  }
  const tipo = texto(formData, "tipo") || atual.tipo;
  const titulo = texto(formData, "titulo") || atual.titulo;
  const rec = recDoForm(formData);
  const serie = Boolean(parseRecorrencia(atual.recorrencia));

  if (serie && escopo === "este") {
    await prisma.eventoExcecao.create({ data: { eventoId: id, dia: diaOrigem } });
    const copia = await prisma.evento.create({
      data: {
        titulo,
        descricao: texto(formData, "descricao"),
        inicio,
        fim,
        diaInteiro,
        userId: texto(formData, "userId") || atual.userId,
        clienteId: texto(formData, "clienteId") || null,
        projetoId: texto(formData, "projetoId") || null,
        tarefaId: texto(formData, "tarefaId") || null,
        local: texto(formData, "local"),
        link: texto(formData, "link"),
        status: texto(formData, "status") || atual.status,
        prioridade: texto(formData, "prioridade") || atual.prioridade,
        cor: texto(formData, "cor") || atual.cor,
        tipo,
        notas: texto(formData, "notas"),
        empresaId: EMPRESA,
        serieId: id,
      },
    });
    await trilha({
      userId: user.id,
      tipo: "evento",
      texto: `Editou ocorrência ${titulo}`,
      acao: "editar",
      entidade: "evento",
      entidadeId: copia.id,
    });
    revalidateCasa();
    return { ok: true as const, id: copia.id };
  }

  if (serie && escopo === "futuro") {
    const recOld = parseRecorrencia(atual.recorrencia) || { freq: "semanal" as const };
    recOld.until = adicionarDias(diaOrigem, -1);
    await prisma.evento.update({
      where: { id },
      data: { recorrencia: JSON.stringify(recOld) },
    });
    const novo = await prisma.evento.create({
      data: {
        titulo,
        descricao: texto(formData, "descricao"),
        inicio,
        fim,
        diaInteiro,
        userId: texto(formData, "userId") || atual.userId,
        clienteId: texto(formData, "clienteId") || null,
        projetoId: texto(formData, "projetoId") || null,
        tarefaId: texto(formData, "tarefaId") || null,
        local: texto(formData, "local"),
        link: texto(formData, "link"),
        status: texto(formData, "status") || atual.status,
        prioridade: texto(formData, "prioridade") || atual.prioridade,
        cor: texto(formData, "cor") || atual.cor,
        tipo,
        recorrencia: rec || atual.recorrencia,
        notas: texto(formData, "notas"),
        empresaId: EMPRESA,
        serieId: id,
      },
    });
    await trilha({
      userId: user.id,
      tipo: "evento",
      texto: `Nova série ${titulo}`,
      acao: "editar",
      entidade: "evento",
      entidadeId: novo.id,
    });
    revalidateCasa();
    return { ok: true as const, id: novo.id };
  }

  await prisma.evento.update({
    where: { id },
    data: {
      titulo,
      descricao: texto(formData, "descricao"),
      inicio,
      fim,
      diaInteiro,
      userId: texto(formData, "userId") || atual.userId,
      clienteId: texto(formData, "clienteId") || null,
      projetoId: texto(formData, "projetoId") || null,
      tarefaId: texto(formData, "tarefaId") || null,
      local: texto(formData, "local"),
      link: texto(formData, "link"),
      status: texto(formData, "status") || atual.status,
      prioridade: texto(formData, "prioridade") || atual.prioridade,
      cor: texto(formData, "cor") || atual.cor,
      tipo,
      recorrencia: rec || atual.recorrencia,
      notas: texto(formData, "notas"),
    },
  });
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: `Editou ${titulo}`,
    acao: "editar",
    entidade: "evento",
    entidadeId: id,
  });
  revalidateCasa();
  return { ok: true as const, id };
}

export async function moverEvento(opts: {
  id: string;
  dia: string;
  inicio?: string;
  fim?: string;
  diaOrigem?: string;
}) {
  const user = await eu();
  if (!idSeguro(opts.id) || !/^\d{4}-\d{2}-\d{2}$/.test(opts.dia)) {
    return falha("movimento inválido");
  }
  const atual = await prisma.evento.findFirst({ where: { id: opts.id, ...vivo } });
  if (!atual) {
    return falha("evento sumiu");
  }
  const dur = atual.fim.getTime() - atual.inicio.getTime();
  const hora = opts.inicio || new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(atual.inicio);
  const inicio = atual.diaInteiro ? instanteSp(opts.dia, "00:00") : instanteSp(opts.dia, hora);
  const fim = opts.fim
    ? instanteSp(opts.dia, opts.fim)
    : new Date(inicio.getTime() + Math.max(dur, 15 * 60 * 1000));
  const serie = Boolean(parseRecorrencia(atual.recorrencia));
  if (serie) {
    const origem = opts.diaOrigem || chaveDia(atual.inicio);
    await prisma.eventoExcecao.create({ data: { eventoId: opts.id, dia: origem } });
    const copia = await prisma.evento.create({
      data: {
        titulo: atual.titulo,
        descricao: atual.descricao,
        inicio,
        fim,
        diaInteiro: atual.diaInteiro,
        userId: atual.userId,
        clienteId: atual.clienteId,
        projetoId: atual.projetoId,
        tarefaId: atual.tarefaId,
        local: atual.local,
        link: atual.link,
        status: atual.status,
        prioridade: atual.prioridade,
        cor: atual.cor,
        tipo: atual.tipo,
        empresaId: EMPRESA,
        serieId: atual.id,
      },
    });
    await trilha({
      userId: user.id,
      tipo: "evento",
      texto: `Moveu ocorrência ${atual.titulo}`,
      acao: "mover",
      entidade: "evento",
      entidadeId: copia.id,
    });
    revalidateCasa();
    return { ok: true as const, id: copia.id };
  }
  await prisma.evento.update({ where: { id: opts.id }, data: { inicio, fim } });
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: `Moveu ${atual.titulo}`,
    acao: "mover",
    entidade: "evento",
    entidadeId: opts.id,
  });
  revalidateCasa();
  return { ok: true as const, id: opts.id };
}

export async function duplicarEvento(id: string) {
  const user = await eu();
  const atual = await prisma.evento.findFirst({ where: { id, ...vivo } });
  if (!atual) {
    return falha("evento sumiu");
  }
  const copia = await prisma.evento.create({
    data: {
      titulo: `${atual.titulo} (cópia)`,
      descricao: atual.descricao,
      inicio: new Date(atual.inicio.getTime() + 86400000),
      fim: new Date(atual.fim.getTime() + 86400000),
      diaInteiro: atual.diaInteiro,
      userId: atual.userId,
      clienteId: atual.clienteId,
      projetoId: atual.projetoId,
      tarefaId: atual.tarefaId,
      local: atual.local,
      link: atual.link,
      cor: atual.cor,
      tipo: atual.tipo,
      empresaId: EMPRESA,
    },
  });
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: `Duplicou ${atual.titulo}`,
    acao: "criar",
    entidade: "evento",
    entidadeId: copia.id,
  });
  revalidateCasa();
  return { ok: true as const, id: copia.id };
}

export async function concluirEvento(id: string) {
  const user = await eu();
  const atual = await prisma.evento.findFirst({ where: { id, ...vivo } });
  if (!atual) {
    return falha("evento sumiu");
  }
  const status = atual.status === "feito" ? "aberto" : "feito";
  await prisma.evento.update({ where: { id }, data: { status } });
  if (atual.tarefaId && status === "feito") {
    await prisma.tarefa.update({ where: { id: atual.tarefaId }, data: { status: "concluida" } });
  }
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: status === "feito" ? `Concluiu ${atual.titulo}` : `Reabriu ${atual.titulo}`,
    tarefaId: atual.tarefaId,
    acao: "editar",
    entidade: "evento",
    entidadeId: id,
  });
  revalidateCasa();
  return { ok: true as const };
}

export async function excluirEvento(opts: { id: string; escopo?: string; dia?: string }) {
  const user = await eu();
  const atual = await prisma.evento.findFirst({ where: { id: opts.id, ...vivo } });
  if (!atual) {
    return falha("evento sumiu");
  }
  const serie = Boolean(parseRecorrencia(atual.recorrencia));
  if (serie && opts.escopo === "este" && opts.dia) {
    await prisma.eventoExcecao.create({ data: { eventoId: opts.id, dia: opts.dia } });
  } else {
    await prisma.evento.update({ where: { id: opts.id }, data: { deletedAt: new Date() } });
  }
  await trilha({
    userId: user.id,
    tipo: "evento",
    texto: `Excluiu ${atual.titulo}`,
    acao: "excluir",
    entidade: "evento",
    entidadeId: opts.id,
  });
  revalidateCasa();
  return { ok: true as const };
}

export async function eventosDoPeriodo(de: string, ate: string, filtro?: { userId?: string; clienteId?: string; q?: string }) {
  await eu();
  const ini = instanteSp(de, "00:00");
  const fim = instanteSp(ate, "23:59");
  const where = {
    ...vivo,
    ...(filtro?.userId ? { userId: filtro.userId } : {}),
    ...(filtro?.clienteId ? { clienteId: filtro.clienteId } : {}),
    ...(filtro?.q
      ? { OR: [{ titulo: { contains: filtro.q } }, { descricao: { contains: filtro.q } }] }
      : {}),
  };
  const [eventos, tarefas, projetos] = await Promise.all([
    prisma.evento.findMany({
      where,
      include: { user: true, cliente: true, projeto: true, tarefa: true, excecoes: true },
    }),
    prisma.tarefa.findMany({
      where: { ...vivo, prazo: { gte: ini, lte: fim }, ...(filtro?.userId ? { assigneeId: filtro.userId } : {}) },
      include: { assignee: true, projeto: true, cliente: true },
    }),
    prisma.projeto.findMany({
      where: { ...vivo, prazo: { gte: ini, lte: fim } },
      include: { cliente: true },
    }),
  ]);
  const itens = eventos.flatMap((e) =>
    expandirSerie({
      id: e.id,
      titulo: e.titulo,
      descricao: e.descricao,
      inicio: e.inicio,
      fim: e.fim,
      diaInteiro: e.diaInteiro,
      userId: e.userId,
      clienteId: e.clienteId,
      projetoId: e.projetoId,
      tarefaId: e.tarefaId,
      local: e.local,
      link: e.link,
      status: e.status,
      prioridade: e.prioridade,
      cor: e.cor,
      tipo: e.tipo,
      recorrencia: e.recorrencia,
      excecoes: e.excecoes.map((x) => x.dia),
      de,
      ate,
    }).map((o) => ({
      ...o,
      dono: e.user.nome,
      cliente: e.cliente?.nome ?? null,
      contato: e.cliente?.contato ?? "",
      projeto: e.projeto?.nome ?? null,
      tarefa: e.tarefa?.titulo ?? null,
    })),
  );
  const blocosTarefa = tarefas.map((t) => {
    const dia = t.prazo ? chaveDia(t.prazo) : de;
    return {
      id: `t:${t.id}`,
      eventoId: t.id,
      titulo: t.titulo,
      descricao: t.descricao,
      inicio: (t.prazo ?? ini).toISOString(),
      fim: (t.prazo ?? ini).toISOString(),
      dia,
      diaInteiro: true,
      userId: t.assigneeId,
      clienteId: t.clienteId,
      projetoId: t.projetoId,
      tarefaId: t.id,
      local: "",
      link: `/tarefas/${t.id}`,
      status: t.status,
      prioridade: "normal",
      cor: "#2f6d5c",
      tipo: "tarefa",
      serie: false,
      origem: "tarefa" as const,
      dono: t.assignee.nome,
      cliente: t.cliente?.nome ?? null,
      contato: "",
      projeto: t.projeto?.nome ?? null,
      tarefa: t.titulo,
    };
  });
  const blocosProjeto = projetos.map((p) => {
    const dia = p.prazo ? chaveDia(p.prazo) : de;
    return {
      id: `p:${p.id}`,
      eventoId: p.id,
      titulo: p.nome,
      descricao: p.descricao,
      inicio: (p.prazo ?? ini).toISOString(),
      fim: (p.prazo ?? ini).toISOString(),
      dia,
      diaInteiro: true,
      userId: "",
      clienteId: p.clienteId,
      projetoId: p.id,
      tarefaId: null as string | null,
      local: "",
      link: `/projetos/${p.id}`,
      status: p.status,
      prioridade: "normal",
      cor: "#9a7840",
      tipo: "entrega",
      serie: false,
      origem: "projeto" as const,
      dono: "",
      cliente: p.cliente?.nome ?? null,
      contato: "",
      projeto: p.nome,
      tarefa: null as string | null,
    };
  });
  return [...itens, ...blocosTarefa, ...blocosProjeto];
}

export async function buscarGlobal(q: string) {
  await eu();
  const s = q.trim();
  if (s.length < 1) {
    return { clientes: [], tarefas: [], eventos: [], projetos: [] };
  }
  const [clientes, tarefas, eventos, projetos] = await Promise.all([
    prisma.cliente.findMany({ where: { ...vivo, nome: { contains: s } }, take: 8 }),
    prisma.tarefa.findMany({ where: { ...vivo, titulo: { contains: s } }, take: 8 }),
    prisma.evento.findMany({ where: { ...vivo, titulo: { contains: s } }, take: 8 }),
    prisma.projeto.findMany({ where: { ...vivo, nome: { contains: s } }, take: 8 }),
  ]);
  return { clientes, tarefas, eventos, projetos };
}

export async function tarefaDeEvento(eventoId: string) {
  const user = await eu();
  const ev = await prisma.evento.findFirst({ where: { id: eventoId, ...vivo } });
  if (!ev) {
    return falha("evento sumiu");
  }
  if (ev.tarefaId) {
    return { ok: true as const, id: ev.tarefaId };
  }
  const t = await prisma.tarefa.create({
    data: {
      titulo: ev.titulo,
      descricao: ev.descricao,
      assigneeId: ev.userId || user.id,
      criadorId: user.id,
      prazo: ev.inicio,
      clienteId: ev.clienteId,
      projetoId: ev.projetoId || (await projetoDaCasa(null)),
      empresaId: EMPRESA,
    },
  });
  await prisma.evento.update({ where: { id: ev.id }, data: { tarefaId: t.id } });
  revalidateCasa(`/tarefas/${t.id}`);
  return { ok: true as const, id: t.id };
}

