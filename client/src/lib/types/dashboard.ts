// /lib/types.ts

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
  id: number;
  fullName: string;
  email: string;
  role: 'member' | 'committee' | 'admin';
  kycStatus: 'pending' | 'verified' | 'failed';
  balance: number;
  createdAt: Date;
};