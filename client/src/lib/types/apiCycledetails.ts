type ApiCycleDetails = {
  id: string;
  cycleName: string;
  status: string;

  startDate: string | null;
  endDate: string | null;
  createdAt: string;

  totalProfitRealizedKobo: string;
  investorProfitPoolKobo: string;
  orgProfitShareKobo: string;

  totalCapitalInvestedKobo?: string;
  totalSharesSold?: number;
  investorCount?: number;

  _count?: {
    investments: number;
    businessVentures: number;
  };

  investments?: any[];
  businessVentures?: any[];
};