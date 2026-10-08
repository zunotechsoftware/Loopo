'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store';
import { initAuthThunk } from './slices/authSlice';
import { setLocationData, loadSavedLocation } from './slices/uiSlice';

/** Inner component that can access the store dispatch */
function AppInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // On app startup: check for a stored token and load the current user
    dispatch(initAuthThunk());

    // Initial state always starts from DEFAULT_LOCATION (see uiSlice) so
    // server and client render identically on first paint; the real
    // localStorage-saved location is applied here, post-mount, once
    // hydration is already done.
    dispatch(setLocationData(loadSavedLocation()));
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
