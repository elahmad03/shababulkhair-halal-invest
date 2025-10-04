import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tokenApi = createApi({
  reducerPath: 'tokenApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://ledger.sidrachain.com/api/v2/' }),
  endpoints: (builder) => ({
    getTokenHolders: builder.query<any, string>({
      query: (contractAddress) => `tokens/${contractAddress}/holders`,
    }),
    getCounters: builder.query<any, string>({
      query: (contractAddress) => `tokens/${contractAddress}/counters`,
    }),
  }),
});

export const { useGetTokenHoldersQuery, useGetCountersQuery } = tokenApi;