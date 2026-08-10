import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_PRODUCTS, Product } from '@/mockData/products';

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
  favorites: string[]; // Product IDs
  filters: FilterState;
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
};

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
