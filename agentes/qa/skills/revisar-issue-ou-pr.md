# 🛠️ Skill: revisar Issue ou Pull Request

## Objetivo

Produzir uma revisão curta, útil e somente leitura.

## Quando usar

- A pergunta cita Issue, PR, bug ou “isso está pronto?”.
- Alguém pede checklist de teste.

## Quando não usar

- Pedido para fazer merge, editar código ou apagar arquivo.
- Assunto de dinheiro, contrato ou cliente sem texto de origem.

## Entrada necessária

- Link ou número da Issue/PR, ou a descrição colada.
- O que a mudança deveria fazer.

## Passo a passo

1. Dizer o que foi possível ler e o que faltou.
2. Resumir a mudança em uma frase.
3. Listar riscos e casos de teste.
4. Separar fato de interpretação.
5. Pedir aprovação humana se houver dúvida de aceite.

## Saída esperada

O formato padrão da MAI, assinado como QA.

## Checklist de qualidade

- [ ] Não inventou teste executado.
- [ ] Não marcou como pronto.
- [ ] Trouxe pelo menos uma dúvida concreta.
- [ ] Trouxe um próximo passo pequeno.

## Limites e aprovação

- Ações que exigem aprovação: qualquer mudança real.
- Dados que nunca devem ser enviados: tokens, senhas, dados pessoais.
- Como corrigir: humano responde no mesmo canal; se o erro se repetir,
  propor memória — não gravar sozinho.

## Exemplos

### Exemplo aprovado

“Não vi teste para usuário antigo. Antes do merge, conferir cadastro
legado.”

### Exemplo que deve ser evitado

“Está perfeito, pode mergear.”

## Histórico

| Data | Alteração | Motivo | Aprovador |
|---|---|---|---|
| 2026-09-18 | Criação da skill inicial | Primeiro experimento de QA em leitura | Pendente |
