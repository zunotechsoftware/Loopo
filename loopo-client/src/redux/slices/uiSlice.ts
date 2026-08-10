import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDarkMode: boolean;
  isOfferModalOpen: boolean;
  isSellModalOpen: boolean;
  offerAmount: string;
  location: string;
  toastMessage: string | null;
}

const initialState: UiState = {
  isDarkMode: false,
  isOfferModalOpen: false,
  isSellModalOpen: false,
  offerAmount: '',
  location: 'Bangalore, Karnataka',
  toastMessage: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setOfferModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isOfferModalOpen = action.payload;
    },
    setSellModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSellModalOpen = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    showToast: (state, action: PayloadAction<string>) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  toggleDarkMode,
  setOfferModalOpen,
  setSellModalOpen,
  setLocation,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
