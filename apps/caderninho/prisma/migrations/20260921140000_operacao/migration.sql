-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "proximo" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Cliente" ADD COLUMN "extra" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Projeto" ADD COLUMN "extra" TEXT NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clienteId" TEXT,
    "projetoId" TEXT,
    "tarefaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Atividade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Atividade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Atividade_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Atividade_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "detalhe" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Auditoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL DEFAULT '#9a7840'
);
CREATE UNIQUE INDEX "Tag_nome_key" ON "Tag"("nome");

CREATE TABLE "ClienteTag" (
    "clienteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ClienteTag_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClienteTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("clienteId", "tagId")
);

CREATE TABLE "ProjetoTag" (
    "projetoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ProjetoTag_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjetoTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("projetoId", "tagId")
);

CREATE TABLE "ModeloMensagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'interno',
    "corpo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "CampoPersonalizado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entidade" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'texto',
    "opcoes" TEXT NOT NULL DEFAULT ''
);
