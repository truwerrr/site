export type PaymentRequisite = {
  method: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  comment?: string;
};

export type FakeP2PAd = {
  id: string;
  userId: string;
  side: "buy" | "sell";
  currency: string;
  priceKZT: string;
  available: string;
  limitMin: string;
  limitMax: string;
  paymentMethods: string;
  paymentRequisites?: PaymentRequisite[];
  rating: number;
  trades: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: { email: string };
};

function req(method: string, accountName: string, accountNumber: string, bankName?: string, comment?: string): PaymentRequisite {
  return { method, accountName, accountNumber, bankName: bankName ?? method, comment };
}

const NICKNAMES = [
  "arman_cryp1", "ardakp2p", "ne_tvoya_obmennica", "crypto_almaty", "btc_kz", "usdt_seller_kz",
  "eth_trader", "p2p_kaspi", "tengri_crypto", "almaty_swap", "astana_p2p", "kz_crypto_pro",
  "steady_trader", "fast_exchange_kz", "safe_deal",
];

function demoRequisites(methods: string[], botIndex: number): PaymentRequisite[] {
  const names = ["Иван П.", "Мария К.", "Алексей Т.", "Дарья С.", "Сергей В.", "Елена Н.", "Андрей М.", "Ольга Л.", "Дмитрий К.", "Наталья Р.", "Михаил С.", "Анна Б.", "Павел Г.", "Юлия Д.", "Игорь Ф."];
  const name = names[botIndex % names.length];
  return methods.map((m, i) => req(m, name, `KZ**${String(botIndex + 1).padStart(2, "0")}**${String(i + 1).padStart(4, "0")}`, m, "В комментарии укажите номер заказа"));
}

const FAKE_ADS_RAW: Omit<FakeP2PAd, "paymentRequisites">[] = [
  { id: "bot-1", userId: "bot", side: "buy", currency: "USDT", priceKZT: "505", available: "5000", limitMin: "50000", limitMax: "5000000", paymentMethods: JSON.stringify(["Kaspi Bank", "Halyk Bank"]), rating: 98, trades: 320, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[0]}@gmail.com` } },
  { id: "bot-2", userId: "bot", side: "buy", currency: "USDT", priceKZT: "506", available: "3000", limitMin: "10000", limitMax: "2000000", paymentMethods: JSON.stringify(["Kaspi Bank"]), rating: 99, trades: 180, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[1]}@gmail.com` } },
  { id: "bot-3", userId: "bot", side: "sell", currency: "USDT", priceKZT: "507", available: "10000", limitMin: "50000", limitMax: "10000000", paymentMethods: JSON.stringify(["Kaspi Bank", "Тинькофф"]), rating: 97, trades: 540, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[2]}@gmail.com` } },
  { id: "bot-4", userId: "bot", side: "sell", currency: "USDT", priceKZT: "504", available: "2500", limitMin: "20000", limitMax: "3000000", paymentMethods: JSON.stringify(["Home Credit Bank", "Kaspi Bank"]), rating: 96, trades: 120, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[3]}@gmail.com` } },
  { id: "bot-5", userId: "bot", side: "buy", currency: "BTC", priceKZT: "32600000", available: "0.5", limitMin: "100000", limitMax: "15000000", paymentMethods: JSON.stringify(["Kaspi Bank", "Halyk Bank", "Сбербанк"]), rating: 99, trades: 89, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[4]}@gmail.com` } },
  { id: "bot-6", userId: "bot", side: "buy", currency: "BTC", priceKZT: "32550000", available: "0.3", limitMin: "50000", limitMax: "10000000", paymentMethods: JSON.stringify(["Kaspi Bank"]), rating: 98, trades: 210, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[5]}@gmail.com` } },
  { id: "bot-7", userId: "bot", side: "sell", currency: "BTC", priceKZT: "32650000", available: "0.2", limitMin: "200000", limitMax: "6000000", paymentMethods: JSON.stringify(["Тинькофф", "Kaspi Bank"]), rating: 97, trades: 156, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[6]}@gmail.com` } },
  { id: "bot-8", userId: "bot", side: "sell", currency: "BTC", priceKZT: "32700000", available: "0.4", limitMin: "100000", limitMax: "12000000", paymentMethods: JSON.stringify(["Halyk Bank"]), rating: 95, trades: 72, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[7]}@gmail.com` } },
  { id: "bot-9", userId: "bot", side: "buy", currency: "ETH", priceKZT: "1085000", available: "5", limitMin: "50000", limitMax: "5000000", paymentMethods: JSON.stringify(["Kaspi Bank", "Home Credit Bank"]), rating: 98, trades: 340, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[8]}@gmail.com` } },
  { id: "bot-10", userId: "bot", side: "buy", currency: "ETH", priceKZT: "1088000", available: "3", limitMin: "10000", limitMax: "3000000", paymentMethods: JSON.stringify(["Kaspi Bank"]), rating: 99, trades: 95, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[9]}@gmail.com` } },
  { id: "bot-11", userId: "bot", side: "sell", currency: "ETH", priceKZT: "1082000", available: "8", limitMin: "100000", limitMax: "8000000", paymentMethods: JSON.stringify(["Тинькофф", "Halyk Bank"]), rating: 96, trades: 420, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[10]}@gmail.com` } },
  { id: "bot-12", userId: "bot", side: "sell", currency: "ETH", priceKZT: "1086000", available: "2", limitMin: "50000", limitMax: "2000000", paymentMethods: JSON.stringify(["Сбербанк", "Kaspi Bank"]), rating: 97, trades: 188, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[11]}@gmail.com` } },
  { id: "bot-13", userId: "bot", side: "buy", currency: "USDT", priceKZT: "503", available: "8000", limitMin: "30000", limitMax: "7000000", paymentMethods: JSON.stringify(["Наличные", "Kaspi Bank"]), rating: 94, trades: 65, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[12]}@gmail.com` } },
  { id: "bot-14", userId: "bot", side: "sell", currency: "BTC", priceKZT: "32580000", available: "0.15", limitMin: "150000", limitMax: "5000000", paymentMethods: JSON.stringify(["Kaspi Bank"]), rating: 98, trades: 44, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[13]}@gmail.com` } },
  { id: "bot-15", userId: "bot", side: "buy", currency: "ETH", priceKZT: "1090000", available: "1.5", limitMin: "80000", limitMax: "1500000", paymentMethods: JSON.stringify(["Home Credit Bank"]), rating: 95, trades: 112, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), user: { email: `${NICKNAMES[14]}@gmail.com` } },
];

export const FAKE_P2P_ADS: FakeP2PAd[] = FAKE_ADS_RAW.map((ad, i) => ({
  ...ad,
  paymentRequisites: demoRequisites(JSON.parse(ad.paymentMethods) as string[], i),
}));

export const FAKE_BOT_IDS = new Set(FAKE_P2P_ADS.map((a) => a.id));

export function getFakeAdById(id: string): FakeP2PAd | null {
  return FAKE_P2P_ADS.find((a) => a.id === id) ?? null;
}

/** Последние 4 символа логина скрыты звёздочками, домен всегда gmail.com */
export function maskEmailForDisplay(email: string | undefined): string {
  if (!email || !email.includes("@")) return "***@gmail.com";
  const local = email.split("@")[0];
  if (local.length <= 4) return "***@gmail.com";
  return local.slice(0, -4) + "****@gmail.com";
}
