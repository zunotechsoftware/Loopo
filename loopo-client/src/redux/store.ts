import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './slices/navigationSlice';
import productsReducer from './slices/productsSlice';
import chatReducer from './slices/chatSlice';
import myAdsReducer from './slices/myAdsSlice';
import walletReducer from './slices/walletSlice';
import uiReducer from './slices/uiSlice';
import notificationsReducer from './slices/notificationsSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    products: productsReducer,
    chat: chatReducer,
    myAds: myAdsReducer,
    wallet: walletReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
