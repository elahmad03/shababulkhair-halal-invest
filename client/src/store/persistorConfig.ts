// redux/persistorConfig.ts
'use client'; // This file MUST be a client component because it uses localStorage

import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Import your reducers
import authReducer from '@/store/features/auth/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here if you have them, e.g.,
  // products: productsReducer,
});

const persistConfig = {
  key: 'root', // Key for localStorage
  storage, // Uses localStorage
  whitelist: ['auth'], // ONLY the 'auth' slice will be persisted
  // If you had a 'blacklist' array, it would list slices NOT to persist.
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);