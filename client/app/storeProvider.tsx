// store/provider.tsx
'use client'; // <-- CRITICAL: This must be at the very top

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; // For loading state

// Import the store and persistor directly from your store/index.ts
import { getClientStore, persistor } from '@/store'; // <-- Import persistor here!

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  // Get the single client-side store instance
  const store = getClientStore();

  return (
    <Provider store={store}>
      {/* PersistGate delays rendering your app's UI until state is rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}