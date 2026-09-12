import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MyAdItem } from '@/types';
import { productsApi } from '@/services/productsApi';
import { createProductThunk } from '@/redux/slices/productsSlice';

interface MyAdsState {
  ads: MyAdItem[];
  activeFilter: 'Active' | 'Sold' | 'Inactive';
  loading: boolean;
}

function formatDate(d?: string | Date): string {
  if (!d) {
    return `Posted on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) {
    return typeof d === 'string' && d.startsWith('Posted') ? d : `Posted ${d}`;
  }
  return `Posted on ${dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

/** Map backend status enum/string to frontend status label */
function mapStatus(s: string): 'Active' | 'Sold' | 'Inactive' {
  const upper = (s || '').toUpperCase();
  if (
    upper === 'ACTIVE' ||
    upper === 'PUBLISHED' ||
    upper === 'APPROVED' ||
    upper === 'PENDING_APPROVAL' ||
    upper === 'DRAFT' ||
    upper === 'PENDING'
  ) {
    return 'Active';
  }
  if (upper === 'SOLD') return 'Sold';
  return 'Inactive';
}

function loadLocalAds(): MyAdItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('loopo_my_ads');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalAds(ads: MyAdItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('loopo_my_ads', JSON.stringify(ads));
  } catch {
    // ignore quota error
  }
}

function normaliseDbItem(p: any): MyAdItem {
  let mainImage = p.image || p.imageUrl || '';
  if (!mainImage && Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    mainImage = typeof first === 'string' ? first : first?.originalUrl || first?.url || '';
  }
  if (!mainImage) {
    mainImage = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop';
  }

  const priceVal = typeof p.price === 'number'
    ? `₹${p.price.toLocaleString('en-IN')}`
    : typeof p.price === 'string' && p.price.startsWith('₹')
    ? p.price
    : `₹${p.price || '0'}`;

  return {
    id: p.id || p._id || `my-${Date.now()}`,
    title: p.title || 'Untitled Listing',
    price: priceVal,
    postedDate: formatDate(p.createdAt || p.postedDate),
    image: mainImage,
    status: mapStatus(p.status || 'Active'),
  };
}

const initialState: MyAdsState = {
  ads: loadLocalAds(),
  activeFilter: 'Active',
  loading: false,
};

export const fetchMyAdsThunk = createAsyncThunk('myAds/fetchMyAds', async () => {
  const res = await productsApi.getMyAds();
  if (res.success) {
    const data = res.data as any;
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];

    return raw.map(normaliseDbItem);
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
    addMyAd: (state, action: PayloadAction<MyAdItem>) => {
      state.ads.unshift(action.payload);
      state.activeFilter = 'Active';
      saveLocalAds(state.ads);
    },
    updateAdStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'Active' | 'Sold' | 'Inactive' }>
    ) => {
      const ad = state.ads.find((a) => a.id === action.payload.id);
      if (ad) {
        ad.status = action.payload.status;
      }
      saveLocalAds(state.ads);
    },
    deleteAd: (state, action: PayloadAction<string>) => {
      state.ads = state.ads.filter((a) => a.id !== action.payload);
      saveLocalAds(state.ads);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAdsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAdsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          const map = new Map<string, MyAdItem>();
          // Put existing state ads first (so newly published ads stay)
          state.ads.forEach((ad) => map.set(ad.id, ad));
          // Overlay fetched ads from API
          action.payload.forEach((ad) => map.set(ad.id, ad));
          state.ads = Array.from(map.values());
        }
        saveLocalAds(state.ads);
      })
      .addCase(fetchMyAdsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        const p = action.payload as any;
        const newAd = normaliseDbItem(p);
        const existingIdx = state.ads.findIndex((a) => a.id === newAd.id);
        if (existingIdx >= 0) {
          state.ads[existingIdx] = newAd;
        } else {
          state.ads.unshift(newAd);
        }
        state.activeFilter = 'Active';
        saveLocalAds(state.ads);
      });
  },
});


export const { setAdsFilter, addMyAd, updateAdStatus, deleteAd } = myAdsSlice.actions;
export default myAdsSlice.reducer;
