# MAI LAB — escritório neste PC

Login: Maicon, Ian e o Carlos (`carlos@mai.local`). Tarefas com prazo,
clientes, projetos, News (Git da casa e Mundo), quadro ao vivo.

Grok trabalha pela **tela**, igual gente. Um bot só. Sem API de funcionário.

News: a aba Git lê o `git log` desta pasta. Carlos também posta em `POST /api/mesa/news` (`prateleira`: `git` ou `mundo`).
Sócios leem a aba News. Sem X.

## Ligar

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /home/mm-lab-corp/MAILAB-WORKSPACE/mailab-workspace/apps/caderninho
npm run dev
```

- Neste PC: http://localhost:3000
- Ian na mesma Wi-Fi: http://192.168.1.148:3000

A primeira vez pede a senha dos dois sócios. O Carlos nasce sozinho no
banco (login `carlos` / e-mail `carlos@mai.local`). Senha nova, se
ainda não existia, fica em `~/.config/mai/funcionarios.env`.

Em **Manutenção**, o sócio cola o endereço e a chave da rotina MAI LAB.
Não é a rotina Discord. Equipe é só gente. Chat mostra quem está online.

Os nomes das pessoas ficam no `prisma/dev.db` (não sobe pro Git).

Rotina: `grok-bridge/GROK-BOT-FUNCIONARIOS.md`.

IA (Cursor ou Copilot): leia `AGENTS.md` na raiz do repo.
