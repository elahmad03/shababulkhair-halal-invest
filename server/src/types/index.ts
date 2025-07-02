export interface MonnifyConfig {
  baseUrl: string;
  apiKey: string;
  secretKey: string;
  contractCode: string;
  webhookSecret: string;
}

export interface MonnifyTokenResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface MonnifyInitTransactionPayload {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  currencyCode: string;
  contractCode: string;
  redirectUrl: string;
  paymentMethods: string[];
}

export interface MonnifyInitTransactionResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    merchantName: string;
    apiKey: string;
    enabledPaymentMethod: string[];
    checkoutUrl: string;
  };
}

export interface MonnifyVerificationResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    amountPaid: string;
    totalPayable: string;
    settlementAmount: string;
    paidOn: string;
    paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
    paymentDescription: string;
    currency: string;
    paymentMethod: string;
    product: {
      type: string;
      reference: string;
    };
    cardDetails?: {
      maskedPan: string;
      authorizationCode: string;
    };
    accountDetails?: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
      amountPaid: string;
    };
  };
}

export interface MonnifyWebhookPayload {
  eventType: string;
  eventData: {
    product: {
      type: string;
      reference: string;
    };
    transactionReference: string;
    paymentReference: string;
    paidOn: string;
    paymentDescription: string;
    metaData: Record<string, any>;
    destinationAccountInformation: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
    };
    amountPaid: string;
    totalPayable: string;
    cardDetails?: {
      maskedPan: string;
      authorizationCode: string;
    };
    accountDetails?: {
      accountName: string;
      accountNumber: string;
      bankCode: string;
      amountPaid: string;
    };
    paymentMethod: string;
    currency: string;
    settlementAmount: string;
    paymentStatus: string;
  };
}

export interface FundingInitializeRequest {
  amount: number;
}

export interface FundingInitializeResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    checkoutUrl: string;
    amount: number;
    transactionId: string;
  };
  error?: string;
}

export interface FundingVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: string;
  };
  error?: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  data?: {
    balance: number;
    tier: number;
    walletId: string;
  };
  message?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data?: {
    transactions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}