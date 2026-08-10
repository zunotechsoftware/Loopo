import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MyAdItem {
  id: string;
  title: string;
  price: string;
  postedDate: string;
  image: string;
  status: 'Active' | 'Sold' | 'Inactive';
}

interface MyAdsState {
  ads: MyAdItem[];
  activeFilter: 'Active' | 'Sold' | 'Inactive';
}

const initialState: MyAdsState = {
  ads: [
    {
      id: 'my-1',
      title: 'iPhone 13 128GB',
      price: '₹32,000',
      postedDate: 'Posted on 10 May 2024',
      image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
      status: 'Active',
    },
    {
      id: 'my-2',
      title: 'Royal Enfield Classic 350',
      price: '₹1,35,000',
      postedDate: 'Posted on 05 May 2024',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
      status: 'Active',
    },
    {
      id: 'my-3',
      title: 'L Shape Sofa Set',
      price: '₹18,000',
      postedDate: 'Posted on 06 Apr 2024',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
      status: 'Inactive',
    },
  ],
  activeFilter: 'Active',
};

export const myAdsSlice = createSlice({
  name: 'myAds',
  initialState,
  reducers: {
    setAdsFilter: (state, action: PayloadAction<'Active' | 'Sold' | 'Inactive'>) => {
      state.activeFilter = action.payload;
    },
    updateAdStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'Active' | 'Sold' | 'Inactive' }>
    ) => {
      const ad = state.ads.find((a) => a.id === action.payload.id);
      if (ad) {
        ad.status = action.payload.status;
      }
    },
    deleteAd: (state, action: PayloadAction<string>) => {
      state.ads = state.ads.filter((a) => a.id !== action.payload);
    },
  },
});

export const { setAdsFilter, updateAdStatus, deleteAd } = myAdsSlice.actions;
export default myAdsSlice.reducer;
