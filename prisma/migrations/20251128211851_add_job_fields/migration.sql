-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "enteredBy" TEXT,
ADD COLUMN     "numberOfAdults" INTEGER,
ADD COLUMN     "pickupTime" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "vehicleModel" TEXT;
