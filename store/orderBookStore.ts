import { create } from 'zustand';
import type { OrderBookDeltaEvent, OrderBookLevel, OrderBook } from '@/types/binance';

interface OrderBookStore {
  orderBook: OrderBook;
  updateOrderBook: (delta: OrderBookDeltaEvent) => void;
  reset: () => void;
}

const createInitialOrderBook = (): OrderBook => ({
  bids: new Map<number, OrderBookLevel>(),
  asks: new Map<number, OrderBookLevel>(),
});

export const useOrderBookStore = create<OrderBookStore>((set) => ({
  orderBook: createInitialOrderBook(),

  updateOrderBook: (delta: OrderBookDeltaEvent) => {
    set((state) => {
      const newOrderBook: OrderBook = {
        bids: new Map(state.orderBook.bids),
        asks: new Map(state.orderBook.asks),
      };

      delta.b.forEach(([priceStr, quantityStr]) => {
        const price = parseFloat(priceStr);
        const quantity = parseFloat(quantityStr);

        if (quantity === 0) {
          newOrderBook.bids.delete(price);
        } else {
          newOrderBook.bids.set(price, {
            price,
            amount: quantity,
            total: 0,
          });
        }
      });

      delta.a.forEach(([priceStr, quantityStr]) => {
        const price = parseFloat(priceStr);
        const quantity = parseFloat(quantityStr);

        if (quantity === 0) {
          newOrderBook.asks.delete(price);
        } else {
          newOrderBook.asks.set(price, {
            price,
            amount: quantity,
            total: 0,
          });
        }
      });

      return { orderBook: newOrderBook };
    });
  },

  reset: () => {
    set({ orderBook: createInitialOrderBook() });
  },
}));




