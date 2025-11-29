-- DropIndex
DROP INDEX "SupplierVehicle_regNumber_idx";

-- AlterTable
ALTER TABLE "SupplierVehicle" ALTER COLUMN "regNumber" DROP NOT NULL;
