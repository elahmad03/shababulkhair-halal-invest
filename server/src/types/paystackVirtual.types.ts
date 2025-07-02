// types/paystack.types.ts

export interface PaystackReservedAccountResponse {
  status: boolean;
  message: string;
  data: {
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
      international_format_phone: string;
    };
    account_number: string;
    account_name: string;
    bank_id: number;
    bank_name: string;
    created_at: string;
    domain: string;
    id: number;
    is_deleted: boolean;
    is_permanent: boolean;
    metadata: any;
    recipient_code: string;
    type: string;
    updated_at: string;
    currency: string;
  };
}

export interface PaystackWebhookEvent<T = any> {
  event: string;
  data: T;
}

export interface PaystackTransferSuccessData {
  id: number;
  domain: string;
  status: 'success';
  recipient: {
    id: number;
    domain: string;
    type: string;
    name: string;
    description: string;
    currency: string;
    metadata: {
      userId?: string; // Add userId to metadata if you pass it when creating the reserved account
    };
    recipient_code: string;
    active: boolean;
    is_deleted: boolean;
    details: {
      account_number: string;
      account_name: string | null;
      bank_code: string;
      bank_name: string;
    };
    created_at: string;
    updated_at: string;
  };
  amount: number; // in kobo
  currency: string;
  reference: string;
  source: string; // "balance"
  source_details: any; // Can be null
  reason: string;
  status: 'success';
  transfer_code: string;
  titan_code: string | null;
  transferred_at: string;
  failures: any; // Can be null
  createdAt: string;
  updatedAt: string;
}

// For incoming webhook `charge.success` or `transfer.success`
export interface PaystackChargeSuccessData {
  id: number;
  domain: string;
  status: string; // e.g., 'success'
  reference: string;
  amount: number; // in kobo
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: {
    userId?: string;
    provider?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  log: {
    start_time: number;
    time_spent: number;
    attempts: number;
    errors: number;
    success: boolean;
    mobile: boolean;
    input: any[];
    history: Array<{
      type: string;
      message: string;
      time: number;
    }>;
  };
  fees: number; // in kobo
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
    risk_action: string;
  };
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string | null;
    account_name: string | null;
  };
  plan: any;
  subaccount: any;
  // This is crucial for reserved accounts. Paystack can send details here when funds are sent to a reserved account.
  // This can be part of `charge.success` or `transfer.success` webhook event data.
  // When funds are sent to a reserved account, it's typically treated as an incoming transfer/deposit.
  // The relevant webhook event for this would usually be `transfer.success` or `charge.success` with specific metadata.
  // For reserved accounts, Paystack generates a `dedicated_account` webhook event type or it comes in `charge.success`
  // with `source` information indicating a bank transfer.
  dedicated_account?: {
    id: number;
    account_number: string;
    account_name: string;
    bank: {
      id: number;
      name: string;
      slug: string;
    };
    created_at: string;
  };
}

export interface PaystackDedicatedAccountWebhookData {
  event: 'dedicated_account.assign'; // Or 'charge.success' when money comes in
  data: {
    id: number;
    domain: string;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: {
        userId: string; // The userId you passed when creating the dedicated account
      };
      risk_action: string;
      international_format_phone: string;
    };
    dedicated_account: {
      id: number;
      account_number: string;
      account_name: string;
      bank: {
        id: number;
        name: string;
        slug: string;
      };
      active: boolean;
      currency: string;
      assigned: boolean;
      created_at: string;
      updated_at: string;
      assignment_method: string;
      metadata: {
        userId: string; // The userId you passed when creating the dedicated account
      };
      split_config: any; // Can be null
    };
    amount: number; // The amount transferred into the account (in kobo)
    currency: string;
    status: 'success'; // Or 'success' for charge.success
    reference: string; // A unique reference for the transaction
    paid_at: string; // Time of payment
    channel: string; // e.g., 'bank_transfer'
    // ... other fields present in a charge.success event
  };
}