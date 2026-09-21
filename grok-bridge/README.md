# 🤖 Grok no Discord da MAI

Um bot. Vários especialistas. Cada pergunta acorda **só um**.
O cérebro é o **Grok do plano Cursor** (não a API xAI).

Enquanto `run-saved.sh` estiver ligado neste computador, o bot aparece
no servidor. Se o PC dormir ou o processo cair, ele some.

## Como chamar

No Discord, na sala do assunto:

```text
/grok Como devemos validar o primeiro produto?
/grok agente:qa Esse fluxo quebra?
@Grok dev: essa pasta está clara?
```

O canal escolhe o funcionário se você não escolher: `#backend` → Dev,
`#produto` → Produto, `#bugs` → André (QA). CEO fala como Carlos.

## Ligar (uma vez)

1. No [Discord Developer Portal](https://discord.com/developers/applications),
   no bot da MAI, ligue **Message Content Intent**.
2. Convide o bot ao servidor **MAI LAB CORP** com permissão de ver canal,
   enviar mensagem, ler histórico e usar comandos. Sem Administrador.
3. Crie uma chave em [Cursor Dashboard → API Keys](https://cursor.com/dashboard/api).
   É o plano Cursor, não a API da xAI.
4. No computador:

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE/mailab-workspace
bash grok-bridge/setup.sh
bash grok-bridge/save-cursor-key.sh
bash grok-bridge/run-saved.sh
```

O token Discord já está em `~/.config/mai/discord.env`.
A chave Cursor fica em `~/.config/mai/cursor.env`. Permissão `600`.
Não cole chave no chat, Issue ou repositório.

## O que ele vê

O bot roda na pasta do Git. Os especialistas leem o projeto daqui.
Nível 0: conversar e sugerir. Não mergeiam, não publicam, não gastam.

Cursor (este chat) continua sendo quem **escreve** código quando você pede.
O Grok no Discord **analisa e conversa**.

## Segredos

Token Discord: `~/.config/mai/discord.env`  
Chave Cursor: `~/.config/mai/cursor.env`  
A API xAI **não** é necessária.
