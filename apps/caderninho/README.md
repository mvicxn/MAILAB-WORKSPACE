# MAI LAB — escritório neste PC

Login: Maicon, Ian e o time (cada Grok Bot com o cargo dele). Tarefas
com prazo, clientes, projetos, reunião no painel, quadro ao vivo.

Grok trabalha pela **tela**, igual gente. Sem API de funcionário.

## Ligar

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd /home/mm-lab-corp/MAILAB-WORKSPACE/mailab-workspace/apps/caderninho
npm run dev
```

- Neste PC: http://localhost:3000
- Ian na mesma Wi-Fi: http://192.168.1.148:3000

A primeira vez pede a senha dos dois sócios. Em **Equipe**, o sócio
contrata o time e copia as senhas para cada Grok Bot.

Os nomes das pessoas ficam no `prisma/dev.db` (não sobe pro Git).
Senhas dos bots: `~/.config/mai/funcionarios.env`.

Rotinas: `grok-bridge/GROK-BOT-FUNCIONARIOS.md`.
