-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'conversando',
    "proximoPasso" TEXT NOT NULL DEFAULT '',
    "proximoEm" TEXT NOT NULL DEFAULT '',
    "nota" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
