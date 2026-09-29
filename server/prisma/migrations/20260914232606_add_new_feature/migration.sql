/*
  Warnings:

  - You are about to drop the column `account_name` on the `disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `account_name` on the `emergency_disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `emergency_disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `emergency_disbursement_requests` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `investment_cycles` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `investment_cycles` table. All the data in the column will be lost.
  - Added the required column `bank_account_id` to the `disbursement_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_account_id` to the `emergency_disbursement_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disbursement_requests" DROP COLUMN "account_name",
DROP COLUMN "account_number",
DROP COLUMN "bank_name",
ADD COLUMN     "bank_account_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "emergency_disbursement_requests" DROP COLUMN "account_name",
DROP COLUMN "account_number",
DROP COLUMN "bank_name",
ADD COLUMN     "bank_account_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "investment_cycles" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "active_ends_at" TIMESTAMPTZ,
ADD COLUMN     "active_starts_at" TIMESTAMPTZ,
ADD COLUMN     "funding_closes_at" TIMESTAMPTZ,
ADD COLUMN     "funding_opens_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" VARCHAR(20) NOT NULL,
    "account_name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_user_id_account_number_key" ON "bank_accounts"("user_id", "account_number");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_requests" ADD CONSTRAINT "disbursement_requests_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_disbursement_requests" ADD CONSTRAINT "emergency_disbursement_requests_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
