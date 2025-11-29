-- Step 1: Create ProductCategory table
CREATE TABLE IF NOT EXISTS "ProductCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Create indexes
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");
CREATE INDEX "ProductCategory_productId_idx" ON "ProductCategory"("productId");
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

-- Step 3: Migrate existing categoryId relationships to ProductCategory
INSERT INTO "ProductCategory" ("productId", "categoryId", "createdAt")
SELECT "id", "categoryId", CURRENT_TIMESTAMP
FROM "Product"
WHERE "categoryId" IS NOT NULL;

-- Step 4: Drop the categoryId column from Product table
-- Note: SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
CREATE TABLE "Product_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "colors" TEXT NOT NULL DEFAULT '[]',
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "itemType" TEXT NOT NULL DEFAULT '',
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy data from old table to new table
INSERT INTO "Product_new" ("id", "name", "description", "priceCents", "imageUrl", "gallery", "colors", "sizes", "itemType", "inventory", "isFeatured", "createdAt", "updatedAt")
SELECT "id", "name", "description", "priceCents", "imageUrl", "gallery", "colors", "sizes", "itemType", "inventory", "isFeatured", "createdAt", "updatedAt"
FROM "Product";

-- Drop old table and rename new table
DROP TABLE "Product";
ALTER TABLE "Product_new" RENAME TO "Product";


