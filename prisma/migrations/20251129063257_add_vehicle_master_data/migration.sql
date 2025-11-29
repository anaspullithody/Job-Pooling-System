-- AlterTable
ALTER TABLE "SupplierVehicle" ADD COLUMN     "brand" TEXT;

-- CreateTable
CREATE TABLE "VehicleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategory_name_key" ON "VehicleCategory"("name");

-- CreateIndex
CREATE INDEX "VehicleCategory_name_idx" ON "VehicleCategory"("name");

-- CreateIndex
CREATE INDEX "VehicleCategory_sortOrder_idx" ON "VehicleCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_name_key" ON "VehicleBrand"("name");

-- CreateIndex
CREATE INDEX "VehicleBrand_name_idx" ON "VehicleBrand"("name");

-- CreateIndex
CREATE INDEX "VehicleBrand_isPopular_idx" ON "VehicleBrand"("isPopular");

-- CreateIndex
CREATE INDEX "SupplierVehicle_brand_idx" ON "SupplierVehicle"("brand");
