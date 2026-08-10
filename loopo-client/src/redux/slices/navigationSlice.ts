import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ActiveTab =
  | 'home'
  | 'explore'
  | 'categories'
  | 'near-you'
  | 'messages'
  | 'my-ads'
  | 'saved'
  | 'orders'
  | 'wallet'
  | 'sell'
  | 'help'
  | 'settings'
  | 'product-detail';

interface NavigationState {
  activeTab: ActiveTab;
  selectedProductId: string | null;
  selectedCategoryName: string | null;
}

const initialState: NavigationState = {
  activeTab: 'home',
  selectedProductId: 'p1',
  selectedCategoryName: null,
};

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload;
    },
    openProductDetail: (state, action: PayloadAction<string>) => {
      state.selectedProductId = action.payload;
      state.activeTab = 'product-detail';
    },
    openCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategoryName = action.payload;
      state.activeTab = 'categories';
    },
  },
});

export const { setActiveTab, openProductDetail, openCategory } = navigationSlice.actions;
export default navigationSlice.reducer;
