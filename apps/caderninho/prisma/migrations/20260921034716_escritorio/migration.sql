/*
  Warnings:

  - You are about to drop the `Pessoa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Pessoa";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'lead',
    "status" TEXT NOT NULL DEFAULT 'conversando',
    "contato" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "clienteId" TEXT,
    "quadroId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Projeto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "estimativaMin" INTEGER NOT NULL DEFAULT 60,
    "prazo" DATETIME,
    "assigneeId" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "clienteId" TEXT,
    "projetoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tarefa_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tarefaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Arquivo_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Atualizacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tarefaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Atualizacao_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Atualizacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reuniao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semana" TEXT NOT NULL,
    "pauta" TEXT NOT NULL DEFAULT '',
    "ata" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quadro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sala" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_quadroId_key" ON "Projeto"("quadroId");

-- CreateIndex
CREATE UNIQUE INDEX "Reuniao_semana_key" ON "Reuniao"("semana");

-- CreateIndex
CREATE UNIQUE INDEX "Quadro_sala_key" ON "Quadro"("sala");
