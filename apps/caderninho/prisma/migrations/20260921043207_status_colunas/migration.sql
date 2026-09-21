-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'a_fazer',
    "estimativaMin" INTEGER NOT NULL DEFAULT 60,
    "prazo" DATETIME,
    "assigneeId" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "clienteId" TEXT,
    "projetoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "pedidoId" TEXT,
    CONSTRAINT "Tarefa_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tarefa" ("assigneeId", "clienteId", "createdAt", "criadorId", "descricao", "estimativaMin", "id", "pedidoId", "prazo", "projetoId", "status", "titulo", "updatedAt") SELECT "assigneeId", "clienteId", "createdAt", "criadorId", "descricao", "estimativaMin", "id", "pedidoId", "prazo", "projetoId", "status", "titulo", "updatedAt" FROM "Tarefa";
DROP TABLE "Tarefa";
ALTER TABLE "new_Tarefa" RENAME TO "Tarefa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
