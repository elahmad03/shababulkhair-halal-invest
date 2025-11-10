export type WithdrawalSource = 'wallet' | 'divest';
export type DivestmentType = 'profit_only' | 'full_divestment';

export interface WithdrawalFormData {
  source: WithdrawalSource;
  amount: string;
  cycleId?: number;
  divestmentType?: DivestmentType;
  bankName: string;
  accountNumber: string;
  accountName: string;
}