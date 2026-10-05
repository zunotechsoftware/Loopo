import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsApi, PendingRating, CreateSellerReviewPayload } from '@/services/reviewsApi';

interface RatingsState {
  pendingRatings: PendingRating[];
  loading: boolean;
}

const initialState: RatingsState = {
  pendingRatings: [],
  loading: false,
};

export const fetchPendingRatingsThunk = createAsyncThunk('ratings/fetchPending', async () => {
  const res = await reviewsApi.getMyPendingRatings();
  return res.success && res.data ? res.data : [];
});

export const submitSellerReviewThunk = createAsyncThunk(
  'ratings/submitSellerReview',
  async (payload: CreateSellerReviewPayload, { rejectWithValue }) => {
    const res = await reviewsApi.submitSellerReview(payload);
    if (res.success) return payload.eligibilityId;
    return rejectWithValue(res.error || 'Failed to submit review');
  },
);

export const ratingsSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRatingsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingRatingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRatings = action.payload;
      })
      .addCase(fetchPendingRatingsThunk.rejected, (state) => {
        state.loading = false;
      })
      .addCase(submitSellerReviewThunk.fulfilled, (state, action) => {
        state.pendingRatings = state.pendingRatings.filter((p) => p.id !== action.payload);
      });
  },
});

export default ratingsSlice.reducer;
