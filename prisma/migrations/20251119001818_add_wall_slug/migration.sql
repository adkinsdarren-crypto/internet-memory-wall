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
    "paid" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Memory" ("accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "paid", "tileIndex", "title", "updatedAt") SELECT "accentColor", "authorName", "body", "createdAt", "id", "imageData", "imageUrl", "paid", "tileIndex", "title", "updatedAt" FROM "Memory";
DROP TABLE "Memory";
ALTER TABLE "new_Memory" RENAME TO "Memory";
CREATE UNIQUE INDEX "Memory_wallSlug_tileIndex_key" ON "Memory"("wallSlug", "tileIndex");
CREATE TABLE "new_PaidTile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wallSlug" TEXT NOT NULL DEFAULT 'm',
    "tileIndex" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PaidTile" ("createdAt", "id", "stripeSessionId", "tileIndex") SELECT "createdAt", "id", "stripeSessionId", "tileIndex" FROM "PaidTile";
DROP TABLE "PaidTile";
ALTER TABLE "new_PaidTile" RENAME TO "PaidTile";
CREATE UNIQUE INDEX "PaidTile_stripeSessionId_key" ON "PaidTile"("stripeSessionId");
CREATE UNIQUE INDEX "PaidTile_wallSlug_tileIndex_key" ON "PaidTile"("wallSlug", "tileIndex");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
