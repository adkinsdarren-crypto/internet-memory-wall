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
    "wallSlug" TEXT NOT NULL DEFAULT 'm',
    "tileIndex" INTEGER NOT NULL,
    "imageData" TEXT,
    "imageUrl" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Memory" ("accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "paid", "tileIndex", "title", "updatedAt", "wallSlug") SELECT "accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "paid", "tileIndex", "title", "updatedAt", "wallSlug" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
CREATE UNIQUE INDEX "Memory_wallSlug_tileIndex_key" ON "Memory"("wallSlug", "tileIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
