# 🤖 Norte da integração Grok + GitHub + Discord

> Documento de arquitetura, comportamento e limites para a futura equipe de
> agentes do Grok trabalhar conectada ao GitHub e ao Discord da MAI.

**Status:** Planejamento da integração  
**Versão:** 1.0  
**Data:** 2026-09-18  
**Responsáveis humanos:** Maicon e Ian  
**Servidor:** MAI LAB CORP  
**Repositório oficial:** `mvicxn/MAILAB-WORKSPACE`

---

## 1. A ideia em linguagem simples

O Grok será uma equipe de especialistas da MAI. Ele poderá ler o contexto
do GitHub, entender o estado do projeto e conversar com Maicon, Ian e os
agentes pelo Discord.

O fluxo imaginado é:

```text
GitHub muda
→ integração recebe o evento
→ Grok lê o contexto relevante
→ agente especializado analisa
→ resultado aparece no Discord
→ humanos decidem ou pedem uma ação
→ ação aprovada fica registrada no GitHub
```

O Discord será a interface de conversa. O GitHub continuará sendo a fonte
oficial do código, das tarefas, dos Pull Requests e da documentação.

O Grok não deve "girar o Discord" de forma descontrolada. Ele deve ativar
os canais certos, resumir eventos úteis, criar alertas e responder quando
for chamado, sempre respeitando regras, permissões e aprovação humana.

---

## 2. O que a integração deve resolver

A integração deve reduzir o trabalho repetitivo de acompanhar projetos:

- avisar quando um commit ou Pull Request importante acontecer;
- resumir alterações para quem não viu o código;
- encaminhar cada assunto ao agente especializado;
- detectar bugs, riscos e possíveis problemas de segurança;
- lembrar tarefas paradas ou bloqueadas;
- manter Discord e GitHub apontando para o mesmo contexto;
- permitir perguntas em linguagem simples;
- registrar decisões tomadas no Discord no GitHub;
- ajudar Maicon e Ian a saber o que precisa de atenção.

Ela não deve transformar todo evento do GitHub em spam. O valor está em
filtrar, resumir e encaminhar o que realmente merece atenção.

---

## 3. O que o Grok deve ler antes de responder

### Contexto obrigatório

Antes de analisar um evento ou responder sobre a MAI, a integração deve
buscar, quando necessário:

1. [MAI Central](../MAPA-WIREFRAME-MVP-MAI.md).
2. `README.md` do repositório.
3. Issue, Pull Request ou commit relacionado.
4. Documentos do produto envolvido.
5. Decisões relacionadas.
6. Instruções do agente especializado.
7. Discussões relevantes do próprio Pull Request.

### Contexto que não deve ser enviado automaticamente

- tokens, senhas e chaves;
- arquivos `.env`;
- dados pessoais desnecessários;
- documentos financeiros confidenciais;
- conversas privadas sem autorização;
- conteúdo completo do repositório quando apenas um arquivo é suficiente.

O princípio é **menor contexto necessário**: enviar ao agente apenas o que
ele precisa para responder bem.

### Ordem de leitura

```text
regra geral da MAI
→ regra do projeto
→ tarefa ou evento
→ arquivos relevantes
→ histórico necessário
→ análise
```

Se houver conflito entre documentos, o agente deve informar a divergência e
não escolher silenciosamente uma versão.

---

## 4. Agentes especializados

O Grok pode funcionar como uma equipe de agentes, mesmo que tecnicamente
exista um único bot coordenador.

### 🧭 CEO

Resume estado geral, prioridades, bloqueios e decisões pendentes.

### 💡 Produto

Verifica problema, público, proposta de valor, escopo e aderência ao MVP.

### 🔎 Pesquisa

Separa fatos de hipóteses, analisa concorrentes e aponta o que ainda precisa
ser validado com pessoas reais.

### 💻 Dev

Analisa arquitetura, organização, manutenção, testes e impacto técnico.

### 🎨 Design

Revisa fluxos, clareza da interface, consistência visual e experiência.

### 📣 Marketing e Copy

Avaliam oferta, mensagem, público, campanha, conversão e clareza do texto.

### 💰 Financeiro

Analisa custos, preço, margem, receita, caixa e hipóteses financeiras.

### ⚖️ Jurídico

Aponta riscos de contrato, propriedade, privacidade e LGPD. Não substitui
orientação de profissional habilitado.

### 🧪 QA

Cria cenários de teste, procura regressões e verifica critérios de aceite.

### 🛡️ Segurança

Procura segredos expostos, permissões excessivas, problemas de autenticação,
dados desnecessários e riscos de dependências.

### 🛠️ Operações

Organiza entrega, suporte, clientes, incidentes e próximos passos.

---

## 5. Como o evento deve ativar a equipe

### Conversa em tempo real no Discord

Sim, Maicon e Ian poderão discutir com o Grok no próprio chat. A primeira
versão usa dois caminhos:

```text
/grok pergunta
```

ou:

```text
@Grok pergunta
```

O bridge lê a MAI Central, este documento e algumas mensagens recentes do
canal. Ele envia a pergunta para a API da xAI e publica a resposta no
mesmo canal, dividindo textos longos em mensagens menores.

Isso cria uma conversa real, mas não dá autonomia perigosa ao bot. Nesta
primeira versão ele:

- responde;
- mantém contexto curto da conversa;
- explica fatos, hipóteses e riscos;
- sugere próximos passos;
- não faz merge;
- não apaga canais ou arquivos;
- não altera GitHub ou permissões;
- não trata uma sugestão como decisão aprovada.

Para menções funcionarem, o **Message Content Intent** precisa estar ativo
no Developer Portal. O comando `/grok` usa comandos do Discord e continua
sendo o caminho preferencial quando não quisermos liberar leitura geral das
mensagens.

O protótipo está em [`grok-bridge/`](../grok-bridge/README.md). As chaves
ficam somente no computador, fora do GitHub.

### Commit enviado

O agente Dev resume:

- arquivos alterados;
- objetivo provável;
- riscos;
- testes existentes;
- necessidade de revisão.

Não é necessário enviar mensagem para cada commit pequeno. Commits podem
ser agrupados por Pull Request ou por janela de tempo.

### Pull Request aberto

Ativar:

- Dev;
- QA;
- Segurança quando tocar em autenticação, dados, pagamentos ou permissões;
- Design quando houver alteração visual;
- Produto quando alterar escopo ou comportamento.

O resultado deve aparecer em `🔀・pull-requests` e ficar ligado ao PR.

### Issue criada

Classificar como:

- hipótese;
- tarefa;
- bug;
- segurança;
- documentação;
- bloqueio.

O bot pode sugerir labels e perguntas faltantes, mas não deve marcar uma
ideia como validada sem evidência.

### Alteração na MAI Central

O agente CEO verifica se a mudança:

- é apenas editorial;
- muda uma regra;
- cria obrigação;
- afeta segurança, dinheiro, cliente ou direção.

Se for ambígua, publicar uma proposta em `🧠・decisoes` e aguardar consenso.

### Issue ou PR parado

O agente Operações pode lembrar responsáveis, com limite de frequência.
Lembretes não devem constranger pessoas nem criar cobrança automática
excessiva.

### Falha de workflow ou teste

Ativar Dev e QA. Se houver indício de exposição ou risco, ativar Segurança
e publicar alerta em `🚨・incidentes`.

### Mudança de segurança

Ativar Segurança imediatamente. O alerta deve evitar expor a própria
vulnerabilidade em canal público quando isso aumentar o risco.

---

## 6. Mapa GitHub → Discord

| Evento | Canal principal | Agente inicial |
|---|---|---|
| Issue de produto | `💡・produto` | Produto |
| Issue de bug | `🐞・bugs` | QA + Dev |
| Pull Request | `🔀・pull-requests` | Dev |
| Mudança visual | `🎨・design` | Design |
| Falha de teste | `🧪・qa` | QA |
| Risco técnico | `🛡️・seguranca` | Segurança |
| Commit relevante | `🔔・github-alertas` | CEO + Dev |
| Métrica ou campanha | `📊・metricas` | Marketing + Financeiro |
| Cliente ou entrega | `🤝・clientes` | Operações |
| Decisão | `🧠・decisoes` | CEO |
| Crise | `🚨・incidentes` | Operações + Segurança |
| Resultado dos agentes | `🤖・ia-relatorios` | Coordenador |

O canal é um destino de comunicação, não uma fonte alternativa da verdade.
Cada alerta deve incluir link para o item original no GitHub.

---

## 7. Formato padrão de resposta do Grok

Toda análise importante deve seguir um formato previsível:

```text
🤖 AGENTE:
📌 CONTEXTO:
✅ FATOS:
💡 INTERPRETAÇÃO:
⚠️ RISCOS:
❓ DÚVIDAS:
🎯 RECOMENDAÇÃO:
👤 APROVAÇÃO NECESSÁRIA:
🔗 REFERÊNCIAS:
```

### Exemplo

```text
🤖 QA
📌 PR #12 altera o fluxo de cadastro.
✅ FATO: o campo de telefone foi tornado obrigatório.
💡 INTERPRETAÇÃO: usuários antigos podem não ter esse dado.
⚠️ RISCO: migração ou erro no login.
❓ DÚVIDA: existe cadastro legado em produção?
🎯 RECOMENDAÇÃO: testar usuário antigo antes do merge.
👤 APROVAÇÃO: Ian ou Maicon.
🔗 REFERÊNCIA: link do Pull Request.
```

O agente deve dizer quando não sabe. Confiança falsa é pior que resposta
incompleta.

---

## 8. Permissões e níveis de autonomia

### Nível 0 — somente leitura

O agente lê GitHub e responde perguntas no Discord. Não altera nada.

### Nível 1 — sugestão

O agente pode sugerir labels, comentários, resumos, tarefas e respostas.
Uma pessoa confirma antes de publicar ou criar qualquer item.

### Nível 2 — automação controlada

O agente pode executar ações previamente aprovadas e reversíveis, como:

- adicionar label;
- publicar resumo em canal específico;
- criar lembrete;
- abrir Issue a partir de um comando explícito.

### Nível 3 — ação com aprovação

O agente prepara PRs, alterações de documentação ou correções, mas aguarda
aprovação humana para merge ou publicação.

### Ações sempre humanas

- merge na `main`, salvo política futura explícita;
- apagar canal, branch, Issue ou histórico;
- mudar permissões;
- alterar contratos, preços ou pagamentos;
- publicar produto;
- tratar incidente crítico;
- alterar a MAI Central em regra ambígua;
- acessar ou compartilhar segredo.

A autonomia deve crescer por evidência e confiança, não por pressa.

---

## 9. O ciclo de vida de uma mensagem

```text
1. Evento chega do GitHub ou alguém chama o bot.
2. Coordenador identifica projeto, tipo e urgência.
3. Busca somente o contexto necessário.
4. Escolhe agente especializado.
5. Agente produz análise estruturada.
6. Coordenador remove duplicidade e informações sensíveis.
7. Publica no canal correto com link de origem.
8. Marca aprovação ou ação necessária.
9. Registra decisão no GitHub quando aplicável.
10. Guarda o aprendizado para melhorar o agente.
```

### Deduplicação

O mesmo evento não deve criar cinco mensagens iguais. A integração deve
guardar um identificador do evento e agrupar análises relacionadas.

### Frequência

Alertas informativos podem ser agrupados. Incidentes de segurança e falhas
críticas devem ser imediatos.

---

## 10. Segurança da integração

- Usar tokens separados para GitHub, Discord e Grok.
- Guardar segredos em variáveis protegidas ou secret manager.
- Nunca colocar tokens em Issues, PRs, logs ou mensagens do Discord.
- Dar ao bot somente as permissões necessárias.
- Validar assinatura de webhooks.
- Registrar quem iniciou cada ação.
- Limitar frequência de chamadas.
- Redigir dados pessoais antes de enviar ao modelo.
- Manter trilha de auditoria para ações automáticas.
- Revogar e renovar credenciais quando houver suspeita.
- Testar a integração em ambiente de teste antes da produção.

O bot de Discord não deve receber `Administrador` permanentemente. Essa
permissão pode ser usada durante uma configuração controlada e removida
depois.

---

## 11. Quando o Grok estiver indisponível

A MAI continua funcionando manualmente:

- GitHub continua guardando código e histórico;
- Discord continua servindo para comunicação;
- Issues e PRs continuam existindo;
- Maicon e Ian podem revisar diretamente;
- nenhum dado deve ser perdido por depender da IA.

A integração é uma camada de aceleração, não um ponto único de falha.

---

## 12. Fases de implementação

### Fase 1 — leitura e resumo

- conectar eventos do GitHub;
- ler MAI Central e itens relacionados;
- publicar resumos no Discord;
- não executar alterações.

### Fase 2 — classificação e revisão

- sugerir labels;
- encaminhar ao agente certo;
- comentar em PRs;
- criar relatórios de QA e Segurança;
- exigir confirmação humana.

### Fase 3 — ações controladas

- abrir Issues por comando;
- atualizar documentação aprovada;
- criar lembretes;
- sincronizar decisões.

### Fase 4 — autonomia supervisionada

- preparar PRs;
- executar rotinas aprovadas;
- acompanhar métricas;
- propor mudanças de processo;
- manter aprovação humana para ações críticas.

Não pular diretamente para a Fase 4.

---

## 13. Checklist antes de conectar ao Discord

- [ ] O repositório correto foi configurado.
- [ ] A MAI Central foi lida pelo agente.
- [ ] O servidor e os canais foram identificados.
- [ ] Os cargos e permissões foram revisados.
- [ ] Webhooks têm assinatura validada.
- [ ] Segredos estão fora do Git.
- [ ] O bot começa no Nível 0 ou 1.
- [ ] Existe canal para relatórios da IA.
- [ ] Existe canal para incidentes.
- [ ] Cada mensagem terá link de origem.
- [ ] Existe forma de desligar a integração.
- [ ] Existe registro de auditoria.
- [ ] Maicon e Ian sabem como aprovar ou rejeitar ações.

---

## 14. Norte final

O Grok deve fazer a MAI parecer uma equipe organizada, não uma máquina
barulhenta.

Ele deve:

- ler antes de opinar;
- resumir antes de espalhar;
- perguntar antes de assumir;
- citar a fonte;
- separar fato de hipótese;
- encaminhar ao especialista certo;
- pedir aprovação quando necessário;
- aprender com decisões e resultados;
- respeitar a MAI Central;
- manter humanos no controle das decisões importantes.

```text
GitHub é a memória oficial
Discord é a conversa operacional
Grok é a equipe de análise
Maicon e Ian são os responsáveis finais
```
