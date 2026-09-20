# 🤖 Conversa do Grok no Discord

**Status (2026-09-20):** protótipo **cancelado como cérebro**. O plano
Cursor/Grok Bot não libera API xAI. Sem plugin Discord na VM, o
escritório no Discord continua só de gente.

O cérebro oficial agora é a **VM do Grok Bot**. Este código fica no
repo como interfone legado, se um dia houver chave de API.

---

Um bot. Vários especialistas. Cada pergunta acorda **só um**. Esse um
pode ler o Git da pasta da MAI, como quem abre um arquivo na hora — não
como quem imprime o repositório.

## Como ligar no Discord

Já existe o aplicativo do bot. A integração é este processo, não um bot
novo por funcionário.

1. No [Discord Developer Portal](https://discord.com/developers/applications),
   no bot da MAI, ligue **Message Content Intent**.
2. Convide o bot ao servidor **MAI LAB CORP** com permissão de ver canal,
   enviar mensagem, ler histórico e usar comandos. Sem Administrador.
3. Guarde as chaves só no computador:

```bash
bash discord-organizer/save-token.sh
bash grok-bridge/save-xai-key.sh
```

4. Deixe o GrokBot ligado, na pasta do repositório:

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
bash grok-bridge/run-saved.sh
```

Enquanto esse comando estiver rodando, o bot está no escritório. Se
desligar o processo, ele some do Discord.

5. No Discord, chame:

```text
/grok Como devemos validar o primeiro produto?
/grok agente:dev O grok-bridge está claro?
@Grok qa: esse fluxo quebra?
```

O canal escolhe o funcionário se você não escolher: `#backend` → Dev,
`#produto` → Produto. A resposta vem **na mesma sala**, assinada.

## O que ele vê do Git

O bot roda no computador que já tem o repositório. Por isso os
especialistas enxergam o projeto **sem conta extra no GitHub**.

Podem:

- listar pastas;
- abrir um arquivo;
- buscar um termo;
- ver `git status`, `git log` e um resumo de diff.

Não podem:

- commit, push, merge, apagar, mudar permissão;
- ler `.env`, token ou chave;
- despejar o repo inteiro numa pergunta.

Cursor continua sendo quem **escreve** código. O GrokBot **analisa e
conversa** no Discord.

## O que esta versão faz

- conversa em português, no papel do especialista;
- carrega contexto mínimo + 1 ficha;
- lê o Git só no trecho pedido;
- responde por `/grok` ou menção;
- não trata sugestão como decisão.

## Segredos

Token Discord: `~/.config/mai/discord.env`  
Chave xAI: `~/.config/mai/grok.env`  
Permissão `600`. Não cole chave no chat, Issue ou repositório.

## Próxima evolução

1. Testar Dev e QA no Discord com perguntas reais do repo.
2. Só então avisar PR/Issue no Discord, agrupado.
3. Memória aprovada depois de correção humana.
4. Muito depois: ações controladas.
