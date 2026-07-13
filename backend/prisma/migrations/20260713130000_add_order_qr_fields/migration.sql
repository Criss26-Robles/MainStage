-- AlterTable
ALTER TABLE "Order" ADD COLUMN "qrCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "qrUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "qrUsedAt" TIMESTAMP(3);

-- Backfill existing orders
UPDATE "Order" SET "qrCode" = 'MS-QR-' || id::text WHERE "qrCode" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "qrCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_qrCode_key" ON "Order"("qrCode");
