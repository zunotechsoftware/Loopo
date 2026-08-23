import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi } from '@/services/productsApi';
import { createProductThunk } from '@/redux/slices/productsSlice';

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

function normaliseDbItem(p: any): MyAdItem {
  const images: string[] = Array.isArray(p.images)
    ? p.images.map((img: any) => (typeof img === 'string' ? img : img?.originalUrl || img?.url || ''))
    : [];

  return {
    id: p.id || p._id || `my-${Date.now()}`,
    title: p.title || 'Untitled Listing',
    price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : `${p.price || '0'}`,
    postedDate: formatDate(p.createdAt || p.postedDate),
    image:
      images[0] ||
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop',
    status: mapStatus(p.status),
  };
}

const initialState: MyAdsState = {
  ads: [
    {
      id: 'my-1',
      title: 'iPhone 15 Pro Max 256GB Natural Titanium',
      price: '₹78,000',
      postedDate: 'Posted on 20 Aug 2026',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
      status: 'Active',
    },
    {
      id: 'my-2',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      price: '₹22,000',
      postedDate: 'Posted on 15 Aug 2026',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
      status: 'Sold',
    },
  ],
  activeFilter: 'Active',
  loading: false,
};

export const fetchMyAdsThunk = createAsyncThunk('myAds/fetchMyAds', async () => {
  // First attempt user's own listings endpoint
  const res = await productsApi.getMyAds();
  if (res.success) {
    const data = res.data as any;
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];

    if (raw.length > 0) {
      return raw.map(normaliseDbItem);
    }
  }

  // Fallback to public products from DB if unauthenticated or no private ads
  const publicRes = await productsApi.getProducts();
  if (publicRes.success) {
    const data = publicRes.data as any;
    const raw: any[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];

    return raw.map(normaliseDbItem);
  }

  return [
    {
      id: 'my-1',
      title: 'iPhone 15 Pro Max 256GB Natural Titanium',
      price: '₹78,000',
      postedDate: 'Posted on 20 Aug 2026',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
      status: 'Active' as const,
    },
    {
      id: 'my-2',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      price: '₹22,000',
      postedDate: 'Posted on 15 Aug 2026',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
      status: 'Sold' as const,
    },
  ];
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
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        const p = action.payload as any;
        const newAd = normaliseDbItem(p);
        if (!state.ads.some((a) => a.id === newAd.id)) {
          state.ads.unshift(newAd);
        }
        state.activeFilter = 'Active';
      });
  },
});

export const { setAdsFilter, addMyAd, updateAdStatus, deleteAd } = myAdsSlice.actions;
export default myAdsSlice.reducer;
