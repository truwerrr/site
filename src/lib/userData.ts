// Mock user data for demo purposes
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade' | 'exchange' | 'p2p';
  currency: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export interface Balance {
  currency: string;
  amount: number;
  available: number;
  locked: number;
  icon: string;
}

export interface Order {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  date: string;
}

export const mockBalances: Balance[] = [
  { currency: 'USDT', amount: 1250.50, available: 1250.50, locked: 0, icon: 'https://ext.same-assets.com/1411108151/3376435874.svg' },
  { currency: 'BTC', amount: 0.025, available: 0.025, locked: 0, icon: 'https://ext.same-assets.com/1411108151/2831370402.svg' },
  { currency: 'ETH', amount: 2.5, available: 2.5, locked: 0, icon: 'https://ext.same-assets.com/1411108151/1694252569.svg' },
  { currency: 'KZT', amount: 500000, available: 500000, locked: 0, icon: 'https://ext.same-assets.com/1411108151/2193445507.svg' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'deposit', currency: 'USDT', amount: 1000, status: 'completed', date: '2025-01-15T10:30:00', description: 'Пополнение через Kaspi Bank' },
  { id: '2', type: 'trade', currency: 'BTC', amount: 0.01, status: 'completed', date: '2025-01-14T15:20:00', description: 'Покупка BTC/USDT' },
  { id: '3', type: 'exchange', currency: 'ETH', amount: 1.5, status: 'completed', date: '2025-01-13T09:15:00', description: 'Обмен USDT → ETH' },
  { id: '4', type: 'withdraw', currency: 'KZT', amount: 250000, status: 'pending', date: '2025-01-12T14:45:00', description: 'Вывод на Kaspi Bank' },
  { id: '5', type: 'p2p', currency: 'USDT', amount: 250.50, status: 'completed', date: '2025-01-11T11:30:00', description: 'P2P продажа' },
];

export const mockOrders: Order[] = [
  { id: '1', pair: 'BTC/USDT', type: 'buy', price: 70184, amount: 0.01, filled: 0.01, status: 'filled', date: '2025-01-14T15:20:00' },
  { id: '2', pair: 'ETH/USDT', type: 'sell', price: 2153.43, amount: 1.0, filled: 0, status: 'open', date: '2025-01-16T10:00:00' },
];

export function getUserData() {
  return {
    username: 'admin',
    email: 'admin@ataix.kz',
    verified: true,
    kycLevel: 2,
    registrationDate: '2024-12-01',
    lastLogin: new Date().toISOString(),
    balances: mockBalances,
    transactions: mockTransactions,
    orders: mockOrders,
    totalVolume: 125000,
    totalTrades: 45,
    referralCount: 12,
    referralEarnings: 1250.50,
  };
}
