# Caderninho da MAI

Nome provisório. Hipótese interna. Ainda não é produto pago.
O app vive em `apps/caderninho/`. Nome na tela: escritório MAI LAB.

## Problema

Oportunidade e conversa somem no Discord e na cabeça. Dois sócios
não têm um lugar único pra ver: quem é a pessoa, em que pé está, qual o
próximo passo, quem está trabalhando.

## Público

Primeiro usuário: Maicon e Ian (MAI LAB CORP).
Cliente de fora: ninguém validado. Não inventar.

## Pilha desta casa

- Next.js + TypeScript + Prisma + SQLite neste PC.
- Login JWT no cookie `mai`. Humanos: `adminmm` e `adminian`.
- Túnel Cloudflare quando precisar abrir de fora. Não é Vercel.
- Grok Bot entra pela tela, como o Carlos. Sem API xAI.
- ChatGPT sugeriu Spring Boot + PostgreSQL + n8n. Não entra nesta casa.

## O que o ChatGPT acertou (e entra)

Dividir em **MVP** e **versão 2**. Não construir 200 telas de uma vez.
CRM de operação diária: dashboard, clientes, conversa, pipeline, tarefa,
agenda, equipe, números. Base pronta pra crescer (timeline, auditoria,
tags, campo extra, modelo de mensagem) — sem fingir WhatsApp, e-mail
ou telefone que a casa não usa.

## MVP (vender primeiro — já na tela)

- **Hoje** — dashboard: mesa, atraso, Grok em campo, movimento.
- **Tarefas** — quadro de status. Pedido novo numa página só.
- **Ponte** — POST to e key da rotina MAI LAB. Distinta da Equipe.
- **Clientes** — lista honesta + ficha + timeline da pessoa.
- **Conversas** — chat no projeto e com o Grok. Canal interno, não WhatsApp.
- **Pipeline** — interno / conversa / proposta / fechado.
- **Tarefas** — pedido, diário, quadro, entrega do Grok.
- **Agenda** — calendário mês; evento, prazo de tarefa e projeto.
- **News** — Nosso Git e Mundo. Carlos posta. Sem X.
- **Equipe** — Maicon, Ian e o Carlos. Rotina cola no PC.
- **Números** — contagem do que existe. Sem métrica inventada.

Tags manuais na ficha. Cada ação relevante vira atividade. Auditoria
grava quem, o quê, quando e IP. Campo `extra` e tabelas
`ModeloMensagem` / `CampoPersonalizado` existem no banco, sem tela de
construtor.

## Versão 2 (não construir agora)

Automações · financeiro · estoque opcional · IA completa · API pública ·
integrações · histórico real de WhatsApp/e-mail/chamada · widgets
arrastáveis · permissão por módulo/ação/empresa na tela · restaurar
histórico · construtor de campo personalizado · tags automáticas.

## Fora mesmo na versão 2, sem evidência

Estoque, NF-e, folha, RH. Oracle, Redis, Jarvis. Cliente inventado.
Vender o caderninho pra outra empresa.

## Módulos enterprise (arquitetura, alguns desligados)

Preparados no banco, não como produto falso:

1. Comunicação — modelo de mensagem; canal interno já existe; WhatsApp/e-mail/telefone só quando houver canal de verdade.
2. Auditoria — ação, entidade, data, IP. Restaurar histórico é V2.
3. Permissões — hoje: humano vs IA, sócio vs funcionário. Por módulo/ação/empresa é V2.
4. Dashboard personalizável — Hoje é fixo. Widgets arrastáveis são V2.
5. Campos personalizados — JSON `extra` + tabela. Sem tela de criar campo.
6. Tags — cor, nome, filtro futuro. Automáticas são V2.
7. Central de atividades — timeline por cliente, movimento no Hoje.
8. MAIBOT — Grok já resume trabalho na mesa. Classificar cliente, sugerir resposta e relatório automático são V2.

## Critério de sucesso

Os dois abrem Hoje e atualizam cliente/projeto/tarefa. Próximo passo
não mora só no chat.

## Critério de abandono

Ninguém abre em 7 dias, ou começa pedido de estoque/NF-e antes de ter
gente na lista.

## Responsável

Maicon e Ian. Cursor escreve. Humanos decidem merge, dinheiro e contrato.
