-- AlterTable
ALTER TABLE "Product" ADD COLUMN "gallery" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "colors" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "sizes" TEXT NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "selectedColor" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedColorHex" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedColorImage" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "selectedSize" TEXT;
