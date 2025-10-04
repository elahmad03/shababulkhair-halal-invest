import { configureStore } from '@reduxjs/toolkit';
import { tokenApi } from './tokenApi';

export const store = configureStore({
  reducer: {
    [tokenApi.reducerPath]: tokenApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(tokenApi.middleware)  // ✅ tokenApi
        // ✅ also include api
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;