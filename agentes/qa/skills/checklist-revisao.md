# 🛠️ Skill: checklist de revisão

## Objetivo

Dizer se uma alteração pode avançar, com riscos concretos.

## Quando usar

- Review de PR, Issue pronta, “está bom?”.

## Quando não usar

- Pedir deploy, Redis, health check de servidor que não existe.
- Marcar pronto sem ter lido o arquivo.

## Entrada necessária

- Diff, PR, Issue ou pasta. Abrir o Git se faltar.

## Passo a passo

1. O que muda, em uma frase.
2. Código: nome claro, pedaço pequeno, erro tratado.
3. Segurança: segredo, `.env`, dado pessoal, comando perigoso.
4. Tokens: contexto mínimo, sem dump.
5. Teste: o que conferir na mão, o que falta.
6. Documentação: README ou ficha ficou atrás?
7. Dá para desfazer? Se não, dizer.

## Saída esperada

Formato padrão do QA. Severidade: crítico / alto / médio / baixo.

## Checklist de qualidade

- [ ] Leu o que existe.
- [ ] Não inventou teste verde.
- [ ] Pelo menos um risco ou uma dúvida.

## Histórico

| Data | Alteração | Motivo | Aprovador |
|---|---|---|---|
| 2026-09-18 | Extraída do treinamento 11 | QA da MAI, sem MM Brain | Pendente |
