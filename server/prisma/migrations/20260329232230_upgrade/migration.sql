/*
  Warnings:

  - The `approvedById` column on the `kyc_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "kyc_profiles_user_id_key";

-- AlterTable
ALTER TABLE "kyc_profiles" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "country_code" SET DATA TYPE TEXT,
ALTER COLUMN "next_of_kin_phone" SET DATA TYPE TEXT,
DROP COLUMN "approvedById",
ADD COLUMN     "approvedById" UUID;

-- CreateIndex
CREATE INDEX "kyc_profiles_user_id_idx" ON "kyc_profiles"("user_id");

-- CreateIndex
CREATE INDEX "kyc_profiles_user_id_isActive_idx" ON "kyc_profiles"("user_id", "isActive");

-- AddForeignKey
ALTER TABLE "kyc_profiles" ADD CONSTRAINT "kyc_profiles_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
