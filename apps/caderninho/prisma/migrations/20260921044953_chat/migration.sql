-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humanoId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversa_humanoId_fkey" FOREIGN KEY ("humanoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Conversa_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mensagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversa_humanoId_funcionarioId_key" ON "Conversa"("humanoId", "funcionarioId");
