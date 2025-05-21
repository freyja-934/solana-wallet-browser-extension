import { configureStore } from '@reduxjs/toolkit';
import walletReducer, { subscribeToWalletChanges } from '../features/wallet/walletSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
  // Add middleware for development tools
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wallet/setPublicKey'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.publicKey'],
        // Ignore these paths in the state
        ignoredPaths: ['wallet.publicKey'],
      },
    }),
});

// Subscribe to store changes to save to localStorage
subscribeToWalletChanges(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 