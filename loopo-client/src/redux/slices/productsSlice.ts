import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_PRODUCTS, Product } from '@/mockData/products';
import { productsApi, CreateProductPayload } from '@/services/productsApi';

interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  nearbyOnly: boolean;
}

interface ProductsState {
  items: Product[];
  favorites: string[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  // Start empty — HomeView dispatches fetchProductsThunk on mount
  items: [],
  favorites: [],
  filters: {
    searchQuery: '',
    category: 'All Categories',
    minPrice: 0,
    maxPrice: 500000,
    condition: 'All Condition',
    nearbyOnly: false,
  },
  loading: false,
  error: null,
};

/** Normalise a backend product into the frontend Product shape */
function normaliseProduct(p: any): Product {
  const images: string[] =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images.map((img: any) => (typeof img === 'string' ? img : img?.url || img?.path || ''))
      : [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
        ];

  const seller = p.seller || p.user || {};

  return {
    id: p.id || p._id || `p-${Date.now()}`,
    title: p.title || 'Untitled',
    price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
    location:
      typeof p.location === 'string'
        ? p.location
        : p.location?.city || p.location?.state || 'India',
    postedDate: p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recently',
    category: p.category?.name || p.category || 'General',
    condition: p.condition || 'Used',
    images,
    seller: {
      id: seller.id || seller._id || 's-1',
      name: seller.firstName
        ? `${seller.firstName} ${seller.lastName || ''}`.trim()
        : seller.name || 'Seller',
      avatar:
        seller.profile?.avatarUrl ||
        seller.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      rating: seller.reputation?.averageRating || seller.rating || 4.5,
      reviewCount: seller.reputation?.totalReviews || seller.reviewCount || 0,
      memberSince: seller.createdAt
        ? new Date(seller.createdAt).getFullYear().toString()
        : '2024',
      isVerified: seller.isEmailVerified || seller.isKycVerified || false,
    },
    description: p.description || '',
    specs: p.specs || p.attributes || {},
    viewsCount: p.viewCount || p.viewsCount || 0,
    distance: p.distance || '',
    likesCount: p.favoriteCount || p.likesCount || 0,
  };
}

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchProducts',
  async ({ category, query }: { category?: string; query?: string } = {}) => {
    const res = await productsApi.getProducts(category, query);

    if (res.success) {
      const data = res.data as any;
      // Backend may return { items: [], total: n } or a flat array
      const rawItems: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      if (rawItems.length > 0) {
        return rawItems.map(normaliseProduct);
      }
    }
    // Fallback to mock data when backend is cold-starting or empty
    return MOCK_PRODUCTS;
  }
);

export const createProductThunk = createAsyncThunk(
  'products/createProduct',
  async (payload: CreateProductPayload) => {
    const res = await productsApi.createProduct(payload);
    if (res.success && res.data) {
      return normaliseProduct(res.data);
    }
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      title: payload.title,
      price: payload.price,
      location: payload.location,
      postedDate: 'Just now',
      category: payload.category,
      condition: (payload.condition as any) || 'Like New',
      images:
        payload.images.length > 0
          ? payload.images
          : [
              'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
            ],
      seller: {
        id: 's-user',
        name: 'You',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating: 5.0,
        reviewCount: 0,
        memberSince: new Date().getFullYear().toString(),
        isVerified: false,
      },
      description: payload.description,
      specs: payload.specs || { Condition: payload.condition, Category: payload.category },
      viewsCount: 0,
      distance: '',
      likesCount: 0,
    };
    return newProduct;
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((favId) => favId !== id);
      } else {
        state.favorites.push(id);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
    },
    setConditionFilter: (state, action: PayloadAction<string>) => {
      state.filters.condition = action.payload;
    },
    setNearbyOnly: (state, action: PayloadAction<boolean>) => {
      state.filters.nearbyOnly = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchProductsThunk.rejected, (state) => {
        state.loading = false;
        // Keep existing items (or mock fallback) on error
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const {
  toggleFavorite,
  setSearchQuery,
  setCategoryFilter,
  setPriceRange,
  setConditionFilter,
  setNearbyOnly,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
