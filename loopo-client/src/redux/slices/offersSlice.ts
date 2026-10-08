import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offersApi } from '@/services/offersApi';
import { logoutUser } from '@/redux/slices/authSlice';

interface OffersState {
  /** productId -> the amount of this buyer's ACCEPTED offer on it. Once a
   * seller accepts an offer, that negotiated amount - not the listing's
   * original posted price - is what this buyer actually agreed to pay, so
   * every place they see this product again (card, detail page, chat)
   * should show the same number instead of silently reverting to the
   * original price as if nothing was negotiated. */
  myAcceptedOffers: Record<string, number>;
}

const initialState: OffersState = {
  myAcceptedOffers: {},
};

export const fetchMyAcceptedOffersThunk = createAsyncThunk('offers/fetchMyAccepted', async () => {
  const res = await offersApi.getMadeOffers();
  if (!res.success || !res.data) return {};
  const map: Record<string, number> = {};
  for (const offer of res.data) {
    if (offer.status === 'ACCEPTED') {
      map[offer.productId] = offer.amount;
    }
  }
  return map;
});

export const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAcceptedOffersThunk.fulfilled, (state, action) => {
        state.myAcceptedOffers = action.payload;
      })
      .addCase(logoutUser, (state) => {
        state.myAcceptedOffers = {};
      });
  },
});

export default offersSlice.reducer;
