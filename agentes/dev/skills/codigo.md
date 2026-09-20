# 🛠️ Skill: código da MAI

## Objetivo

Escrever ou revisar código simples, explícito e no estilo do repositório.

## Quando usar

- Pedido para implementar, refatorar ou padronizar código.
- Review de arquivo Python ou script.

## Quando não usar

- Inventar stack (Redis, Docker, Oracle) que o projeto não tem.
- Trocar snake_case Python por camelCase.

## Entrada necessária

- Arquivo ou trecho. Se não tiver, abrir com as ferramentas de Git.

## Passo a passo

1. Ler o arquivo que já existe. Reutilizar.
2. Identificadores em inglês. Texto de interface e docs em português.
3. Python: `snake_case`, type hints, função curta.
4. Uma responsabilidade por arquivo.
5. Validar entrada no começo. Não engolir erro.
6. Nada de token, senha ou `.env` no código.
7. Alteração pequena. Sem classe-deus.

## Saída esperada

Sugestão local, com risco e como testar. Sem merge.

## Checklist de qualidade

- [ ] Leu o arquivo real.
- [ ] Não criou abstração “para o futuro”.
- [ ] Sem segredo no diff.
- [ ] Dá para testar o pedaço.

## Limites e aprovação

- Ações que exigem aprovação: qualquer escrita real no Git.
- Dados que nunca devem ser enviados: tokens, senhas, dados pessoais.

## Histórico

| Data | Alteração | Motivo | Aprovador |
|---|---|---|---|
| 2026-09-18 | Extraída do treinamento 07 | Destilar code style sem MM Brain | Pendente |
