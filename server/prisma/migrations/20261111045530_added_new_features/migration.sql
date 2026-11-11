/*
  Warnings:

  - You are about to alter the column `investor_profit_percentage` on the `profit_distributions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `org_profit_percentage` on the `profit_distributions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.

*/
-- CreateEnum
CREATE TYPE "verification_token_type" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "business_ventures" ADD COLUMN     "agreement_receipt_url" TEXT,
ADD COLUMN     "agreement_uploaded_at" TIMESTAMPTZ,
ADD COLUMN     "agreement_uploaded_by_id" UUID;

-- AlterTable
ALTER TABLE "profit_distributions" ALTER COLUMN "investor_profit_percentage" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "org_profit_percentage" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "type" "verification_token_type" NOT NULL DEFAULT 'EMAIL_VERIFY',
ADD COLUMN     "used_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "user_edit_logs" (
    "id" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "edited_by_id" UUID NOT NULL,
    "field" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_edit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit_distribution_items" (
    "id" UUID NOT NULL,
    "distribution_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "invested_kobo" BIGINT NOT NULL,
    "payout_kobo" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profit_distribution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venture_profit_entries" (
    "id" UUID NOT NULL,
    "venture_id" UUID NOT NULL,
    "recorded_by_id" UUID NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "venture_profit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_edit_logs_target_user_id_idx" ON "user_edit_logs"("target_user_id");

-- CreateIndex
CREATE INDEX "user_edit_logs_edited_by_id_idx" ON "user_edit_logs"("edited_by_id");

-- CreateIndex
CREATE INDEX "user_edit_logs_created_at_idx" ON "user_edit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "profit_distribution_items_distribution_id_user_id_key" ON "profit_distribution_items"("distribution_id", "user_id");

-- CreateIndex
CREATE INDEX "venture_profit_entries_venture_id_idx" ON "venture_profit_entries"("venture_id");

-- CreateIndex
CREATE INDEX "venture_profit_entries_recorded_by_id_idx" ON "venture_profit_entries"("recorded_by_id");

-- AddForeignKey
ALTER TABLE "user_edit_logs" ADD CONSTRAINT "user_edit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_edit_logs" ADD CONSTRAINT "user_edit_logs_edited_by_id_fkey" FOREIGN KEY ("edited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_distribution_items" ADD CONSTRAINT "profit_distribution_items_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "profit_distributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_distribution_items" ADD CONSTRAINT "profit_distribution_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ventures" ADD CONSTRAINT "business_ventures_agreement_uploaded_by_id_fkey" FOREIGN KEY ("agreement_uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venture_profit_entries" ADD CONSTRAINT "venture_profit_entries_venture_id_fkey" FOREIGN KEY ("venture_id") REFERENCES "business_ventures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venture_profit_entries" ADD CONSTRAINT "venture_profit_entries_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
