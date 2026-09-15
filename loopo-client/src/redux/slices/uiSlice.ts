import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationData {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

function loadSavedLocation(): LocationData {
  if (typeof window === 'undefined') return { displayName: 'Bangalore, Karnataka', city: 'Bangalore', state: 'Karnataka', country: 'India' };
  try {
    const saved = localStorage.getItem('loopo_location');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { displayName: 'Bangalore, Karnataka', city: 'Bangalore', state: 'Karnataka', country: 'India' };
}

function saveLocation(loc: LocationData) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('loopo_location', JSON.stringify(loc)); } catch { /* ignore */ }
}

interface UiState {
  isDarkMode: boolean;
  isOfferModalOpen: boolean;
  isSellModalOpen: boolean;
  isReportModalOpen: boolean;
  isReviewModalOpen: boolean;
  isAddressModalOpen: boolean;
  isAuthModalOpen: boolean;
  offerAmount: string;
  location: string;
  locationData: LocationData;
  toastMessage: string | null;
}

const savedLoc = loadSavedLocation();

const initialState: UiState = {
  isDarkMode: false,
  isOfferModalOpen: false,
  isSellModalOpen: false,
  isReportModalOpen: false,
  isReviewModalOpen: false,
  isAddressModalOpen: false,
  isAuthModalOpen: false,
  offerAmount: '',
  location: savedLoc.displayName,
  locationData: savedLoc,
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
    setAddressModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddressModalOpen = action.payload;
    },
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
      // Also update locationData displayName + parse city
      const parts = action.payload.split(',').map(s => s.trim());
      state.locationData.displayName = action.payload;
      if (parts[0]) state.locationData.city = parts[0];
      if (parts[1]) state.locationData.state = parts[1];
      saveLocation(state.locationData);
    },
    setLocationData: (state, action: PayloadAction<LocationData>) => {
      state.locationData = action.payload;
      state.location = action.payload.displayName;
      saveLocation(action.payload);
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
  setAddressModalOpen,
  setAuthModalOpen,
  setLocation,
  setLocationData,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;

