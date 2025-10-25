

export type UserTableType = {
  id: number;
  fullName: string;
  email: string;
  role: 'member' | 'committee' | 'admin';
  kycStatus: 'pending' | 'verified' | 'failed';
  balance: number;
  createdAt: Date;
};