import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationData {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  /** Nearby-search radius in km. Used by the search page's "Near me" filter
   * and the home page's Nearby section - previously set on the location
   * page's map slider but never actually stored anywhere, so it was lost
   * the moment you navigated away and never reached any real query. */
  radiusKm?: number;
}

const DEFAULT_LOCATION: LocationData = {
  displayName: 'Bangalore, Karnataka',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  radiusKm: 15,
};

function loadSavedLocation(): LocationData {
  if (typeof window === 'undefined') return DEFAULT_LOCATION;
  try {
    const saved = localStorage.getItem('loopo_location');
    if (saved) return { ...DEFAULT_LOCATION, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return DEFAULT_LOCATION;
}

function saveLocation(loc: LocationData) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('loopo_location', JSON.stringify(loc)); } catch { /* ignore */ }
}

export interface ReportTarget {
  targetType: 'LISTING' | 'USER' | 'CHAT_MESSAGE' | 'REVIEW';
  targetId: string;
  /** Display-only label shown in the modal ("this listing" / a seller's name / etc). */
  label: string;
}

/** The modal can only ever rate a transaction with a real, server-issued
 * RatingEligibility id - there's no "open blank and let the user pick a
 * seller" mode, since the backend would reject anything that doesn't
 * resolve to a real pending eligibility anyway. */
export interface ReviewTarget {
  eligibilityId: string;
  sellerName: string;
  productTitle: string;
  productImage?: string | null;
}

interface UiState {
  isDarkMode: boolean;
  isOfferModalOpen: boolean;
  isSellModalOpen: boolean;
  isReportModalOpen: boolean;
  reportTarget: ReportTarget | null;
  isReviewModalOpen: boolean;
  reviewTarget: ReviewTarget | null;
  isAddressModalOpen: boolean;
  isAuthModalOpen: boolean;
  offerAmount: string;
  location: string;
  locationData: LocationData;
  /** In-memory only (not persisted) - guards the Home page's silent
   * auto-detect from firing more than once per session, regardless of how
   * many times its effect re-runs or how many tabs/components mount it. */
  hasAttemptedAutoDetect: boolean;
  toastMessage: string | null;
}

const savedLoc = loadSavedLocation();

const initialState: UiState = {
  isDarkMode: false,
  isOfferModalOpen: false,
  isSellModalOpen: false,
  isReportModalOpen: false,
  reportTarget: null,
  isReviewModalOpen: false,
  reviewTarget: null,
  isAddressModalOpen: false,
  isAuthModalOpen: false,
  offerAmount: '',
  location: savedLoc.displayName,
  locationData: savedLoc,
  hasAttemptedAutoDetect: false,
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
      if (!action.payload) state.reportTarget = null;
    },
    openReportModal: (state, action: PayloadAction<ReportTarget>) => {
      state.isReportModalOpen = true;
      state.reportTarget = action.payload;
    },
    setReviewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isReviewModalOpen = action.payload;
      if (!action.payload) state.reviewTarget = null;
    },
    openReviewModal: (state, action: PayloadAction<ReviewTarget>) => {
      state.isReviewModalOpen = true;
      state.reviewTarget = action.payload;
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
    markAutoDetectAttempted: (state) => {
      state.hasAttemptedAutoDetect = true;
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
  openReportModal,
  setReviewModalOpen,
  openReviewModal,
  setAddressModalOpen,
  setAuthModalOpen,
  setLocation,
  setLocationData,
  markAutoDetectAttempted,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;

