'use client';

import { combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { configureStore } from '@reduxjs/toolkit';

import authReducer from '@/store/features/auth/authSlice';
import kycReducer from '@/store/features/user/kycSlice';
import  userReducer from '@/store/features/user/userSlice';
import walletReducer from '@/store/slice/walletSlice';

// --- Combine all reducers ---
const rootReducer = combineReducers({
  auth: authReducer,
  kyc: kycReducer, // ✅ Include this here
  user: userReducer, // ✅ Include this here
  wallet: walletReducer, // ✅ Include this here
});

// --- Persist Configuration ---
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // ✅ Only persist auth (not kyc unless needed)
};

// --- Persisted Reducer ---
const pReducer = persistReducer(persistConfig, rootReducer);

// --- Create Store Function ---
export const makeStore = () => {
  return configureStore({
    reducer: pReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/PAUSE',
            'persist/PURGE',
            'persist/REGISTER',
            'persist/FLUSH',
          ],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// --- Infer Types ---
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// --- Singleton store ---
let clientStore: AppStore | undefined;

export const getClientStore = () => {
  if (!clientStore) {
    clientStore = makeStore();
  }
  return clientStore;
};

// --- Persistor ---
export const persistor = persistStore(getClientStore());
