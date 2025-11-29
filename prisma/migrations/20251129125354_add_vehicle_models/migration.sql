-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "category" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VehicleModel_brandName_idx" ON "VehicleModel"("brandName");

-- CreateIndex
CREATE INDEX "VehicleModel_isPopular_idx" ON "VehicleModel"("isPopular");
