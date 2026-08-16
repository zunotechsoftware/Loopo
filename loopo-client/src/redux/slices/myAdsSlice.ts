import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi } from '@/services/productsApi';

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
  loading: boolean;
}

const initialState: MyAdsState = {
  ads: [],
  activeFilter: 'Active',
  loading: false,
};

/** Map backend status to frontend status label */
function mapStatus(s: string): 'Active' | 'Sold' | 'Inactive' {
  const upper = (s || '').toUpperCase();
  if (upper === 'ACTIVE' || upper === 'PUBLISHED') return 'Active';
  if (upper === 'SOLD') return 'Sold';
  return 'Inactive'; // DRAFT, PENDING, PAUSED, ARCHIVED
}

export const fetchMyAdsThunk = createAsyncThunk('myAds/fetchMyAds', async () => {
  const res = await productsApi.getMyAds();
  if (res.success) {
    const data = res.data as any;
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];

    return raw.map((p: any): MyAdItem => {
      const images: string[] = Array.isArray(p.images)
        ? p.images.map((img: any) => (typeof img === 'string' ? img : img?.url || ''))
        : [];

      return {
        id: p.id || p._id || `my-${Date.now()}`,
        title: p.title || 'Untitled',
        price: `₹${(p.price || 0).toLocaleString('en-IN')}`,
        postedDate: p.createdAt
          ? `Posted on ${new Date(p.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}`
          : 'Recently',
        image:
          images[0] ||
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop',
        status: mapStatus(p.status),
      };
    });
  }
  return [];
});

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAdsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAdsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchMyAdsThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setAdsFilter, updateAdStatus, deleteAd } = myAdsSlice.actions;
export default myAdsSlice.reducer;
