export type UserRole = "ADMIN" | "COMMITTEE" | "MEMBER";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DECEASED";
export type KycStatusType = "NOT_SUBMITTED" | "SUBMITTED" | "PENDING_MANUAL_REVIEW" | "VERIFIED" | "REJECTED";

export interface EditUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: AccountStatus;
  isEmailVerified?: boolean;
  // KYC fields (role is strictly DB-only, not editable via client)
  streetAddress?: string;
  city?: string;
  stateRegion?: string;
  countryCode?: string;
  dateOfBirth?: string;
  governmentIdType?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  kycStatus?: KycStatusType;
}

export interface UserEditLogItem {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  editedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface KycVersionItem {
  id: string;
  version: number;
  isActive: boolean;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  rejectedReason?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: AccountStatus;
  isEmailVerified?: boolean;
  walletAddress?: string;
  avatarUrl?: string;
  createdAt: string;
  kyc?: {
    id?: string;
    version?: number;
    isActive?: boolean;
    status: string;
    verificationDate?: string;
    avatarUrl?: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    streetAddress?: string;
    city?: string;
    stateRegion?: string;
    countryCode?: string;
    dateOfBirth?: string;
    governmentIdType?: string;
    nextOfKinName?: string;
    nextOfKinRelationship?: string;
    nextOfKinPhone?: string;
  };
  _count?: {
    investments: number;
    ledgerEntries: number;
  };
}

export interface UserDetail extends User {
  updatedAt: string;
  editLogs?: UserEditLogItem[];
  kycVersions?: KycVersionItem[];
  wallet?: {
    id: string;
    balance: number;
    currency: string;
  };
}

export interface UserKyc {
  id: string;
  version?: number;
  status: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  idType?: string;
  idNumber?: string;
  idDocumentUrl?: string;
  proofOfAddressUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  verificationDate?: string;
  rejectionReason?: string;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;
  kycAuditLogs?: Array<{
    id: string;
    action: string;
    comment?: string;
    changedBy: string;
    createdAt: string;
  }>;
}

export interface Investment {
  id: string;
  ventureId: string;
  venture: {
    id: string;
    name: string;
    status: string;
  };
  cycleId: string;
  cycle: {
    id: string;
    name: string;
    status: string;
  };
  amount: number;
  sharesAcquired: number;
  investmentDate: string;
  status: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionHash: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  relatedVenture?: {
    id: string;
    name: string;
  };
  relatedCycle?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ListUsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserTransactionsResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
