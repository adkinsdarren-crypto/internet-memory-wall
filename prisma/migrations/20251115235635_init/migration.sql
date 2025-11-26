-- CreateTable
CREATE TABLE "Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "authorName" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT 'none'
);
