'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store';
import { initAuthThunk } from './slices/authSlice';

/** Inner component that can access the store dispatch */
function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // On app startup: check for a stored token and load the current user
    dispatch(initAuthThunk());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInit>{children}</AppInit>
    </Provider>
  );
}
