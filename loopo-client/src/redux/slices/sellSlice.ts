import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SellFormData {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  price: string;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  attributes: Record<string, string>;
  images: string[];
  primaryImageIndex: number;
  location: string;
  city: string;
  area: string;
  pincode: string;
  isNegotiable: boolean;
  interestedInExchange: boolean;
}

interface SellState {
  formData: SellFormData;
  currentStep: number;
  isSubmitting: boolean;
  publishedListingId: string | null;
}

const initialFormData: SellFormData = {
  category: 'Mobiles',
  subcategory: 'Smartphones',
  title: '',
  description: '',
  price: '',
  condition: 'Like New',
  attributes: {},
  images: [],
  primaryImageIndex: 0,
  location: 'Bangalore, Karnataka',
  city: 'Bangalore',
  area: 'Indiranagar',
  pincode: '560038',
  isNegotiable: true,
  interestedInExchange: false,
};

const initialState: SellState = {
  formData: initialFormData,
  currentStep: 1,
  isSubmitting: false,
  publishedListingId: null,
};

export const sellSlice = createSlice({
  name: 'sell',
  initialState,
  reducers: {
    updateSellForm: (state, action: PayloadAction<Partial<SellFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setSellStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setSellImages: (state, action: PayloadAction<string[]>) => {
      state.formData.images = action.payload;
    },
    addSellImage: (state, action: PayloadAction<string>) => {
      state.formData.images.push(action.payload);
    },
    removeSellImage: (state, action: PayloadAction<number>) => {
      state.formData.images = state.formData.images.filter((_, idx) => idx !== action.payload);
      if (state.formData.primaryImageIndex >= state.formData.images.length) {
        state.formData.primaryImageIndex = 0;
      }
    },
    setPrimaryImage: (state, action: PayloadAction<number>) => {
      state.formData.primaryImageIndex = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setPublishedListingId: (state, action: PayloadAction<string | null>) => {
      state.publishedListingId = action.payload;
    },
    resetSellForm: (state) => {
      state.formData = initialFormData;
      state.currentStep = 1;
      state.isSubmitting = false;
      state.publishedListingId = null;
    },
  },
});

export const {
  updateSellForm,
  setSellStep,
  setSellImages,
  addSellImage,
  removeSellImage,
  setPrimaryImage,
  setSubmitting,
  setPublishedListingId,
  resetSellForm,
} = sellSlice.actions;

export default sellSlice.reducer;
