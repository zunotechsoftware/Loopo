import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_WALLET, Transaction } from '@/mockData/wallet';

interface WalletState {
  balance: number;
  transactions: Transaction[];
}

const initialState: WalletState = {
  balance: MOCK_WALLET.balance,
  transactions: MOCK_WALLET.transactions,
};

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
});

export const { addMoney, boostAd } = walletSlice.actions;
export default walletSlice.reducer;
