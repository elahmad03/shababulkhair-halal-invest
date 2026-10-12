
export type KpiData = {
  totalCapitalUnderManagement: number;
  totalProfitDistributed: number;
  activeInvestors: number;
  pendingWithdrawals: number;
};

export type ActivityItem = {
  type: "registration" | "investment" | "withdrawal";
  description: string;
  timestamp: Date;
};



export type UserTableType = {
  id: string;
  fullName: string;
  email: string;
  role: "member" | "committee" | "admin";
  kycStatus:
    | "NOT_SUBMITTED"
    | "PENDING_REVIEW"
    | "VERIFIED"
    | "REJECTED";
  hasKycDocuments: boolean;
  createdAt: Date | string;
};