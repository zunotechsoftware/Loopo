export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  date: string;
  amount: number;
}

export const MOCK_WALLET = {
  balance: 4250.0,
  currency: '₹',
  transactions: [
    { id: 't1', type: 'credit', title: 'Money added', date: '10 May 2024', amount: 2000 },
    { id: 't2', type: 'debit', title: 'Ad Boost', date: '08 May 2024', amount: 150 },
    { id: 't3', type: 'debit', title: 'Withdrawal', date: '05 May 2024', amount: 1000 },
  ] as Transaction[],
};
