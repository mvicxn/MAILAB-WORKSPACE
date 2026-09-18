# 🤖 Conversa do Grok no Discord

Este é o primeiro protótipo da conversa em tempo real com o Grok no servidor
da MAI. Ele lê a MAI Central e o documento da integração antes de responder.

## Como conversar

Depois de iniciar o bridge, use no Discord:

```text
/grok Como devemos validar o primeiro produto?
```

Também é possível mencionar o bot:

```text
@Grok Como essa decisão afeta o MVP?
```

O bot lê algumas mensagens recentes do canal para manter o contexto da
discussão e responde em partes quando o texto é longo.

## O que esta primeira versão faz

- conversa em português;
- mantém contexto curto do canal;
- usa a MAI Central como contexto;
- usa o documento de integração como contexto;
- responde por `/grok` ou menção;
- cita incertezas e pede consenso quando necessário;
- não executa ações no GitHub ou Discord;
- não faz merge, apaga conteúdo ou altera permissões.

## Segredos locais

O bot precisa de duas credenciais, ambas fora do GitHub:

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
bash grok-bridge/save-xai-key.sh
bash grok-bridge/run-saved.sh
```

O token do Discord já pode estar em `~/.config/mai/discord.env`. A chave
xAI fica em `~/.config/mai/grok.env`, ambas com permissão `600`.

Não cole nenhuma chave no chat, em Issues, no Discord ou no repositório.

## Configuração do Discord

Para receber mensagens por menção, ative **Message Content Intent** no
Developer Portal do bot. O comando `/grok` funciona via slash command.

O bot deve começar com permissões mínimas: ver canais, enviar mensagens,
ler histórico e usar comandos. Não precisa de Administrador para conversar.

## Próxima evolução

Depois de testar a conversa:

1. receber eventos do GitHub;
2. resumir PRs e Issues;
3. encaminhar cada evento ao agente certo;
4. só depois avaliar ações controladas com aprovação humana.
