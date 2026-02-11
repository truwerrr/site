import { prisma } from "./prisma";
import { Decimal } from "decimal.js";
import { placeOrder } from "./trading-engine";
import { syncKZTUSDTPrice } from "./price-sync";

// Симулятор рынка для KZT/USDT
export class MarketSimulator {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private botUsers: string[] = [];

  async initialize() {
    // Создаем ботов-пользователей если их нет
    await this.createBotUsers();
    
    // Создаем или получаем рынок KZT/USDT
    const market = await prisma.market.upsert({
      where: { base_quote: { base: "KZT", quote: "USDT" } },
      update: {},
      create: {
        base: "KZT",
        quote: "USDT",
        last: "450", // ~450 тенге за USDT
        open24h: "450",
        high24h: "455",
        low24h: "445",
        volumeBase24h: "0",
        volumeQuote24h: "0",
      },
    });

    // Даем ботанам балансы
    await this.ensureBotBalances();
  }

  private async createBotUsers() {
    const botEmails = [
      "bot_trader_1@ataix-p.kz",
      "bot_trader_2@ataix-p.kz",
      "bot_trader_3@ataix-p.kz",
      "bot_trader_4@ataix-p.kz",
      "bot_trader_5@ataix-p.kz",
    ];

    for (const email of botEmails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          passwordHash: "$2a$10$dummy", // Не используется
          role: "user",
        },
      });
      this.botUsers.push(user.id);
    }
  }

  private async ensureBotBalances() {
    for (const userId of this.botUsers) {
      // Даем каждому боту балансы
      await prisma.balance.upsert({
        where: { userId_currency: { userId, currency: "KZT" } },
        update: {},
        create: {
          userId,
          currency: "KZT",
          available: "1000000", // 1 млн тенге
          locked: "0",
        },
      });

      await prisma.balance.upsert({
        where: { userId_currency: { userId, currency: "USDT" } },
        update: {},
        create: {
          userId,
          currency: "USDT",
          available: "5000", // 5000 USDT
          locked: "0",
        },
      });
    }
  }

  async start() {
    if (this.isRunning) return;
    
    await this.initialize();
    this.isRunning = true;

    // Обновляем цену каждые 15 секунд
    this.intervalId = setInterval(async () => {
      await this.updatePrice();
    }, 15000);

    // Генерируем ордера реже (каждые 10 секунд)
    setInterval(async () => {
      if (this.isRunning) {
        await this.generateOrders();
      }
    }, 10000);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async updatePrice() {
    try {
      // Каждые 10 обновлений (1 секунда) синхронизируем с реальными биржами
      if (Math.random() > 0.9) {
        try {
          await syncKZTUSDTPrice();
        } catch (error) {
          console.error("Price sync error (non-blocking):", error);
        }
        return;
      }
      
      const market = await prisma.market.findFirst({
        where: { base: "KZT", quote: "USDT" },
      });

      if (!market) return;

      const currentPrice = new Decimal(market.last || "450");
      
      // Генерируем очень маленькое изменение цены для плавности (-0.05% до +0.05%)
      // Это создаст более реалистичное движение цены
      const changePercent = (Math.random() - 0.5) * 0.001; // -0.05% to +0.05%
      const newPrice = currentPrice.times(new Decimal(1).plus(changePercent));
      
      // Ограничиваем диапазон 440-470 тенге (расширили для большего движения)
      const minPrice = new Decimal("440");
      const maxPrice = new Decimal("470");
      const clampedPrice = Decimal.min(Decimal.max(newPrice, minPrice), maxPrice);

      // Обновляем статистику рынка
      const high24h = Decimal.max(new Decimal(market.high24h || "0"), clampedPrice);
      const low24h = market.low24h === "0" || market.low24h === null
        ? clampedPrice
        : Decimal.min(new Decimal(market.low24h), clampedPrice);

      await prisma.market.updateMany({
        where: { base: "KZT", quote: "USDT" },
        data: {
          last: clampedPrice.toString(),
          high24h: high24h.toString(),
          low24h: low24h.toString(),
        },
      });
    } catch (error) {
      console.error("Error updating price:", error);
    }
  }

  private async generateOrders() {
    try {
      const market = await prisma.market.findFirst({
        where: { base: "KZT", quote: "USDT" },
      });

      if (!market) return;

      const currentPrice = new Decimal(market.last || "450");
      
      // Случайно выбираем бота
      const botUserId = this.botUsers[Math.floor(Math.random() * this.botUsers.length)];

      // 70% шанс создать ордер
      if (Math.random() > 0.3) {
        const side = Math.random() > 0.5 ? "buy" : "sell";
        const orderType = Math.random() > 0.3 ? "limit" : "market"; // 70% limit, 30% market

        if (orderType === "limit") {
          // Limit ордер с небольшим отклонением от текущей цены
          const priceOffset = (Math.random() - 0.5) * 0.02; // ±1%
          const orderPrice = currentPrice.times(new Decimal(1).plus(priceOffset));
          
          // Количество: 100-5000 KZT или 0.2-10 USDT
          const amount = side === "buy" 
            ? (Math.random() * 4900 + 100).toFixed(2) // 100-5000 KZT
            : (Math.random() * 9.8 + 0.2).toFixed(4); // 0.2-10 USDT

          try {
            await placeOrder({
              userId: botUserId,
              pair: "KZT/USDT",
              side: side as "buy" | "sell",
              type: "limit",
              amount,
              price: orderPrice.toString(),
            });
          } catch (error) {
            // Игнорируем ошибки (недостаточно баланса и т.д.)
          }
        } else {
          // Market ордер - проверяем баланс перед размещением
          try {
            const balance = side === "buy"
              ? await prisma.balance.findFirst({
                  where: { userId: botUserId, currency: "USDT" },
                })
              : await prisma.balance.findFirst({
                  where: { userId: botUserId, currency: "KZT" },
                });

            if (balance && parseFloat(balance.available) > 0) {
              if (side === "buy") {
                // Для market buy: amount = количество KZT (base), но нужно проверить USDT баланс
                const usdtBalance = await prisma.balance.findFirst({
                  where: { userId: botUserId, currency: "USDT" },
                });
                if (usdtBalance && parseFloat(usdtBalance.available) > 1) {
                  // Максимум можем купить на доступный USDT
                  const maxKZT = (parseFloat(usdtBalance.available) / currentPrice.toNumber()) * 0.9; // 90% от доступного
                  if (maxKZT > 100) {
                    const amountKZT = (Math.random() * maxKZT * 0.5 + maxKZT * 0.1).toFixed(2);
                    await placeOrder({
                      userId: botUserId,
                      pair: "KZT/USDT",
                      side: "buy",
                      type: "market",
                      amount: amountKZT, // Количество KZT для покупки
                    });
                  }
                }
              } else {
                // Для market sell: amount = количество KZT (base currency)
                const maxKZT = Math.min(parseFloat(balance.available), 5000); // Макс 5000 KZT
                if (maxKZT > 100) {
                  const amountKZT = (Math.random() * maxKZT * 0.5 + maxKZT * 0.1).toFixed(2);
                  await placeOrder({
                    userId: botUserId,
                    pair: "KZT/USDT",
                    side: "sell",
                    type: "market",
                    amount: amountKZT, // Количество KZT для продажи
                  });
                }
              }
            }
          } catch (error) {
            // Игнорируем ошибки
          }
        }
      }

      // Иногда отменяем случайный ордер (10% шанс)
      if (Math.random() > 0.9) {
        const openOrders = await prisma.order.findMany({
          where: {
            pair: "KZT/USDT",
            status: "open",
            userId: { in: this.botUsers },
          },
          take: 10,
        });

        if (openOrders.length > 0) {
          const randomOrder = openOrders[Math.floor(Math.random() * openOrders.length)];
          try {
            const { cancelOrder } = await import("./trading-engine");
            await cancelOrder(randomOrder.id, randomOrder.userId);
          } catch (error) {
            // Игнорируем ошибки
          }
        }
      }
    } catch (error) {
      console.error("Error generating orders:", error);
    }
  }

  async getStatus() {
    return {
      isRunning: this.isRunning,
      botUsersCount: this.botUsers.length,
    };
  }
}

// Singleton instance
let simulatorInstance: MarketSimulator | null = null;

export function getMarketSimulator() {
  if (!simulatorInstance) {
    simulatorInstance = new MarketSimulator();
  }
  return simulatorInstance;
}
