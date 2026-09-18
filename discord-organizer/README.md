# Organizador do servidor Discord da MAI

Este script cria a estrutura inicial do servidor Discord da MAI. Ele pode
ser executado novamente sem duplicar categorias, canais ou cargos que já
existam.

## Segurança

- O token é solicitado diretamente no terminal e não aparece na tela.
- Nunca coloque o token neste repositório, no Discord ou na MAI Central.
- O arquivo `.gitignore` já impede o envio de arquivos `.env`.
- Se o token for exposto, use **Redefinir token** no Discord Developer Portal.

## O que será criado

### Categorias e canais

- Direção: `#ceo`, `#planejamento`
- Produto: `#produto`, `#pesquisa-de-mercado`
- Desenvolvimento: `#backend`, `#frontend`, `#bugs`
- Design: `#design`, `#criativos`
- Marketing: `#trafego`, `#copy`
- Financeiro: `#financeiro`
- Operações: `#qa`, `#seguranca`, `#clientes`

### Cargos

`Sócios`, `CEO`, `Produto`, `Dev`, `Design`, `Marketing`, `Financeiro`,
`QA`, `Segurança` e `Operações`.

O script cria os cargos, mas não muda permissões de pessoas
automaticamente. Permissões devem ser revisadas no Discord.

## Como executar

Na primeira vez, o terminal instalará a biblioteca necessária:

```bash
cd discord-organizer
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python organize_server.py
```

Quando aparecer:

```text
Cole o token do bot (não será exibido):
```

cole o token e pressione Enter. O token não será salvo pelo script.

## Resultado esperado

O terminal mostrará as categorias, canais e cargos criados. Se algum item já
existir, ele será reaproveitado. Ao final, o programa encerra a conexão.
