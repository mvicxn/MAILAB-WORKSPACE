-- AlterTable
ALTER TABLE "User" ADD COLUMN "empresaId" TEXT NOT NULL DEFAULT 'mai';

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "empresaId" TEXT NOT NULL DEFAULT 'mai';
ALTER TABLE "Cliente" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN "empresaId" TEXT NOT NULL DEFAULT 'mai';
ALTER TABLE "Projeto" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Tarefa" ADD COLUMN "empresaId" TEXT NOT NULL DEFAULT 'mai';
ALTER TABLE "Tarefa" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "empresaId" TEXT NOT NULL DEFAULT 'mai';

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "diaInteiro" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "clienteId" TEXT,
    "projetoId" TEXT,
    "tarefaId" TEXT,
    "local" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "cor" TEXT NOT NULL DEFAULT '#9a7840',
    "tipo" TEXT NOT NULL DEFAULT 'reuniao',
    "serieId" TEXT,
    "recorrencia" TEXT NOT NULL DEFAULT '',
    "lembretes" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "empresaId" TEXT NOT NULL DEFAULT 'mai',
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Evento_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventoParticipante" (
    "eventoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("eventoId", "userId"),
    CONSTRAINT "EventoParticipante_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventoParticipante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventoExcecao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventoId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    CONSTRAINT "EventoExcecao_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Evento_empresaId_inicio_idx" ON "Evento"("empresaId", "inicio");
CREATE INDEX "Evento_userId_inicio_idx" ON "Evento"("userId", "inicio");
CREATE INDEX "Cliente_empresaId_deletedAt_idx" ON "Cliente"("empresaId", "deletedAt");
CREATE INDEX "Projeto_empresaId_deletedAt_idx" ON "Projeto"("empresaId", "deletedAt");
CREATE INDEX "Tarefa_empresaId_deletedAt_idx" ON "Tarefa"("empresaId", "deletedAt");
