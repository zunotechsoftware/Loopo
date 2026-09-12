import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '@/types';
import { walletApi } from '@/services/walletApi';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  loading: false,
};

export const fetchWalletThunk = createAsyncThunk('wallet/fetchWallet', async () => {
  const res = await walletApi.getBalance();
  if (res.success && res.data) {
    return res.data;
  }
  return { balance: 0, transactions: [] };
});

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    addMoney: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
      state.transactions.unshift({
        id: `t-${Date.now()}`,
        type: 'credit',
        title: 'Money added',
        date: 'Today',
        amount: action.payload,
      });
      walletApi.addFunds(action.payload).catch(() => {});
    },
    boostAd: (state, action: PayloadAction<{ adTitle: string; cost: number }>) => {
      state.balance -= action.payload.cost;
      state.transactions.unshift({
        id: `t-${Date.now()}`,
        type: 'debit',
        title: `Ad Boost (${action.payload.adTitle})`,
        date: 'Today',
        amount: action.payload.cost,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance ?? 0;
        const data = action.payload as any;
        if (Array.isArray(data.transactions)) {
          state.transactions = data.transactions.map((t: any) => ({
            id: t.id || t._id || `t-${Date.now()}`,
            type: t.type === 'CREDIT' || t.type === 'credit' ? 'credit' : 'debit',
            title: t.description || t.title || 'Transaction',
            date: t.createdAt
              ? new Date(t.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recently',
            amount: t.amount || 0,
          }));
        }
      })
      .addCase(fetchWalletThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { addMoney, boostAd } = walletSlice.actions;
export default walletSlice.reducer;

