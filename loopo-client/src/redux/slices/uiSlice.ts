import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isDarkMode: boolean;
  isOfferModalOpen: boolean;
  isSellModalOpen: boolean;
  isReportModalOpen: boolean;
  isReviewModalOpen: boolean;
  isKycModalOpen: boolean;
  isAddressModalOpen: boolean;
  isAuthModalOpen: boolean;
  offerAmount: string;
  location: string;
  toastMessage: string | null;
}

const initialState: UiState = {
  isDarkMode: false,
  isOfferModalOpen: false,
  isSellModalOpen: false,
  isReportModalOpen: false,
  isReviewModalOpen: false,
  isKycModalOpen: false,
  isAddressModalOpen: false,
  isAuthModalOpen: false,
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
    setReportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReportModalOpen = action.payload;
    },
    setReviewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReviewModalOpen = action.payload;
    },
    setKycModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isKycModalOpen = action.payload;
    },
    setAddressModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddressModalOpen = action.payload;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
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
  setReportModalOpen,
  setReviewModalOpen,
  setKycModalOpen,
  setAddressModalOpen,
  setAuthModalOpen,
  setLocation,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
