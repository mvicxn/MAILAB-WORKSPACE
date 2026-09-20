# 🛠️ Skill: performance

## Objetivo

Só otimizar com evidência. Manter o código fácil de ler.

## Quando usar

- Alguém fala em lento, caro, timeout, cache, loop, token demais.

## Quando não usar

- Otimizar “por padrão”.
- Pedir Redis, GPU, fila ou CDN sem produto que precise disso.

## Entrada necessária

- O trecho lento, ou permissão para medir. Sem medida, só hipótese.

## Passo a passo

1. Dizer o que foi medido e o que é chute.
2. Procurar trabalho duplicado, I/O repetido, chamada de rede extra.
3. Preferir não fazer o trabalho: cache só com TTL e fonte oficial.
4. Timeout em chamada externa. Sem espera infinita.
5. Não mandar coleção enorme: paginar ou cortar.
6. Registrar antes/depois quando houver número.

## Saída esperada

Gargalo provável, mudança mínima, como conferir.

## Checklist de qualidade

- [ ] Não otimizou no escuro.
- [ ] Não complicou o código sem ganho.
- [ ] Timeout mencionado se houver rede.

## Histórico

| Data | Alteração | Motivo | Aprovador |
|---|---|---|---|
| 2026-09-18 | Extraída do treinamento 04 | Performance sem infra imaginária | Pendente |
