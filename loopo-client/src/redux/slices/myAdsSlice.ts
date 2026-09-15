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
    rawStatus: (p.status || p.rawStatus || 'DRAFT').toUpperCase(),
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

/** Marks a listing sold on the backend (PATCH /products/:id/sold) first,
 * and only reflects it in local state once that succeeds - the old
 * `updateAdStatus` reducer mutated local state directly and never called
 * the API at all, so the change silently reverted on the next fetch. */
export const markAsSoldThunk = createAsyncThunk(
  'myAds/markAsSold',
  async (id: string, { rejectWithValue }) => {
    const res = await productsApi.markAsSold(id);
    if (res.success) return id;
    return rejectWithValue(res.error || 'Failed to mark listing as sold');
  }
);

/** Deletes a listing on the backend (DELETE /products/:id) first, and only
 * removes it from local state once that succeeds - see markAsSoldThunk. */
export const deleteAdThunk = createAsyncThunk(
  'myAds/deleteAdRemote',
  async (id: string, { rejectWithValue }) => {
    const res = await productsApi.deleteAd(id);
    if (res.success) return id;
    return rejectWithValue(res.error || 'Failed to delete listing');
  }
);

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
      .addCase(markAsSoldThunk.fulfilled, (state, action) => {
        const ad = state.ads.find((a) => a.id === action.payload);
        if (ad) {
          ad.status = 'Sold';
          ad.rawStatus = 'SOLD';
        }
        saveLocalAds(state.ads);
      })
      .addCase(deleteAdThunk.fulfilled, (state, action) => {
        state.ads = state.ads.filter((a) => a.id !== action.payload);
        saveLocalAds(state.ads);
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


export const { setAdsFilter, addMyAd } = myAdsSlice.actions;
export default myAdsSlice.reducer;
