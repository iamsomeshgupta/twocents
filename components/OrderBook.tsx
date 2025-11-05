'use client';

import { useEffect, useMemo, memo } from 'react';
import { useBinanceSocket } from '@/hooks/useBinanceSocket';
import { useOrderBookStore } from '@/store/orderBookStore';
import type { OrderBookLevel } from '@/types/binance';

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAmount = (amount: number): string => {
  if (amount >= 1) {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return amount.toFixed(8);
};

interface OrderBookRowProps {
  level: OrderBookLevel;
  maxTotal: number;
  isBid: boolean;
}

const OrderBookRow = memo(({ level, maxTotal, isBid }: OrderBookRowProps) => {
  const barWidth = (level.total / maxTotal) * 100;

  return (
    <div className="relative flex items-center justify-between py-1 px-4 text-sm">
      <div
        className={`absolute inset-0 ${isBid ? 'bg-bid/20' : 'bg-ask/20'}`}
        style={{ width: `${barWidth}%`, marginLeft: isBid ? 'auto' : '0', marginRight: isBid ? '0' : 'auto' }}
      />
      
      <div className="relative z-10 flex w-full justify-between">
        <span className={`w-1/3 text-right ${isBid ? 'text-bid' : 'text-ask'}`}>
          {formatPrice(level.price)}
        </span>
        <span className="w-1/3 text-right text-gray-300">
          {formatAmount(level.amount)}
        </span>
        <span className="w-1/3 text-right text-gray-400">
          {formatAmount(level.total)}
        </span>
      </div>
    </div>
  );
});

OrderBookRow.displayName = 'OrderBookRow';

export default function OrderBook() {
  const { orderBookUpdates, isConnected, error } = useBinanceSocket();
  const { orderBook, updateOrderBook } = useOrderBookStore();

  useEffect(() => {
    if (orderBookUpdates) {
      updateOrderBook(orderBookUpdates);
    }
  }, [orderBookUpdates, updateOrderBook]);

  const { processedBids, processedAsks, spread } = useMemo(() => {
    const bidsArray: OrderBookLevel[] = Array.from(orderBook.bids.values())
      .sort((a, b) => b.price - a.price)
      .map((level, index, arr) => {
        const previousTotal = index > 0 ? arr[index - 1].total : 0;
        return {
          ...level,
          total: previousTotal + level.amount,
        };
      });

    const asksArray: OrderBookLevel[] = Array.from(orderBook.asks.values())
      .sort((a, b) => a.price - b.price)
      .map((level, index, arr) => {
        const previousTotal = index > 0 ? arr[index - 1].total : 0;
        return {
          ...level,
          total: previousTotal + level.amount,
        };
      });

    const highestBid = bidsArray[0]?.price || 0;
    const lowestAsk = asksArray[0]?.price || 0;
    const spread = lowestAsk > 0 && highestBid > 0 ? lowestAsk - highestBid : 0;

    const maxBidTotal = bidsArray.length > 0 ? Math.max(...bidsArray.map((b) => b.total)) : 1;
    const maxAskTotal = asksArray.length > 0 ? Math.max(...asksArray.map((a) => a.total)) : 1;

    return {
      processedBids: bidsArray.map((b) => ({ ...b, maxTotal: maxBidTotal })),
      processedAsks: asksArray.map((a) => ({ ...a, maxTotal: maxAskTotal })),
      spread,
    };
  }, [orderBook]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="flex border-b border-gray-800">
        <div className="w-1/2 border-r border-gray-800">
          <div className="flex justify-between px-4 py-2 text-xs font-semibold text-gray-500">
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
        </div>
        <div className="w-1/2">
          <div className="flex justify-between px-4 py-2 text-xs font-semibold text-gray-500">
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>
        </div>
      </div>

      <div className="relative flex h-[600px] overflow-hidden border-b border-gray-800">
        <div className="flex-1 border-r border-gray-800 h-full overflow-y-auto orderbook-scroll">
          {processedBids.length > 0 ? (
            processedBids.map((level) => (
              <OrderBookRow
                key={level.price}
                level={level}
                maxTotal={level.maxTotal}
                isBid={true}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              No bids data
            </div>
          )}
        </div>

        <div className="w-32 border-r border-gray-800" />

        <div className="flex-1 h-full overflow-y-auto orderbook-scroll">
          {processedAsks.length > 0 ? (
            processedAsks.map((level) => (
              <OrderBookRow
                key={level.price}
                level={level}
                maxTotal={level.maxTotal}
                isBid={false}
              />
            ))
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              No asks data
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="w-32 flex flex-col items-center justify-center px-2">
            <span className="text-xs text-gray-500">Spread</span>
            <span className="text-base font-semibold text-white">{formatPrice(spread)}</span>
            {spread > 0 && (
              <span className="text-[10px] text-gray-400">
                ({((spread / (processedAsks[0]?.price || 1)) * 100).toFixed(4)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

