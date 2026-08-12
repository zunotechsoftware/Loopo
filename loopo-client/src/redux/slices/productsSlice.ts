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
  items: MOCK_PRODUCTS,
  favorites: ['p1', 'p3'],
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

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchProducts',
  async ({ category, query }: { category?: string; query?: string } = {}) => {
    const res = await productsApi.getProducts(category, query);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_PRODUCTS;
  }
);

export const createProductThunk = createAsyncThunk(
  'products/createProduct',
  async (payload: CreateProductPayload) => {
    const res = await productsApi.createProduct(payload);
    if (res.success && res.data) {
      return res.data;
    }
    const newProduct: Product = {
      id: `p-${Date.now()}`,
      title: payload.title,
      price: payload.price,
      location: payload.location,
      postedDate: 'Just now',
      category: payload.category,
      condition: (payload.condition as any) || 'Like New',
      images: payload.images.length > 0 ? payload.images : ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop'],
      seller: {
        id: 's-user',
        name: 'Venkatesh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating: 4.9,
        reviewCount: 48,
        memberSince: '2022',
        isVerified: true,
      },
      description: payload.description,
      specs: payload.specs || { Condition: payload.condition, Category: payload.category },
      viewsCount: 1,
      distance: '2.5 km',
      likesCount: 1,
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
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchProductsThunk.rejected, (state) => {
        state.loading = false;
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
