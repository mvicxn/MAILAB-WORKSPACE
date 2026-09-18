# 🤖 Organizador completo do Discord da MAI

Este script monta e mantém uma estrutura visual, explicada e pronta para
operação no servidor da MAI. Ele pode ser executado novamente: reaproveita
o que já existe, renomeia os canais antigos sem emoji, atualiza descrições
e não duplica os guias iniciais.

## 🔐 Segurança

- O token é solicitado diretamente no terminal e não aparece enquanto é
  digitado.
- Nunca coloque o token neste repositório, no Discord ou na MAI Central.
- O `.gitignore` impede o envio de arquivos `.env`.
- Se o token for exposto, use **Redefinir token** no Developer Portal.
- Depois da primeira configuração, remova `Administrador` do bot e deixe
  somente as permissões necessárias.

## 🗺️ O que será criado

### 🚪 INÍCIO

- `👋・boas-vindas` — apresentação da MAI.
- `📜・regras` — convivência, segurança e organização.
- `🧭・comece-aqui` — mapa para novos membros.
- `📢・anuncios` — comunicados oficiais.

### 👑 DIREÇÃO

- `📣・ceo` — visão e decisões finais.
- `🗺️・planejamento` — roadmap e prioridades.
- `🧠・decisoes` — decisões resumidas e links do GitHub.
- `💡・ideias` — hipóteses ainda não validadas.
- `📚・aprendizados` — conhecimento reutilizável.
- `📡・status-da-mai` — estado dos projetos.

### 💡 PRODUTO

- `💡・produto` — problemas, clientes e MVP.
- `🔎・pesquisa-de-mercado` — evidências e validação.

### 💻 DESENVOLVIMENTO

- `⚙️・backend` — APIs e dados.
- `🖥️・frontend` — telas e experiência.
- `🐞・bugs` — problemas e correções.
- `🔀・pull-requests` — revisão de branches e PRs.

### 🎨 DESIGN

- `🎨・design` — UX, UI e wireframes.
- `✨・criativos` — artes, vídeos e anúncios.

### 📣 MARKETING

- `📈・trafego` — campanhas e métricas.
- `✍️・copy` — textos de venda e comunicação.

### 💰 FINANCEIRO

- `💰・financeiro` — preços, custos, margem e caixa.

### 🛠️ OPERAÇÕES

- `🧪・qa` — testes e qualidade.
- `🛡️・seguranca` — riscos, permissões e privacidade.
- `🤝・clientes` — entrega, onboarding e feedback.
- `📥・novos-clientes` — novas oportunidades.
- `🛠️・suporte` — dúvidas e manutenção pós-entrega.

### ⚙️ AUTOMAÇÕES

- `🔔・github-alertas` — commits, PRs e issues.
- `🤖・ia-relatorios` — relatórios dos bots.
- `🚨・incidentes` — problemas críticos.
- `📊・metricas` — números para tomada de decisão.

### 🗄️ ARQUIVO

- `📦・produtos-pausados` — projetos pausados.
- `🏁・produtos-encerrados` — projetos encerrados e aprendizados.

### 🔐 DIREÇÃO PRIVADA

Visível apenas ao cargo `👑・Sócios`:

- `🔐・decisoes-privadas` — assuntos estratégicos restritos.
- `💵・negociacoes` — contratos e negociações.
- `⚠️・riscos-e-crises` — riscos e crises da direção.

## 🏷️ Cargos

O script cria:

`👑・Sócios`, `🤖・IA`, `🧭・CEO`, `💡・Produto`, `💻・Dev`,
`🎨・Design`, `📣・Marketing`, `💰・Financeiro`, `🧪・QA`,
`🛡️・Segurança`, `🛠️・Operações`, `👤・Colaborador` e `👀・Leitor`.

O script não atribui cargos automaticamente a pessoas. Faça isso no Discord
depois de conferir a hierarquia.

## 🧾 Guias automáticos

Cada canal recebe uma primeira mensagem com:

- para que o canal serve;
- o que publicar;
- modelo de registro quando fizer sentido;
- lembrete de não enviar segredos;
- referência ao GitHub quando aplicável.

As mensagens possuem um marcador interno. Executar o script de novo não
cria cópias dos guias.

## ▶️ Como executar

### Configurar o token uma única vez

O token pode ficar salvo somente no computador, fora do repositório:

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
bash discord-organizer/save-token.sh
```

O script pede o token sem mostrá-lo e salva em:

```text
~/.config/mai/discord.env
```

O arquivo recebe permissão `600`, ou seja, somente seu usuário pode
acessá-lo. Não envie o conteúdo desse arquivo para ninguém.

### Executar depois sem informar o token novamente

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
bash discord-organizer/run-saved.sh
```

Esse comando reutiliza o token salvo e executa o organizador.

### Execução manual alternativa

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
. discord-organizer/.venv/bin/activate
python discord-organizer/organize_server.py
```

Quando aparecer:

```text
Cole o token do bot (não será exibido):
```

cole o token diretamente no terminal e pressione Enter. O script cria e
atualiza a estrutura e encerra a conexão ao finalizar.

## ✅ Conferência depois da execução

- [ ] As categorias aparecem com emojis.
- [ ] Os canais antigos foram renomeados quando necessário.
- [ ] Cada canal tem descrição.
- [ ] Cada canal tem um guia inicial.
- [ ] Os cargos foram criados.
- [ ] A área `🔐 DIREÇÃO PRIVADA` só aparece para `👑・Sócios`.
- [ ] O bot não continua com Administrador sem necessidade.
- [ ] O token não foi salvo em arquivo ou enviado ao GitHub.
