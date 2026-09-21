# MAI LAB — escritório neste PC

Login: Maicon, Ian e o Carlos (`carlos@mai.local`). Tarefas com prazo,
clientes, projetos, reunião no painel, quadro ao vivo.

Grok trabalha pela **tela**, igual gente. Um bot só. Sem API de funcionário.

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

Em **Equipe**, o sócio cola o POST to e a key da rotina MAI LAB (um
webhook). Não é a rotina Discord.

Os nomes das pessoas ficam no `prisma/dev.db` (não sobe pro Git).

Rotina: `grok-bridge/GROK-BOT-FUNCIONARIOS.md`.
