/*
  Warnings:

  - Added the required column `tileIndex` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "authorName" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT 'none',
    "tileIndex" INTEGER NOT NULL
);
INSERT INTO "new_Memory" ("accentColor", "authorName", "body", "createdAt", "id", "title", "updatedAt") SELECT "accentColor", "authorName", "body", "createdAt", "id", "title", "updatedAt" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
CREATE UNIQUE INDEX "Memory_tileIndex_key" ON "Memory"("tileIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
