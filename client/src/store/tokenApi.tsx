import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReactNode } from 'react';

interface TokenHolder {
  address: string;
  balance: string;
  percentage: string;
}

interface TokenHoldersResponse {
  holders: TokenHolder[];
  total: number;
  page: number;
  perPage: number;
}

interface TokenCounters {
  transfers_count: ReactNode;
  token_holders_count: ReactNode;
  holders: number;
  transactions: number;
  transfers: number;
}

export const tokenApi = createApi({
  reducerPath: 'tokenApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://ledger.sidrachain.com/api/v2/' }),
  endpoints: (builder) => ({
    getTokenHolders: builder.query<TokenHoldersResponse, string>({
      query: (contractAddress) => `tokens/${contractAddress}/holders`,
    }),
    getCounters: builder.query<TokenCounters, string>({
      query: (contractAddress) => `tokens/${contractAddress}/counters`,
    }),
  }),
});

export const { useGetTokenHoldersQuery, useGetCountersQuery } = tokenApi;