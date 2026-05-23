-- CreateTable
CREATE TABLE "Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "symbol" TEXT NOT NULL,
    "buyExchange" TEXT NOT NULL,
    "buyPrice" REAL NOT NULL,
    "sellExchange" TEXT NOT NULL,
    "sellPrice" REAL NOT NULL,
    "spread" REAL NOT NULL,
    "profit" REAL NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
