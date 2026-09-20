# Instruções para o Copilot na MAI

Antes de sugerir ou alterar qualquer coisa:

1. Leia `agentes/CONTEXTO-MINIMO.md` e a ficha em `agentes/` do setor
   envolvido. Só abra a MAI Central inteira se a tarefa for de regra,
   processo ou decisão da empresa.
2. Confira a Issue, branch ou Pull Request relacionado.
3. Preserve padrões e decisões já registradas.
4. Não altere a branch `main` diretamente.
5. Não misture tarefas diferentes na mesma alteração.
6. Não invente requisitos, clientes, métricas ou validações.
7. Não crie, revele ou committe tokens, senhas, chaves ou arquivos `.env`.
8. Separe fatos, hipóteses, riscos e dúvidas.
9. Explique arquivos alterados e como testar.
10. Se a mudança for ambígua e afetar a MAI Central, pare, proponha e peça consenso.
11. Não envie o repositório inteiro, nem todas as fichas, em uma pergunta só.

## Fluxo esperado

```text
Issue
→ branch específica
→ alteração pequena
→ teste ou verificação
→ commit claro
→ Pull Request
→ revisão
```

## Linguagem

Explique decisões em português simples. Prefira clareza a complexidade.
Quando houver mais de uma alternativa razoável, apresente as opções e os
impactos antes de escolher.
