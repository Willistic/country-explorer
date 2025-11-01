import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from './countriesSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    countries: countriesReducer,
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;