import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';
import { productsApi, CreateProductPayload, UpdateProductPayload } from '@/services/productsApi';
import { interactionsApi } from '@/services/interactionsApi';

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
  /** Real total matching the last fetch's filters (from the backend's
   * paginated response) - NOT items.length, which is capped at whatever
   * page size was requested and previously went unused entirely, making
   * any "N items" display built from it wrong for any filter matching
   * more results than one page. */
  total: number;
  favorites: string[];
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
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
  // The real backend image record's field is `originalUrl` (see
  // product-media.controller.ts's attach response) - this used to only
  // check `url`/`path`, neither of which exists on a real image, so every
  // product's photos silently became empty strings here regardless of a
  // fully successful upload. myAdsSlice's own normaliser already had this
  // right; this one (used by the home feed, category browsing, search,
  // and seller profile) didn't.
  const images: string[] =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images.map((img: any) => (typeof img === 'string' ? img : img?.originalUrl || img?.thumbnailUrl || img?.url || img?.path || ''))
      : [];

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
        '',
      rating: seller.reputation?.averageRating || seller.rating || 0,
      reviewCount: seller.reputation?.totalReviews || seller.reviewCount || 0,
      memberSince: seller.createdAt
        ? new Date(seller.createdAt).getFullYear().toString()
        : '',
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
  /** @param args.categoryId - real backend category UUID, not a display name
   * @param args.limit - how many results to request (default: backend's own default of 20) */
  async (args?: { categoryId?: string; query?: string; city?: string; sellerId?: string; limit?: number }) => {
    const { categoryId, query, city, sellerId, limit } = args || {};
    const res = await productsApi.getProducts(categoryId, query, city, sellerId, limit);

    if (res.success) {
      const data = res.data as any;
      const rawItems: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      // The real total matching the filter, independent of how many items
      // this particular page actually returned.
      const total: number = typeof data?.total === 'number' ? data.total : rawItems.length;

      return { items: rawItems.map(normaliseProduct), total };
    }
    return { items: [], total: 0 };
  }
);


export const createProductThunk = createAsyncThunk(
  'products/createProduct',
  async (payload: CreateProductPayload, { rejectWithValue }) => {
    const res = await productsApi.createProduct(payload);
    // Require a real id from the backend - normaliseProduct's own
    // `p-${Date.now()}` fallback exists for safely *displaying* already-
    // fetched data, but silently accepting it here would let a malformed
    // "successful" response (e.g. a 2xx with an unexpected/empty body)
    // create a fake, client-only "listing" - the UI would still show
    // "Published successfully!" and navigate to a detail page for an id
    // that doesn't exist in the database at all, with no way to tell
    // afterward that it never actually saved.
    if (!res.success || !res.data || !(res.data as any).id) {
      return rejectWithValue(res.error || 'Server did not confirm the listing was saved. Please try again.');
    }
    return normaliseProduct(res.data);
  }
);

/** Fetches a single listing by id - used by the edit page when it isn't
 * already loaded into `products.items` (e.g. a fresh page load / direct link). */
export const fetchProductByIdThunk = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    const res = await productsApi.getProductById(id);
    if (res.success && res.data) {
      return normaliseProduct(res.data);
    }
    return rejectWithValue(res.error || 'Failed to load listing');
  }
);

/** Fetches the real favorites list (GET /favorites) and returns both the
 * favorited product ids and the full product objects, so the Favourites
 * page has real data instead of just ids with nothing to look up. */
export const fetchFavoritesThunk = createAsyncThunk('products/fetchFavorites', async () => {
  const res = await interactionsApi.getFavorites();
  if (res.success && Array.isArray(res.data)) {
    const products = res.data
      .map((row: any) => row.product || row)
      .filter(Boolean)
      .map(normaliseProduct);
    return { ids: products.map((p) => p.id), products };
  }
  return { ids: [], products: [] };
});

/** Toggling a favorite calls the real API first (POST/DELETE
 * /favorites/:productId) and only flips local state on success - unlike
 * the old synchronous `toggleFavorite` reducer, which never called the API
 * at all and silently reverted on the next fetchFavoritesThunk. */
export const toggleFavoriteThunk = createAsyncThunk(
  'products/toggleFavorite',
  async ({ productId, isFavorited }: { productId: string; isFavorited: boolean }, { rejectWithValue }) => {
    const res = isFavorited
      ? await interactionsApi.removeFavorite(productId)
      : await interactionsApi.addFavorite(productId);
    if (res.success) return { productId, isFavorited: !isFavorited };
    return rejectWithValue(res.error || 'Failed to update favorites');
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/updateProduct',
  async ({ id, payload }: { id: string; payload: UpdateProductPayload }, { rejectWithValue }) => {
    const res = await productsApi.updateProduct(id, payload);
    if (res.success && res.data) {
      return normaliseProduct(res.data);
    }
    return rejectWithValue(res.error || 'Failed to update listing');
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
        const fetchedMap = new Map<string, Product>();
        action.payload.items.forEach((item) => fetchedMap.set(item.id, item));
        state.items.forEach((existing) => {
          if (!fetchedMap.has(existing.id)) {
            fetchedMap.set(existing.id, existing);
          }
        });
        state.items = Array.from(fetchedMap.values());
        state.total = action.payload.total;
      })

      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(fetchFavoritesThunk.fulfilled, (state, action) => {
        state.favorites = action.payload.ids;
        const fetchedMap = new Map<string, Product>();
        action.payload.products.forEach((item) => fetchedMap.set(item.id, item));
        state.items.forEach((existing) => {
          if (!fetchedMap.has(existing.id)) {
            fetchedMap.set(existing.id, existing);
          }
        });
        state.items = Array.from(fetchedMap.values());
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        const { productId, isFavorited } = action.payload;
        if (isFavorited) {
          if (!state.favorites.includes(productId)) state.favorites.push(productId);
        } else {
          state.favorites = state.favorites.filter((id) => id !== productId);
        }
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
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
