# MAI — Mapa Wireframe do MVP da Empresa

> **Documento principal de contexto, raciocínio e organização da MAI.**
>
> Este arquivo não contém código. Ele é um mapa vivo para humanos e IAs
> entenderem como a empresa pensa, decide, cria, revisa, lança e melhora
> produtos digitais.

**Versão:** 1.3
**Data de início:** 2026-09-18  
**Sócios iniciais:** Maicon e Ian  
**Empresa:** MAI  
**Status:** Estrutura inicial em formação

---

## Sumário rápido

- [1. Aviso, consenso e caminho oficial](#1-aviso-para-maicon-ian-e-todas-as-ias)
- [2. O que é a MAI](#2-o-que-é-a-mai)
- [6. Ferramentas e alinhamento](#6-ferramentas-e-como-alinhá-las)
- [7. Discord operacional](#7-estrutura-do-discord)
- [12. Branches, commits e Pull Requests](#12-trabalho-com-git-e-branches)
- [22. Estado atual da MAI](#22-estado-atual-da-mai)
- [23. Manual rápido para começar](#23-manual-rápido-para-começar)
- [Documento de integração do Grok](./docs/INTEGRACAO-GROK-DISCORD-GITHUB.md)

Se um link deste sumário ficar desatualizado depois de uma grande mudança,
corrija o sumário na mesma alteração. A MAI Central deve ser fácil de
navegar tanto para humanos quanto para IAs.

---

## 1. Aviso para Maicon, Ian e todas as IAs

Este documento é a fonte principal de entendimento da operação da MAI.

Ele pode e deve ser alimentado continuamente. Não existe uma versão
"definitiva" deste mapa. Conforme aprendermos com clientes, produtos,
campanhas, erros, decisões e resultados, atualizaremos este arquivo.

### Regra de consenso e aviso antes de alterar

Este documento é a **MAI Central**. Ele funciona como o caminho comum que
Maicon, Ian e todas as IAs devem consultar.

Na fase inicial de montagem da MAI, Maicon autorizou a execução direta de
melhorias documentais, organizacionais e de baixo risco para não travar o
começo da operação. Essas mudanças devem continuar sendo registradas e
serão revisadas conforme a empresa ganhar escala.

Consenso continua obrigatório antes de mudanças de alto impacto:
permissões externas, dinheiro, clientes, contratos, privacidade, LGPD,
segurança, remoção de regras ou ações destrutivas. Nenhuma IA recebe
autorização para executar essas ações apenas por interpretar uma conversa.

Quando uma melhoria for simples, objetiva e não mudar o significado do
plano, ela pode ser proposta para atualização normal. Quando houver dúvida,
mais de uma interpretação possível ou impacto relevante, a alteração deve
ficar pendente até que os sócios sejam avisados e concordem.

São consideradas alterações que exigem aviso e consenso:

- mudança na visão ou no objetivo da MAI;
- mudança no papel de Maicon, Ian ou de uma IA;
- mudança no fluxo de criação de produtos;
- mudança na ferramenta oficial ou na fonte oficial de informação;
- mudança que envolva dinheiro, preço, clientes ou contratos;
- mudança de segurança, privacidade ou LGPD;
- mudança que crie uma obrigação nova para a equipe;
- remoção ou substituição de uma regra existente;
- qualquer alteração em que a IA ou uma pessoa não tenha certeza.

Para uma melhoria simples e de baixo risco, o procedimento é:

1. **Identificar a mudança:** explicar o que está sendo alterado.
2. **Registrar o motivo:** mostrar qual problema ou oportunidade motivou a
   mudança.
3. **Aplicar a melhoria:** manter o escopo pequeno e não alterar regras de
   alto impacto.
4. **Avisar no registro:** atualizar o histórico e comunicar o que foi feito.

Para uma mudança ambígua ou de alto impacto, o procedimento continua sendo:

1. identificar a proposta;
2. explicar motivo, impactos e alternativas;
3. avisar Maicon e Ian;
4. buscar consenso;
5. atualizar este documento;
6. registrar o histórico.
9. **Comunicar o resultado:** avisar no Discord e, quando necessário,
   atualizar os documentos ou tarefas relacionados.

Se os sócios ainda não concordarem, a alteração deve permanecer como
**proposta pendente**, sem ser apresentada como regra oficial. Em situações
urgentes de segurança ou operação, pode ser aplicada uma contenção
temporária para proteger a empresa, mas isso deve ser comunicado
imediatamente e revisado pelos sócios depois.

### Como uma IA deve avisar antes de uma alteração ambígua

Uma IA deve usar um aviso parecido com este:

```text
PROPOSTA DE ALTERAÇÃO NA MAI CENTRAL

Seção afetada:
O que está escrito hoje:
O que estou propondo:
Por que proponho:
Impactos positivos:
Riscos ou dúvidas:
Alternativas:
Precisa de consenso dos sócios? Sim/Não
Status: aguardando Maicon e Ian
```

A IA pode sugerir e preparar o texto, mas não deve transformar uma
interpretação própria em regra oficial. Quando houver ambiguidade, a
transparência vem antes da velocidade.

### Um único caminho oficial

Todos devem apontar para este arquivo quando precisarem consultar a
estrutura geral da MAI. Cópias, resumos, mensagens do Discord e instruções
de bots podem ajudar, mas não substituem a MAI Central.

Quando outro documento discordar deste mapa, a divergência deve ser
avisada e resolvida. Não se deve criar uma "versão paralela" escondida.
Depois de uma decisão, todos os materiais relacionados devem ser alinhados.

### Registro de alterações da MAI Central

Toda mudança relevante deve ser anotada aqui:

| Data | Alteração | Motivo | Aprovadores | Status |
|---|---|---|---|---|
| 2026-09-18 | Criação da regra de consenso, aviso e caminho único | Evitar mudanças silenciosas e manter Maicon, Ian e as IAs alinhados | Maicon e Ian | Em vigor |
| 2026-09-18 | Explicação completa e leiga sobre branches, commits, Pull Requests, conflitos e proteção da `main` | Permitir que Maicon e Ian trabalhem juntos sem perder ou sobrescrever trabalho | Maicon | Em vigor |
| 2026-09-18 | Registro do Discord operacional e dos novos padrões do GitHub | Fazer a documentação refletir o que foi realmente configurado | Maicon | Em vigor |
| 2026-09-18 | Autorização inicial para melhorias documentais de baixo risco sem consenso prévio | Evitar travar a montagem da MAI no início, mantendo consenso para mudanças de alto impacto | Maicon | Em vigor |
| 2026-09-18 | Inclusão do padrão de contexto, memória, skills e avaliação de agentes | Transformar aprendizados da transcrição em processo operacional inicial | Maicon | Em vigor |
| 2026-09-18 | Criação do norte da integração Grok + GitHub + Discord | Definir contexto, eventos, agentes, autonomia, segurança e fases antes de conectar a IA ao ambiente | Maicon | Em vigor |

Para alterações futuras, usar este modelo:

```text
Data:
Alteração:
Seção afetada:
Motivo:
Impactos:
Aprovadores:
Status:
```

### Para Ian

Ian, este documento foi criado para você entrar no projeto já entendendo:

- qual é a visão da MAI;
- quem faz o quê;
- como uma ideia vira produto;
- como os sócios e as IAs trabalham juntos;
- onde ficam as informações;
- quais regras evitam perda de trabalho;
- como participar sem precisar descobrir tudo sozinho.

Quando alguma parte não estiver clara, ela deve ser melhorada aqui. Se uma
regra mudar, registre a mudança neste documento para que a MAI não dependa
apenas de conversas antigas no Discord.

### Para as IAs e bots

Leiam este documento antes de sugerir qualquer ação relacionada à MAI.
Usem-no como contexto, mas não tratem todas as decisões como imutáveis.
Quando identificarem uma melhoria, conflito, risco ou informação ausente:

1. expliquem o motivo de forma simples;
2. indiquem a seção que precisa ser atualizada;
3. proponham a alteração;
4. aguardem aprovação humana quando a decisão afetar dinheiro, clientes,
   segurança, privacidade, posicionamento ou direção da empresa.

As IAs ajudam a pensar e executar melhor. A aprovação final continua sendo
dos sócios, salvo quando uma regra futura da MAI definir outra coisa.

---

## 2. O que é a MAI

A MAI é uma empresa focada em criar produtos digitais pequenos, rápidos e
rentáveis para empresas locais e, quando fizer sentido, transformar os
melhores produtos em negócios maiores e escaláveis.

### Ideia central

```text
Encontrar um problema real
→ validar se alguém pagaria para resolvê-lo
→ criar o menor produto útil possível
→ lançar rapidamente
→ medir o resultado
→ melhorar, escalar ou encerrar
```

### O que a MAI faz

- Pesquisa problemas e oportunidades.
- Escolhe problemas que podem virar negócio.
- Planeja soluções simples.
- Cria produtos digitais.
- Faz projetos sob medida quando forem estratégicos.
- Vende, entrega e acompanha os produtos.
- Aprende com clientes e transforma aprendizados em novos produtos.

### O que a MAI não quer fazer

- Programar por meses sem falar com clientes.
- Criar funcionalidades apenas porque parecem interessantes.
- Manter um produto sem medir se ele gera valor.
- Depender de uma pessoa lembrar de tudo.
- Guardar decisões importantes somente em conversas.
- Colocar informações confidenciais em ferramentas de IA sem cuidado.
- Confundir um serviço feito para um cliente com um produto próprio escalável.

---

## 3. Objetivo do MVP da empresa

O MVP da empresa não é apenas um aplicativo. É o **primeiro sistema de
trabalho da MAI**.

Ele precisa permitir que Maicon, Ian e as IAs:

1. encontrem e organizem oportunidades;
2. escolham uma oportunidade com critérios claros;
3. definam um MVP pequeno;
4. dividam o trabalho;
5. construam com segurança;
6. revisem antes de publicar;
7. entreguem ao cliente;
8. acompanhem resultados;
9. aprendam e registrem tudo.

O objetivo é criar um ciclo repetível, não depender de improviso a cada
novo projeto.

---

## 4. Princípios simples da MAI

### 4.1 Velocidade com direção

Ser rápido não significa fazer de qualquer jeito. Significa reduzir
desperdício, decidir o que importa e entregar uma primeira versão útil.

### 4.2 Validar antes de construir

Uma ideia não é automaticamente uma oportunidade. Antes de investir muito
tempo, precisamos descobrir se existe um problema real e um cliente real.

### 4.3 Simplicidade primeiro

Começamos com o menor conjunto de funcionalidades capaz de resolver o
problema principal. O que não for essencial fica para depois.

### 4.4 GitHub é a fonte oficial do projeto

Código, documentação, decisões técnicas, histórico e tarefas importantes
devem ser registrados no GitHub.

### 4.5 Discord é o escritório da empresa

O Discord é usado para conversar, alinhar, receber alertas e coordenar a
equipe. Decisões importantes devem ser copiadas para a documentação ou
para a tarefa correspondente.

### 4.6 Toda mudança importante precisa ser revisada

Revisão pode ser feita por Maicon, Ian ou por uma IA especializada, mas
mudanças críticas precisam de aprovação humana antes de chegar ao cliente
ou à produção.

### 4.7 A IA sugere; os sócios decidem

As IAs podem ser melhores que nós em funções específicas, especialmente
quando foram treinadas com contexto e instruções próprias. Isso deve ser
aproveitado. Ainda assim, decisões de negócio, dinheiro, contrato,
privacidade, segurança e publicação precisam de responsabilidade humana.

### 4.8 Aprendizado documentado vale mais que memória

Todo erro, descoberta, decisão relevante e resultado deve virar
conhecimento reutilizável.

---

## 5. Mapa geral da empresa

```text
                         DIREÇÃO
                            │
               decisões, prioridades e visão
                            │
     ┌──────────────────────┼──────────────────────┐
     │                      │                      │
  PRODUTO              DESENVOLVIMENTO          OPERAÇÃO
     │                      │                      │
 problema, cliente      produto funcionando     QA, segurança,
 e MVP                  e documentado           clientes e suporte
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                         MARKETING
                            │
                  vendas, tráfego e copy
                            │
                         FINANCEIRO
                            │
                    preço, margem e caixa
```

Nenhuma área trabalha isolada. Produto define o que deve ser resolvido,
desenvolvimento constrói, QA e segurança verificam, marketing atrai,
financeiro acompanha a sustentabilidade e direção decide prioridades.

---

## 6. Ferramentas e como alinhá-las

As ferramentas já escolhidas são suficientes. O ganho não vem de adicionar
mais ferramentas, mas de usar cada uma no lugar certo.

### 6.1 Discord — escritório e comunicação

Usar para:

- conversas rápidas;
- reuniões;
- avisos;
- acompanhamento diário;
- agentes de IA;
- alertas de GitHub;
- decisões que ainda estão sendo discutidas.

Não usar como único lugar para:

- guardar requisitos finais;
- guardar senhas;
- registrar contratos;
- armazenar a versão oficial de uma decisão;
- controlar todo o histórico de um produto.

**Regra:** uma conversa que virar decisão deve ser resumida e registrada no
GitHub, em uma tarefa, documento ou decisão do projeto.

### 6.2 GitHub — pasta oficial e memória da empresa

Usar para:

- código;
- documentação;
- tarefas e problemas;
- decisões;
- histórico de alterações;
- revisão por Pull Request;
- automações;
- testes e verificações;
- versão oficial dos projetos.

Estrutura sugerida:

```text
MAI/
├── README.md
├── MAPA-WIREFRAME-MVP-MAI.md
├── docs/
│   ├── produtos/
│   ├── decisoes/
│   ├── operacao/
│   ├── clientes/
│   ├── marketing/
│   └── seguranca/
├── backend/
├── frontend/
├── designs/
├── prompts/
├── automacoes/
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

No começo, algumas pastas podem ficar vazias. A estrutura existe para
manter o raciocínio organizado conforme a empresa crescer.

#### Como o GitHub deve funcionar na prática

O GitHub é mais do que um lugar para subir código. Ele é o sistema de
controle da MAI:

| Necessidade | Onde registrar |
|---|---|
| Ideia ainda não validada | Issue com `status: hipótese` |
| Tarefa de produto | Issue com responsável e critério de conclusão |
| Alteração de código ou documento | Branch + Pull Request |
| Decisão importante | `docs/decisoes/` e link no Discord |
| Regra geral da empresa | MAI Central |
| Bug | Issue com passos para reproduzir |
| Resultado de campanha ou produto | `docs/` e canal de métricas |
| Código oficial | Branch `main` após revisão |

Toda tarefa que puder virar trabalho deve ter uma Issue. Toda alteração
relevante deve ter um Pull Request. Assim, qualquer pessoa ou IA consegue
entender o que aconteceu sem depender de uma conversa antiga.

#### O que foi configurado neste repositório

- Repositório privado: `mvicxn/MAILAB-WORKSPACE`.
- Branch oficial: `main`.
- MAI Central versionada e publicada.
- Ian convidado como colaborador.
- Organizador do Discord versionado em `discord-organizer/`.
- Token do Discord protegido fora do repositório.
- Histórico de commits preservado.

O GitHub não deve receber:

- tokens;
- senhas;
- arquivos `.env`;
- dados pessoais desnecessários;
- contratos confidenciais;
- backups de banco com dados reais.

### 6.3 Cursor — ambiente principal de construção

Usar para:

- entender o projeto;
- criar e alterar arquivos;
- refatorar;
- investigar problemas;
- implementar funcionalidades;
- conversar com o contexto inteiro do projeto.

O Cursor ajuda a produzir. Ele não substitui revisão, teste ou decisão.

### 6.4 GitHub Copilot no VS Code — aceleração durante a escrita

Usar para:

- completar código;
- sugerir funções;
- gerar trechos repetitivos;
- explicar partes menores;
- acelerar tarefas já bem definidas.

Cursor e Copilot podem ser usados juntos. Para evitar confusão, sempre
manter a mesma branch e conferir as alterações antes de salvar.

### 6.5 Grok e os bots especializados — equipe de especialistas

Usar para:

- pesquisa;
- planejamento;
- revisão;
- design;
- marketing;
- copy;
- finanças;
- jurídico;
- QA;
- segurança;
- organização do conhecimento.

Os bots podem ser mais habilidosos que os sócios em determinadas funções.
Isso é uma vantagem da MAI, não um problema. A forma de melhorar ainda
mais é treiná-los continuamente com:

- exemplos reais da MAI;
- padrões de qualidade;
- erros anteriores;
- respostas aprovadas;
- contexto dos clientes;
- objetivos mensuráveis;
- instruções específicas por função;
- avaliações periódicas das respostas.

**Atenção:** não enviar senhas, tokens, dados pessoais desnecessários,
informações bancárias ou documentos confidenciais sem autorização e sem
proteção adequada.

### 6.7 Alinhamento entre ferramentas

O fluxo correto é:

```text
Discord: discutir
→ GitHub: registrar
→ Cursor/Copilot: construir
→ GitHub: revisar e versionar
→ Bots do Grok: analisar
→ Discord: comunicar resultado
→ GitHub: preservar a decisão final
```

### 6.6 Contexto, memória e skills dos agentes

Os agentes da MAI devem evoluir em camadas separadas:

- **Contexto:** documentos e dados necessários para a tarefa atual.
- **Memória:** aprendizados estáveis, correções e preferências aprovadas.
- **Skill:** procedimento repetível, com entrada, passos, saída e checklist.
- **Ferramenta:** integração externa com permissão mínima e auditoria.

O agente deve observar, planejar, agir, conferir o resultado e ajustar
quando necessário. Correções não viram regra permanente automaticamente.
Elas devem ser classificadas como resposta isolada, preferência temporária,
memória do agente, skill ou regra da empresa.

Os padrões e templates ficam em
`docs/APRENDIZADOS-AGENTES-IA.md` e `docs/templates/`.

---

## 7. Estrutura do Discord

Cada canal representa um setor. O nome do canal pode ser adaptado à
plataforma, mas a função deve permanecer clara.

### Estado real configurado

O servidor **MAI LAB CORP** foi organizado pelo `MAI-Organizador` com:

- 20 categorias;
- 51 canais organizados;
- 13 cargos personalizados;
- emojis em cargos, categorias e canais;
- descrições nos canais;
- mensagens-guia iniciais;
- categoria privada da direção;
- áreas de entrada, operação, automação e arquivo;
- preservação de categorias legadas que já continham conteúdo.

O organizador é idempotente: pode ser executado novamente para atualizar a
estrutura sem duplicar os guias. Ele está documentado em
`discord-organizer/README.md`.

### Regras do Discord

- Discord é para comunicação e coordenação; GitHub é a fonte oficial.
- Use threads para discussões específicas.
- Fixe mensagens que expliquem um processo importante.
- Não use canais gerais para guardar requisitos finais.
- Não publique tokens, senhas ou dados sensíveis.
- Decisões relevantes devem apontar para um Issue, PR ou documento.
- Mudanças na estrutura do servidor devem ser registradas no GitHub.
- Categorias legadas só devem ser removidas depois de conferir seu conteúdo.

### Direção

- `#ceo`: visão, decisões finais e prioridades.
- `#planejamento`: roadmap, prazos, metas e organização.

### Produto

- `#produto`: ideias, problemas, clientes e propostas.
- `#pesquisa-de-mercado`: entrevistas, concorrentes e validação.

### Desenvolvimento

- `#backend`: regras, dados, APIs e integrações.
- `#frontend`: telas, experiência e comportamento visual.
- `#bugs`: problemas encontrados e acompanhamento de correções.

### Design

- `#design`: identidade, interface e experiência.
- `#criativos`: anúncios, imagens, vídeos e materiais de campanha.

### Marketing

- `#trafego`: canais, campanhas, anúncios e métricas.
- `#copy`: textos de venda, mensagens, e-mails e páginas.

### Financeiro

- `#financeiro`: preços, custos, margem, receitas e caixa.

### Operações

- `#qa`: testes e qualidade.
- `#seguranca`: riscos, acessos, privacidade e boas práticas.
- `#clientes`: entrega, suporte, solicitações e satisfação.

---

## 8. Papéis de pessoas e IAs

### Maicon

- Programa e trabalha na arquitetura.
- Usa Cursor, VS Code e Copilot.
- Conversa com os agentes.
- Toma decisões junto com Ian.
- Ajuda a definir prioridade e direção.
- Garante que o trabalho avance.

### Ian

- Programa e participa da arquitetura.
- Desenvolve na mesma base oficial.
- Revisa e testa alterações.
- Ajuda a transformar ideias em entregas.
- Registra decisões, aprendizados e problemas.
- Pode assumir a liderança de áreas específicas conforme a empresa evoluir.

### Sócios em conjunto

Os sócios são responsáveis por:

- visão;
- prioridades;
- aprovação de produtos;
- gastos relevantes;
- contratos;
- segurança e privacidade;
- publicação;
- relacionamento com clientes;
- decisão de continuar, mudar ou encerrar um produto.

No início, uma mesma pessoa pode acumular várias funções. Isso é normal,
mas as responsabilidades devem ficar explícitas em cada projeto.

### IAs e bots

As IAs são uma equipe de apoio especializada. Elas podem:

- pesquisar;
- comparar alternativas;
- resumir informações;
- gerar rascunhos;
- criar planos;
- revisar código;
- procurar bugs;
- apontar riscos;
- propor telas e fluxos;
- escrever copy;
- analisar métricas;
- organizar documentação;
- sugerir melhorias;
- lembrar regras e decisões.

As IAs não devem:

- publicar algo crítico sem aprovação;
- decidir sozinhas sobre dinheiro ou contratos;
- inventar validação de cliente;
- ocultar incerteza;
- tratar uma sugestão como fato;
- receber segredos sem necessidade;
- substituir o contato com clientes.

---

## 9. Bots especializados do Grok

Cada bot deve ter uma função clara, contexto próprio e critérios de
qualidade. Bots podem ser treinados progressivamente em assuntos
específicos.

### CEO

Coordena prioridades, identifica conflitos, cobra decisões e mantém a
visão geral.

### Produto

Investiga problemas, define público, organiza funcionalidades e verifica
se uma solução atende o cliente.

### Pesquisa de mercado

Pesquisa concorrentes, alternativas existentes, demanda, linguagem dos
clientes e oportunidades locais. Deve separar fatos de hipóteses.

### Design

Propõe identidade, layout, experiência, hierarquia visual e materiais.

### Dev

Ajuda em arquitetura, implementação, organização, manutenção e escolhas
técnicas.

### Tráfego

Planeja canais, campanhas, públicos, orçamento, testes e métricas.

### Copy

Escreve mensagens claras para landing pages, anúncios, propostas,
onboarding, e-mails e suporte.

### Financeiro

Calcula preço, custos, margem, ponto de equilíbrio, fluxo de caixa e
viabilidade.

### Jurídico

Ajuda com contratos, escopo, propriedade intelectual, termos, privacidade
e LGPD. A análise do bot não substitui advogado quando houver risco real.

### QA

Testa fluxos, entradas, erros, telas, permissões e cenários inesperados.

### Segurança

Procura chaves expostas, permissões excessivas, falhas de autenticação,
riscos de dados, dependências vulneráveis e problemas de configuração.

### Operações e clientes

Organiza entrega, suporte, onboarding, solicitações, incidentes e
aprendizados pós-lançamento.

### Como treinar os bots continuamente

Para cada bot, manter:

- missão;
- escopo;
- o que ele não deve fazer;
- informações que precisa receber;
- exemplos de resposta boa;
- exemplos de resposta ruim;
- checklist de revisão;
- histórico de erros;
- nível de confiança;
- última atualização.

Após cada uso importante, perguntar:

1. A resposta foi correta?
2. Foi útil para a decisão?
3. Faltou contexto?
4. O bot confundiu fato com hipótese?
5. O prompt ou a base de conhecimento precisa ser atualizado?

---

## 10. Processo completo: da ideia ao produto

### Etapa 0 — Entrada da oportunidade

Uma oportunidade pode vir de:

- conversa com empresa local;
- problema observado;
- pedido de cliente;
- pesquisa;
- ideia dos sócios;
- melhoria de produto existente;
- necessidade interna da MAI.

Registrar a oportunidade sem assumir que ela será construída.

### Etapa 1 — Validação do problema

Antes de programar, responder:

- Qual problema estamos resolvendo?
- Quem sofre com ele?
- Com que frequência ele acontece?
- Como a pessoa resolve hoje?
- Quanto custa não resolver?
- Quem decide a compra?
- Existem alternativas?
- Alguém aceitaria pagar?

Quando possível, conversar com pessoas reais. Opinião interna não
substitui validação externa.

### Etapa 2 — Decisão de seguir ou não seguir

A direção classifica a oportunidade como:

- **Explorar:** ainda faltam informações.
- **Validada:** existe problema e interesse suficiente.
- **Construir MVP:** vale fazer um teste pequeno.
- **Pausada:** pode voltar depois.
- **Descartada:** não vale investir agora.

Registrar o motivo, inclusive quando a decisão for não construir.

### Etapa 3 — Documento do produto

Criar um documento próprio em `docs/produtos/` contendo:

- nome provisório;
- problema;
- público;
- proposta de valor;
- solução imaginada;
- funcionalidades do MVP;
- funcionalidades fora do MVP;
- modelo de cobrança;
- concorrentes e alternativas;
- riscos;
- métricas;
- responsável;
- prazo;
- critério de sucesso;
- critério de abandono.

### Etapa 4 — Wireframe sem código

Descrever o produto como se estivéssemos desenhando em papel:

- quem usa;
- o que vê primeiro;
- qual ação realiza;
- o que acontece depois;
- quais estados podem existir;
- o que acontece quando dá erro;
- como termina o fluxo;
- como o usuário sabe que deu certo.

Exemplo de wireframe textual:

```text
Usuário entra
→ vê a proposta principal
→ cria ou acessa sua conta
→ informa os dados mínimos
→ recebe o resultado principal
→ pode corrigir, salvar ou compartilhar
→ recebe confirmação
```

O wireframe deve explicar o comportamento, não a tecnologia.

### Etapa 5 — Design

Definir:

- nome;
- identidade;
- cores;
- tipografia;
- estilo;
- telas;
- componentes;
- landing page;
- criativos;
- textos principais.

O design deve ajudar o usuário a concluir a tarefa, não apenas parecer
bonito.

### Etapa 6 — Desenvolvimento

Separar o trabalho em tarefas pequenas. Cada tarefa deve explicar:

- o que precisa ser feito;
- por que é necessário;
- como conferir se ficou pronto;
- dependências;
- riscos;
- responsável.

### Etapa 7 — QA e segurança

Antes de entregar:

- testar o caminho normal;
- testar entradas erradas;
- testar acesso sem permissão;
- testar telas menores;
- testar recarregamento e perda de conexão;
- conferir mensagens de erro;
- conferir dados salvos;
- conferir integração de pagamentos, se houver;
- revisar logs;
- verificar segredos e permissões;
- conferir backup e recuperação.

### Etapa 8 — Marketing e venda

Definir:

- cliente ideal;
- promessa principal;
- canal;
- oferta;
- preço;
- orçamento;
- mensagem;
- chamada para ação;
- métrica de sucesso.

Não escalar tráfego antes de entender se a oferta gera interesse real.

### Etapa 9 — Entrega

Checklist:

- produto funcionando;
- cliente ou usuário aprovado;
- escopo conferido;
- pagamento combinado;
- acessos entregues com segurança;
- instruções fornecidas;
- suporte definido;
- responsabilidades registradas;
- backup realizado.

### Etapa 10 — Pós-lançamento

Após lançar:

- acompanhar erros;
- ouvir clientes;
- observar uso;
- registrar pedidos;
- medir vendas e retenção;
- corrigir problemas críticos;
- revisar após 7 dias;
- revisar após 30 dias;
- decidir se deve melhorar, escalar, manter ou encerrar.

---

## 11. Produto próprio versus projeto para cliente

### Produto próprio da MAI

- A MAI escolhe o problema e o roadmap.
- A MAI assume o risco.
- O objetivo é receita recorrente e escala.
- O produto pode atender muitos clientes.
- O aprendizado fica como ativo da MAI.

### Projeto sob medida para cliente

- O cliente participa da definição.
- Existe escopo contratado.
- Há prazo, preço e critérios de aceite.
- Mudanças fora do escopo precisam ser aprovadas.
- Devem ser definidos suporte, manutenção e propriedade do trabalho.
- O projeto pode gerar aprendizado, mas não deve virar produto sem decisão.

Antes de começar, identificar em qual categoria o trabalho está.

---

## 12. Trabalho com Git e branches

### 12.1 O que é uma branch, explicado para leigos

Uma **branch** é uma cópia de trabalho do projeto. Ela permite que uma
pessoa faça alterações sem mexer diretamente na versão oficial.

Imagine um documento importante:

- `main` é o documento oficial que todos podem consultar.
- Uma branch é uma cópia desse documento para você trabalhar.
- Quando o trabalho fica pronto, ele é revisado.
- Só depois a alteração é colocada no documento oficial.

Assim, Maicon e Ian podem trabalhar ao mesmo tempo sem sobrescrever o
trabalho um do outro.

Uma branch não é um projeto separado nem uma segunda empresa. Ela é apenas
uma área de trabalho temporária ligada ao mesmo projeto.

### 12.2 As três versões que precisamos entender

No dia a dia, existem três lugares importantes:

1. **Computador local:** onde a pessoa está trabalhando.
2. **GitHub:** onde as branches e o histórico ficam salvos online.
3. **`main`:** a versão oficial e mais confiável do projeto.

O trabalho normalmente passa por este caminho:

```text
computador
→ branch no GitHub
→ Pull Request para revisão
→ main depois da aprovação
```

### 12.3 A branch `main`

`main` é a versão oficial da MAI ou do produto.

Ela deve ficar:

- organizada;
- funcionando;
- revisada;
- pronta para servir de base para o próximo trabalho.

Não devemos testar ideias grandes diretamente na `main`. Também não devemos
editar a `main` diretamente quando a mudança for relevante.

### 12.4 Uma branch para cada trabalho

Cada alteração deve ter sua própria branch. O nome deve explicar o tipo de
trabalho:

```text
main
feature/login
feature/dashboard
fix/payment-error
chore/update-dependencies
docs/product-map
```

Significado dos prefixos:

- `feature/`: funcionalidade nova.
- `fix/`: correção de erro.
- `chore/`: manutenção técnica.
- `docs/`: documentação.
- `design/`: alteração visual ou de experiência.
- `security/`: melhoria ou correção de segurança.
- `qa/`: testes e qualidade.

Exemplos:

```text
feature/cadastro-cliente
feature/tela-relatorio
fix/erro-no-login
docs/atualizar-mai-central
design/landing-page
security/restringir-acesso
```

Evitar nomes vagos como:

```text
teste
coisa-nova
minha-branch
alteracoes
```

### 12.5 Como Maicon ou Ian começam uma tarefa

Passo a passo sem complicação:

1. Conferir no Discord ou no GitHub qual tarefa será feita.
2. Verificar se ninguém já está trabalhando exatamente na mesma parte.
3. Atualizar a cópia local a partir da `main`.
4. Criar uma branch com nome claro.
5. Trabalhar somente nessa branch.
6. Salvar pequenos grupos de alterações em commits.
7. Testar antes de enviar.
8. Enviar a branch para o GitHub.
9. Abrir um Pull Request.
10. Pedir revisão.

Comandos equivalentes para quem estiver usando o terminal:

```bash
git switch main
git pull origin main
git switch -c feature/nome-da-tarefa
```

Não é necessário decorar os comandos. O importante é entender a sequência:
voltar à base atual, criar uma área própria e trabalhar nela.

### 12.6 O que é um commit

Um **commit** é um ponto salvo no histórico. Ele registra um pequeno grupo
de alterações com uma mensagem explicando o que foi feito.

Exemplo:

```text
docs: explicar fluxo de branches para a equipe
```

Um commit não significa que a alteração já entrou na `main`. Ele apenas
salva o trabalho na branch atual.

É melhor fazer commits pequenos e claros do que um único commit enorme com
várias coisas misturadas.

### 12.7 O que é um Pull Request

Um **Pull Request**, ou PR, é um pedido para colocar o trabalho da branch
na `main`.

Pense nele como:

> "Terminei esta parte. Podem conferir antes de colocar na versão oficial?"

Um PR deve explicar:

- qual problema foi resolvido;
- o que foi alterado;
- como testar;
- quais arquivos ou áreas foram afetados;
- se existe algum risco;
- se há screenshot quando a mudança for visual.

O PR é o lugar onde Maicon, Ian e as IAs podem conversar sobre a alteração
antes de ela virar parte oficial do projeto.

### 12.8 Como uma alteração entra na `main`

```text
1. Escolher uma tarefa
2. Criar uma branch
3. Trabalhar na branch
4. Fazer commits
5. Testar
6. Enviar a branch para o GitHub
7. Abrir Pull Request
8. Revisar
9. Corrigir observações
10. Aprovar
11. Juntar (merge) na main
12. Excluir a branch encerrada
```

**Merge** significa juntar o conteúdo aprovado da branch com a `main`.

A branch pode ser excluída depois do merge porque o trabalho já foi
preservado no histórico. Excluir a branch não apaga o que entrou na `main`.

### 12.9 Regra prática para Maicon e Ian

```text
Uma tarefa = uma branch
Uma mudança lógica = um ou poucos commits
Uma branch pronta = um Pull Request
Uma alteração aprovada = merge na main
```

Se uma tarefa ficar grande demais, dividir em tarefas menores. Branches
curtas são mais fáceis de revisar e causam menos conflitos.

### 12.10 Exemplo de trabalho simultâneo

Suponha que o projeto precise de login e dashboard:

```text
main
├── feature/login       ← Maicon
└── feature/dashboard   ← Ian
```

Maicon trabalha no login sem apagar o dashboard de Ian. Ian trabalha no
dashboard sem apagar o login de Maicon. Cada um envia sua branch e abre
seu próprio PR.

Depois das revisões:

```text
feature/login     → revisão → main
feature/dashboard → revisão → main
```

Se os dois alterarem exatamente o mesmo trecho, o Git avisará sobre um
conflito. O conflito não significa que o trabalho foi perdido: significa
que o Git precisa que alguém escolha como juntar as duas versões.

### 12.11 O que fazer quando aparecer conflito

Quando houver conflito:

1. Não apagar arquivos para tentar resolver rapidamente.
2. Avisar a outra pessoa que mexeu naquela área.
3. Abrir o trecho conflitante e entender as duas alterações.
4. Escolher a versão correta ou combinar as duas.
5. Testar o resultado completo.
6. Registrar a decisão no PR quando ela não for óbvia.
7. Pedir revisão antes do merge.

Se Maicon e Ian não souberem qual versão escolher, parar e pedir ajuda a
uma IA de Dev ou registrar a dúvida no Discord. Não escolher no escuro.

### 12.12 O que não fazer

- Não trabalhar diretamente na `main` em mudanças importantes.
- Não usar a branch de outra pessoa sem combinar.
- Não misturar login, design, correção e documentação na mesma branch sem
  necessidade.
- Não deixar uma branch parada por meses sem atualizar.
- Não fazer `force push` sem entender o impacto.
- Não apagar trabalho de outra pessoa para resolver conflito.
- Não fazer merge sem testar.
- Não considerar um commit local como backup suficiente.

### 12.13 Atualizar a branch antes de terminar

Enquanto a pessoa trabalha, outra alteração pode entrar na `main`. Antes
de abrir ou finalizar o PR, é bom atualizar a branch para descobrir
conflitos cedo.

Para quem já conhece o terminal:

```bash
git switch main
git pull origin main
git switch nome-da-sua-branch
git merge main
```

Se o resultado parecer confuso, não continuar sozinho: guardar o trabalho,
avisar a equipe e pedir revisão.

### 12.14 Regra de proteção da `main`

Quando o projeto estiver sendo usado continuamente, a `main` deve exigir:

- Pull Request para mudanças relevantes;
- pelo menos uma revisão;
- testes ou explicação de por que não se aplicam;
- revisão de segurança em áreas sensíveis;
- aprovação dos sócios para mudanças de direção.

O objetivo não é criar burocracia. É evitar que uma alteração apressada
quebre o produto ou apague uma decisão importante.

### 12.15 Fluxo intuitivo resumido

```text
MAIN = versão oficial

Eu tenho uma ideia ou tarefa
        ↓
Crio uma branch, que é minha cópia de trabalho
        ↓
Faço alterações e commits
        ↓
Envio a branch para o GitHub
        ↓
Abro um Pull Request
        ↓
Outra pessoa ou IA revisa
        ↓
Corrijo o que for necessário
        ↓
Aprovamos e fazemos merge
        ↓
MAIN recebe a mudança com histórico e segurança
```

### 12.16 Fluxo intuitivo completo

1. Atualizar a branch a partir de `main`.
2. Criar uma branch para uma tarefa pequena.
3. Fazer a alteração.
4. Conferir o que mudou.
5. Testar.
6. Fazer commit com mensagem clara.
7. Enviar para o GitHub.
8. Abrir Pull Request.
9. Pedir revisão de Ian, Maicon ou IA.
10. Corrigir observações.
11. Aprovar e juntar na `main`.
12. Excluir a branch quando não for mais necessária.

Nunca trabalhar diretamente na `main` em mudanças relevantes.

---

## 13. Qualidade, revisão e publicação

Uma Pull Request importante deve informar:

- qual problema resolve;
- o que mudou;
- como testar;
- quais riscos existem;
- quais partes não foram alteradas;
- screenshot ou vídeo quando for visual;
- testes realizados;
- revisão de segurança quando envolver dados, acesso ou pagamento.

Antes de publicar, verificar:

- requisitos atendidos;
- fluxo principal funcionando;
- erros tratados de forma clara;
- dados protegidos;
- documentação atualizada;
- variáveis de ambiente configuradas;
- backup disponível;
- plano para desfazer a publicação se necessário.

Sempre que possível, usar:

```text
desenvolvimento
→ revisão
→ ambiente de teste
→ aprovação
→ produção
```

---

## 14. Segurança e privacidade desde o início

Regras mínimas:

- Nunca colocar senhas, tokens ou chaves no GitHub.
- Usar variáveis de ambiente e gerenciador de senhas.
- Ativar autenticação de dois fatores.
- Dar somente o acesso necessário.
- Revisar e remover acessos antigos.
- Fazer backup dos dados importantes.
- Coletar somente dados necessários.
- Explicar como os dados serão usados.
- Definir retenção e exclusão.
- Ter termos e política de privacidade quando aplicável.
- Registrar e tratar incidentes.
- Não enviar dados sensíveis aos bots sem necessidade.

O bot de Segurança deve revisar qualquer alteração que envolva:

- autenticação;
- autorização;
- pagamentos;
- dados pessoais;
- arquivos enviados;
- integrações externas;
- administração;
- banco de dados;
- publicação em produção.

O bot Jurídico ajuda a encontrar pontos de atenção, mas questões jurídicas
relevantes devem ser confirmadas com profissional habilitado.

---

## 15. Métricas e decisões objetivas

Todo produto deve ter números, mesmo que sejam estimativas iniciais.

### Validação

- pessoas entrevistadas;
- respostas positivas;
- demonstrações realizadas;
- pré-vendas ou compromissos;
- disposição de pagar;
- tempo para validar;
- custo da validação.

### Produto

- tempo para lançar;
- usuários ativos;
- conclusão do fluxo principal;
- erros;
- tempo para completar a tarefa;
- solicitações de suporte.

### Negócio

- leads;
- conversão;
- vendas;
- receita;
- custo de aquisição;
- margem;
- cancelamentos;
- retenção;
- tempo para recuperar o investimento.

### Decisões possíveis

```text
Continuar: sinais de valor e possibilidade de negócio.
Melhorar: existe valor, mas há obstáculos claros.
Mudar: o problema ou público precisa ser reposicionado.
Pausar: não é prioridade agora.
Encerrar: os dados não justificam mais investimento.
Escalar: o processo funciona e pode receber mais recursos.
```

---

## 16. Reuniões e rotina simples

### Alinhamento rápido

Cada pessoa pode responder:

- O que foi concluído?
- O que será feito agora?
- O que está bloqueado?
- Que decisão precisa dos sócios?

### Revisão semanal

- O que aprendemos?
- O que avançou?
- O que atrasou?
- O que deve ser removido?
- Qual é a prioridade da próxima semana?
- Alguma decisão precisa ser registrada neste documento?

### Revisão após lançamento

- Clientes entenderam?
- Usaram?
- Pagaram?
- Onde travaram?
- Qual foi o maior problema?
- Qual melhoria tem maior impacto?
- Continuamos, mudamos ou encerramos?

---

## 17. Padrão para novas decisões

Para evitar decisões soltas, registrar:

```text
Data:
Decisão:
Problema que motivou:
Opções consideradas:
Escolha:
Motivo:
Responsável:
Impacto esperado:
Riscos:
Quando revisar:
```

Uma decisão pode mudar. Se mudar, registrar a nova decisão e o motivo, sem
apagar o histórico anterior.

---

## 18. Como alimentar este documento

Qualquer sócio ou IA pode sugerir uma atualização. A alteração deve:

1. melhorar clareza ou utilidade;
2. evitar contradição com outra regra;
3. explicar uma mudança de processo;
4. preservar o histórico quando for relevante;
5. ser revisada pelos sócios quando afetar a empresa.

Antes de editar uma regra ambígua ou importante, seguir a seção
[Regra de consenso e aviso antes de alterar](#regra-de-consenso-e-aviso-antes-de-alterar).

### O que deve entrar aqui

- princípios;
- papéis;
- fluxos;
- regras de decisão;
- padrões de trabalho;
- aprendizados gerais;
- critérios de qualidade;
- alinhamento entre ferramentas;
- mudanças na estrutura da MAI.

### O que deve ficar em documentos próprios

- requisitos detalhados de um produto;
- contrato de cliente;
- senha ou segredo;
- investigação de segurança confidencial;
- backlog completo;
- documentação técnica específica;
- dados pessoais.

Este arquivo aponta o norte. Os documentos próprios guardam os detalhes.

---

## 19. Checklist de início de cada produto

- [ ] O problema está escrito em uma frase simples.
- [ ] Sabemos quem tem o problema.
- [ ] Falamos com pessoas ou temos uma forma concreta de validar.
- [ ] Sabemos como a pessoa resolve hoje.
- [ ] Definimos o menor MVP útil.
- [ ] Escrevemos o que está fora do MVP.
- [ ] Definimos responsável humano.
- [ ] Definimos métricas.
- [ ] Definimos preço ou hipótese de preço.
- [ ] Criamos o wireframe textual.
- [ ] Registramos riscos.
- [ ] Criamos tarefas no GitHub.
- [ ] Definimos revisão de QA e segurança.
- [ ] Definimos plano de lançamento.

## 20. Checklist de encerramento ou aprendizado

- [ ] Registramos o que foi entregue.
- [ ] Registramos o que não foi feito.
- [ ] Medimos os resultados.
- [ ] Conversamos com usuários ou clientes.
- [ ] Registramos bugs e pedidos.
- [ ] Registramos custos e receita.
- [ ] Atualizamos os prompts ou contexto dos bots, se necessário.
- [ ] Atualizamos este mapa com aprendizados gerais.
- [ ] Decidimos continuar, melhorar, pausar ou encerrar.

---

## 21. Norte final

A MAI deve ser uma empresa pequena, rápida, organizada e capaz de aprender.

Nós, Maicon e Ian, continuamos responsáveis por direção, decisões e
responsabilidade final. As IAs e os bots aumentam nossa capacidade em
pesquisa, produto, design, desenvolvimento, revisão, marketing,
finanças, jurídico, QA, segurança e operação.

O objetivo não é criar uma empresa complicada. É criar uma empresa que:

- encontra problemas reais;
- valida antes de gastar muito;
- constrói soluções pequenas;
- usa cada ferramenta no lugar certo;
- aproveita IAs especializadas;
- documenta o que aprende;
- protege clientes e dados;
- entrega valor;
- mede o resultado;
- cresce somente quando houver evidência.

```text
Problema real
→ validação
→ wireframe
→ MVP
→ revisão
→ lançamento
→ medição
→ aprendizado
→ próxima decisão
```

Este documento é o ponto de partida. A MAI vai melhorá-lo enquanto trabalha.

---

## 22. Estado atual da MAI

Esta seção diferencia o que está **feito**, o que está **em andamento** e
o que ainda é **próximo passo**. Ela deve ser atualizada quando o estado
mudar.

### Feito

- [x] Repositório privado criado no GitHub.
- [x] Branch `main` configurada.
- [x] MAI Central publicada e versionada.
- [x] Ian convidado como colaborador.
- [x] Fluxo de branches documentado.
- [x] Organizador do Discord criado.
- [x] Token do Discord salvo localmente fora do Git.
- [x] Servidor `MAI LAB CORP` organizado com emojis, descrições e guias.
- [x] Cargos antigos sem emoji unificados.
- [x] Auditoria visual executada pelo organizador.
- [x] Padrão inicial de contexto, memória e skills dos agentes documentado.

### Em andamento

- [ ] Ian aceitar o convite do GitHub, caso ainda esteja pendente.
- [ ] Conferir e ajustar permissões dos cargos no Discord.
- [ ] Remover a permissão `Administrador` do bot após confirmar que a
      estrutura está estável.
- [ ] Definir o primeiro produto da MAI.
- [ ] Criar o primeiro documento em `docs/produtos/`.

### Próximos passos

- [ ] Criar o primeiro Issue de oportunidade.
- [ ] Validar o problema com potenciais clientes.
- [ ] Abrir o primeiro Pull Request de documentação ou produto.
- [ ] Configurar alertas GitHub → Discord.
- [ ] Implementar a Fase 1 da integração Grok: leitura e resumos.
- [ ] Testar o primeiro agente de QA/documentação em modo somente leitura.
- [ ] Configurar proteção formal da branch `main`.
- [ ] Adicionar testes e automações quando existir código de produto.

### Fonte desta atualização

Commits do organizador do Discord:

```text
fe3c5df  Organizador inicial
f82dde5  Emojis e descrições
ff5d5f8  Estrutura completa
eb15659  Auditoria e normalização visual
```

---

## 23. Manual rápido para começar

### Maicon ou Ian recebeu uma tarefa

1. Leia a MAI Central e a Issue relacionada.
2. Confirme o resultado esperado.
3. Crie uma branch curta e clara.
4. Faça somente a tarefa combinada.
5. Salve commits pequenos.
6. Teste ou confira a alteração.
7. Abra um Pull Request.
8. Explique o que mudou e como revisar.
9. Espere a aprovação.
10. Só então faça merge na `main`.

### Uma IA recebeu uma solicitação

1. Leia a MAI Central.
2. Verifique se existe Issue, PR ou documento relacionado.
3. Separe fatos, hipóteses e dúvidas.
4. Não altere regras ambíguas sem avisar.
5. Não invente validação, cliente, métrica ou resultado.
6. Proteja segredos e dados pessoais.
7. Entregue uma sugestão rastreável.
8. Atualize a documentação relacionada quando a mudança for aprovada.

### Uma informação foi discutida no Discord

```text
conversa
→ resumo
→ Issue, PR ou documento no GitHub
→ link de volta no Discord
```

Esse ciclo mantém a comunicação rápida sem transformar o Discord em um
arquivo desorganizado.
