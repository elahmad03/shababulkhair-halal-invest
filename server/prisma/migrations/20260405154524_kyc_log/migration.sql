-- CreateTable
CREATE TABLE "kyc_audit_logs" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" UUID NOT NULL,
    "kyc_id" UUID,
    "meta" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kyc_audit_logs_actor_id_idx" ON "kyc_audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "kyc_audit_logs_kyc_id_idx" ON "kyc_audit_logs"("kyc_id");

-- CreateIndex
CREATE INDEX "kyc_audit_logs_created_at_idx" ON "kyc_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "kyc_audit_logs" ADD CONSTRAINT "kyc_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_audit_logs" ADD CONSTRAINT "kyc_audit_logs_kyc_id_fkey" FOREIGN KEY ("kyc_id") REFERENCES "kyc_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
