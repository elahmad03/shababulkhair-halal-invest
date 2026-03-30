-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('MEMBER', 'COMMITTEE', 'ADMIN');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'DECEASED');

-- CreateEnum
CREATE TYPE "kyc_status" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('DEPOSIT', 'SHARE_PURCHASE', 'CAPITAL_RETURN', 'PROFIT_DISTRIBUTION', 'WITHDRAWAL', 'SERVICE_PAYMENT', 'EMERGENCY_WITHDRAWAL');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "cycle_status" AS ENUM ('PENDING', 'OPEN_FOR_INVESTMENT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "distribution_status" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ledger_entry_type" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "disbursement_type" AS ENUM ('WALLET_BALANCE', 'FULL_DIVESTMENT', 'PROFIT_ONLY');

-- CreateEnum
CREATE TYPE "claim_status" AS ENUM ('PENDING_REVIEW', 'DOCUMENTS_REQUESTED', 'APPROVED_FOR_PAYOUT', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" VARCHAR(20),
    "role" "user_role" NOT NULL DEFAULT 'MEMBER',
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "street_address" TEXT,
    "city" TEXT,
    "state_region" TEXT,
    "country_code" VARCHAR(100),
    "date_of_birth" DATE,
    "kyc_status" "kyc_status" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "avatar_url" TEXT,
    "government_id_type" TEXT,
    "id_card_front_url" TEXT,
    "id_card_back_url" TEXT,
    "next_of_kin_name" TEXT NOT NULL,
    "next_of_kin_relationship" TEXT NOT NULL,
    "next_of_kin_phone" VARCHAR(20) NOT NULL,

    CONSTRAINT "kyc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "balance_kobo" BIGINT NOT NULL DEFAULT 0,
    "locked_balance_kobo" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "transaction_ref" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "transaction_type" "transaction_type" NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "transaction_status" "transaction_status" NOT NULL,
    "narration" TEXT,
    "related_entity_type" TEXT,
    "related_entity_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_cycles" (
    "id" UUID NOT NULL,
    "cycle_name" TEXT NOT NULL,
    "status" "cycle_status" NOT NULL DEFAULT 'PENDING',
    "price_per_share_kobo" BIGINT NOT NULL,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "description" TEXT,
    "total_profit_realized_kobo" BIGINT NOT NULL DEFAULT 0,
    "investor_profit_pool_kobo" BIGINT NOT NULL DEFAULT 0,
    "org_profit_share_kobo" BIGINT NOT NULL DEFAULT 0,
    "profit_distribution_status" "distribution_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investment_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shareholder_investments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "shares_allocated" BIGINT NOT NULL,
    "amount_invested_kobo" BIGINT NOT NULL,
    "profit_earned_kobo" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shareholder_investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizational_ledgers" (
    "id" UUID NOT NULL,
    "entry_type" "ledger_entry_type" NOT NULL,
    "source" TEXT NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "related_cycle_id" UUID,
    "recorded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizational_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_ventures" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "managed_by_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "allocated_amount_kobo" BIGINT NOT NULL,
    "expected_profit_kobo" BIGINT NOT NULL,
    "profit_realized_kobo" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "business_ventures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "auto_reinvest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursement_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "disbursement_type" "disbursement_type" NOT NULL,
    "related_cycle_id" UUID,
    "bank_name" TEXT NOT NULL,
    "account_number" VARCHAR(20) NOT NULL,
    "account_name" TEXT NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by_id" UUID,
    "processed_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,

    CONSTRAINT "disbursement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_disbursement_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ,

    CONSTRAINT "emergency_disbursement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deceased_user_claims" (
    "id" UUID NOT NULL,
    "deceased_user_id" UUID NOT NULL,
    "claimant_name" TEXT NOT NULL,
    "claimant_contact" TEXT NOT NULL,
    "status" "claim_status" NOT NULL DEFAULT 'PENDING_REVIEW',
    "death_certificate_url" TEXT,
    "admin_notes" TEXT,
    "processed_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "deceased_user_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "user_id" UUID,
    "request_method" VARCHAR(10) NOT NULL,
    "request_path" VARCHAR(255) NOT NULL,
    "recovery_point" TEXT NOT NULL DEFAULT 'STARTED',
    "locked_at" TIMESTAMPTZ,
    "response_code" INTEGER,
    "response_body" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_profiles_user_id_key" ON "kyc_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_ref_key" ON "transactions"("transaction_ref");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_transaction_ref_idx" ON "transactions"("transaction_ref");

-- CreateIndex
CREATE UNIQUE INDEX "shareholder_investments_user_id_cycle_id_key" ON "shareholder_investments"("user_id", "cycle_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deceased_user_claims_deceased_user_id_key" ON "deceased_user_claims"("deceased_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_key_key" ON "idempotency_keys"("key");

-- CreateIndex
CREATE INDEX "idempotency_keys_key_idx" ON "idempotency_keys"("key");

-- AddForeignKey
ALTER TABLE "kyc_profiles" ADD CONSTRAINT "kyc_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shareholder_investments" ADD CONSTRAINT "shareholder_investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shareholder_investments" ADD CONSTRAINT "shareholder_investments_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "investment_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_ledgers" ADD CONSTRAINT "organizational_ledgers_related_cycle_id_fkey" FOREIGN KEY ("related_cycle_id") REFERENCES "investment_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizational_ledgers" ADD CONSTRAINT "organizational_ledgers_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ventures" ADD CONSTRAINT "business_ventures_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "investment_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ventures" ADD CONSTRAINT "business_ventures_managed_by_id_fkey" FOREIGN KEY ("managed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_requests" ADD CONSTRAINT "disbursement_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_requests" ADD CONSTRAINT "disbursement_requests_related_cycle_id_fkey" FOREIGN KEY ("related_cycle_id") REFERENCES "investment_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement_requests" ADD CONSTRAINT "disbursement_requests_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_disbursement_requests" ADD CONSTRAINT "emergency_disbursement_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deceased_user_claims" ADD CONSTRAINT "deceased_user_claims_deceased_user_id_fkey" FOREIGN KEY ("deceased_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deceased_user_claims" ADD CONSTRAINT "deceased_user_claims_processed_by_id_fkey" FOREIGN KEY ("processed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
