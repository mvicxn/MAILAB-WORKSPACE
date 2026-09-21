-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prateleira" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "link" TEXT NOT NULL DEFAULT '',
    "fonte" TEXT NOT NULL DEFAULT '',
    "empresaId" TEXT NOT NULL DEFAULT 'mai',
    "autorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "News_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "News_prateleira_createdAt_idx" ON "News"("prateleira", "createdAt");

-- CreateTable
CREATE TABLE "NewsLeitura" (
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsLeitura_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NewsLeitura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("newsId", "userId")
);
