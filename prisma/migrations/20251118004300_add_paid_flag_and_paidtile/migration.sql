-- CreateTable
CREATE TABLE "PaidTile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tileIndex" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "tileIndex" INTEGER NOT NULL,
    "imageData" TEXT,
    "imageUrl" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Memory" ("accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "tileIndex", "title", "updatedAt") SELECT "accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "tileIndex", "title", "updatedAt" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
CREATE UNIQUE INDEX "Memory_tileIndex_key" ON "Memory"("tileIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PaidTile_tileIndex_key" ON "PaidTile"("tileIndex");

-- CreateIndex
CREATE UNIQUE INDEX "PaidTile_stripeSessionId_key" ON "PaidTile"("stripeSessionId");
