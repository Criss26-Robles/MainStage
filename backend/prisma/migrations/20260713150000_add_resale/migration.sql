-- AlterTable
ALTER TABLE "Order" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "Order" ADD COLUMN "resoldToUserId" INTEGER;

-- CreateTable
CREATE TABLE "Resale" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER,
    "askPrice" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'listed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),

    CONSTRAINT "Resale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resale_orderId_key" ON "Resale"("orderId");

-- AddForeignKey
ALTER TABLE "Resale" ADD CONSTRAINT "Resale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Resale" ADD CONSTRAINT "Resale_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resale" ADD CONSTRAINT "Resale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
