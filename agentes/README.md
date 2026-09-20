# 🤖 Equipe de agentes da MAI

O cérebro é a **VM do Grok Bot**. Cursor escreve. Discord, por agora, é
só gente (sem API xAI e sem plugin Discord).

Vários especialistas no GitHub. Cada assunto acorda **somente um**
funcionário (no PR: QA e no máximo +1 Dev). Ele lê o Git; não escreve.
Quem constrói código no dia a dia continua sendo Cursor, com revisão
humana.

```text
Git mudou ou humano pediu review
→ orquestrador escolhe 1 ficha (QA no PR)
→ lê contexto mínimo + memória viva + essa ficha
→ uma fala: ok / risco / erro
```

Não existem salas extras para a IA. Os canais humanos já são o escritório.

## O que cada arquivo é

| Arquivo | Função | Entra em toda pergunta? |
|---|---|---|
| `CONTEXTO-MINIMO.md` | Regras curtas da empresa | Sim |
| `MEMORIA-VIVA.md` | Recorte atual (~200 palavras) | Sim |
| `nome/AGENT.md` | Identidade de um especialista | Só o escolhido |
| `nome/MEMORY.md` | Aprendizado aprovado | Só se existir regra aprovada |
| `nome/skills/` | Passo a passo de uma tarefa | Só se a pergunta pedir essa tarefa |

A [MAI Central](../MAPA-WIREFRAME-MVP-MAI.md) continua sendo a fonte oficial.
Se este resumo divergir do mapa, o mapa vence.

## Quem acorda quando

Quente (canal já escolhe):

- `ceo` `produto` `dev` `design` `qa`

Frio (só se alguém chamar pelo nome):

- `pesquisa` `marketing` `financeiro` `juridico` `seguranca` `operacoes`

## Como chamar

```text
/grok Como validar o primeiro produto?
/grok agente:qa Esse PR quebra cadastro?
@Grok dev: essa pasta está clara?
```

No `#backend`, o bot já chega como Dev. No `#produto`, como Produto.

## Como melhorar um funcionário

1. Corrigir a resposta da vez.
2. Se o erro for estável, propor uma linha em `MEMORY.md`.
3. Se a tarefa se repetir, criar uma skill.
4. Só então o GrokBot passa a carregar isso.

Não grave conversa inteira como memória. Não envie o repositório inteiro
em toda pergunta.

Treinamentos longos não entram crus. Destilar em
[docs/treinamentos/LOTE-04-20.md](../docs/treinamentos/LOTE-04-20.md) e,
se for tarefa repetível, numa skill.
