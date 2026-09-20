# 🤖 Aprendizados para melhorar os agentes da MAI

> Documento de análise baseado na transcrição estudada. Não é uma
> transcrição do vídeo e não transforma ideias externas automaticamente em
> regras da MAI Central.

**Status:** Proposta de evolução  
**Versão:** 1.0  
**Data:** 2026-09-18  
**Próxima decisão:** Maicon e Ian devem revisar antes de incorporar regras
à MAI Central.

---

## 1. O que aprendemos

### 1.1 Chatbot não é agente

Um chatbot normalmente responde uma pergunta e para. Um agente recebe um
objetivo, observa o contexto, escolhe um próximo passo, usa ferramentas,
confere o resultado e continua ou pede ajuda.

Para a MAI:

```text
objetivo
→ observar
→ planejar
→ agir
→ conferir
→ ajustar ou concluir
```

Isso não significa dar autonomia total. O agente só deve agir dentro do
nível de permissão aprovado.

### 1.2 Contexto não é memória

**Contexto** é o que o agente precisa ler para trabalhar agora:

- MAI Central;
- produto;
- Issue;
- Pull Request;
- regras do canal;
- arquivos relevantes.

**Memória** é o aprendizado persistente que continua valendo em sessões
futuras:

- correções feitas pelos sócios;
- preferências aprovadas;
- erros recorrentes;
- decisões de comunicação;
- padrões que funcionaram;
- coisas que o agente não deve repetir.

Misturar os dois gera arquivos confusos. O contexto explica o ambiente. A
memória registra aprendizados estáveis.

### 1.3 Memória precisa de governança

Um agente não deve gravar qualquer frase como regra permanente. Uma
memória ruim pode propagar um erro para todas as conversas.

Toda entrada de memória deve ter:

- origem;
- data;
- agente relacionado;
- regra aprendida;
- exemplo;
- confiança;
- responsável pela aprovação;
- data de revisão, quando necessário.

### 1.4 Skills são procedimentos reutilizáveis

Uma skill é um passo a passo aprovado para uma tarefa específica.

Exemplos para a MAI:

- transformar uma ideia em Issue de validação;
- revisar um Pull Request;
- preparar uma proposta comercial;
- analisar uma campanha;
- criar roteiro de teste;
- resumir reunião em decisão;
- responder uma dúvida inicial de cliente.

Uma skill não é uma instrução vaga como “faça melhor”. Ela deve explicar
entrada, passos, saída, checklist e limites.

### 1.5 Ferramentas aumentam capacidade e risco

MCP, APIs, webhooks e integrações permitem que um agente saia da conversa e
use sistemas externos. Isso é poderoso, mas cada ferramenta precisa de:

- finalidade;
- permissões mínimas;
- dados que pode ler;
- ações que pode executar;
- ações proibidas;
- confirmação necessária;
- registro de auditoria;
- forma de desligar.

Conectar uma ferramenta não significa autorizar tudo.

### 1.6 Sessão e agente persistente são coisas diferentes

Um agente de sessão resolve uma tarefa específica e termina. Um agente
persistente acompanha eventos ao longo do tempo.

Para a MAI:

- começar com agentes de sessão e resumos;
- testar qualidade;
- guardar aprendizados aprovados;
- só depois manter agentes persistentes ligados ao Discord;
- criar limites de frequência e horários para evitar spam.

### 1.7 Modelo é o cérebro; agente é o sistema

Trocar o modelo pode mudar velocidade, custo e qualidade. Mas um modelo
forte sem contexto, memória, skill e limites ainda pode trabalhar mal.

Avaliar o sistema completo:

```text
modelo
+ contexto
+ memória
+ skills
+ ferramentas
+ permissões
+ avaliação
```

Não escolher modelo apenas por propaganda ou nome. Medir com tarefas reais
da MAI.

---

## 2. O que isso muda na MAI

### Mudanças recomendadas

1. Criar memória separada por agente.
2. Criar skills versionadas no GitHub.
3. Registrar correções importantes.
4. Fazer o agente ler a memória no começo da sessão.
5. Avaliar respostas antes de promover uma regra.
6. Usar ferramentas em etapas graduais.
7. Medir custo, tempo, qualidade e erros.
8. Separar memória aprovada de rascunhos.

### O que não devemos fazer

- deixar o agente gravar tudo automaticamente;
- dar administrador a uma integração sem necessidade;
- conectar Gmail, pagamentos ou clientes antes de testar leitura;
- considerar uma resposta boa como prova de regra geral;
- transformar uma preferência temporária em política da empresa;
- instalar MCP ou skill sem revisar origem e permissões;
- deixar agente persistente sem forma de desligar;
- enviar toda a base do GitHub para toda pergunta.

---

## 3. Estrutura proposta para cada agente

```text
agentes/
└── nome-do-agente/
    ├── AGENT.md
    ├── MEMORY.md
    ├── skills/
    │   ├── skill-1.md
    │   └── skill-2.md
    ├── examples/
    └── evaluations/
```

### `AGENT.md`

Define identidade, missão, escopo, fontes, formato de resposta e limites.

### `MEMORY.md`

Guarda apenas aprendizados aprovados e ainda válidos.

### `skills/`

Guarda procedimentos específicos, versionados e testáveis.

### `examples/`

Guarda exemplos de resposta boa e ruim, sem dados confidenciais.

### `evaluations/`

Guarda testes de qualidade, resultado e data de revisão.

---

## 4. Loop de melhoria

```text
agente trabalha
→ humano corrige ou aprova
→ correção é classificada
→ memória ou skill é proposta
→ exemplo é criado
→ avaliação é executada
→ só então a regra é promovida
```

### Classificação de uma correção

- **Resposta isolada:** corrigir somente a tarefa atual.
- **Preferência temporária:** registrar na Issue, não na memória permanente.
- **Regra do agente:** propor entrada em `MEMORY.md`.
- **Procedimento repetível:** criar ou atualizar uma skill.
- **Regra da empresa:** propor alteração na MAI Central e buscar consenso.

---

## 5. Métricas dos agentes

Para cada agente, acompanhar:

- taxa de respostas úteis;
- correções humanas;
- tarefas concluídas;
- ações recusadas corretamente;
- erros graves;
- tempo de resposta;
- custo por tarefa;
- informações inventadas;
- incidentes de privacidade;
- quantidade de memória desatualizada;
- skills usadas e resultado.

Uma IA mais autônoma não é automaticamente melhor. Ela precisa ser mais
confiável, rastreável e econômica.

---

## 6. Decisões ainda pendentes

Estas decisões não devem ser assumidas automaticamente:

- qual plataforma persistente será usada para o agente 24/7;
- se a memória será apenas Markdown ou terá banco de dados;
- qual MCP será aprovado primeiro;
- quais agentes poderão criar Issues;
- quais agentes poderão comentar em PRs;
- quando uma skill poderá ser autoextraída;
- quais dados podem sair do ambiente local;
- qual modelo será usado por tarefa;
- quem aprova memória compartilhada entre agentes.

---

## 7. Primeiro experimento recomendado

Começar com um agente de **QA e documentação**, porque é útil e tem risco
menor que e-mail, vendas ou pagamentos.

### Objetivo

Receber uma Issue ou Pull Request e produzir:

- resumo;
- riscos;
- checklist de teste;
- dúvidas;
- recomendação;
- link para a origem.

As pastas e a skill inicial já existem em `agentes/qa/`. O GrokBot ainda
é nível 0: lê e sugere, não altera nada.

### Sem permissão para

- fazer merge;
- editar código;
- apagar conteúdo;
- mudar permissões;
- alterar memória sem aprovação.

### Critério para avançar

Executar pelo menos dez revisões reais, registrar correções e avaliar:

- quantas análises foram úteis;
- quantos falsos positivos ocorreram;
- quais regras se repetiram;
- se alguma memória causou erro.

---

## 8. Conclusão

O maior ganho da MAI não será apenas escolher o modelo mais forte. Será
construir conhecimento próprio ao longo do trabalho:

```text
contexto organizado
→ memória aprovada
→ skills reutilizáveis
→ ferramentas controladas
→ avaliação
→ melhoria contínua
```

Este documento é uma proposta. A incorporação de regras na MAI Central
depende de revisão e consenso de Maicon e Ian.
