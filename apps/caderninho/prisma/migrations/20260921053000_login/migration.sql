-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "ficha" TEXT NOT NULL DEFAULT '',
    "tipo" TEXT NOT NULL DEFAULT 'humano',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("ativo", "createdAt", "email", "ficha", "funcao", "id", "login", "nome", "papel", "senhaHash", "tipo")
SELECT
    "ativo",
    "createdAt",
    "email",
    "ficha",
    "funcao",
    "id",
    CASE
        WHEN "tipo" = 'humano' AND lower("nome") = 'maicon' THEN 'adminmm'
        WHEN "tipo" = 'humano' AND lower("nome") = 'ian' THEN 'adminian'
        WHEN "ficha" != '' THEN "ficha"
        ELSE "email"
    END,
    "nome",
    "papel",
    "senhaHash",
    "tipo"
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
