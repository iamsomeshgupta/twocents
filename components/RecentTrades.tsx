'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { useBinanceSocket } from '@/hooks/useBinanceSocket';
import type { ParsedTrade } from '@/types/binance';

const formatPrice = (price: number): string => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  });
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

interface TradeRowProps {
  trade: ParsedTrade;
  flashClass: string;
}

const TradeRow = memo(({ trade, flashClass }: TradeRowProps) => {
  return (
    <div
      className={`flex items-center justify-between border-b border-gray-800 px-4 py-2 text-sm transition-colors ${flashClass}`}
    >
      <span
        className={`w-1/4 ${
          trade.direction === 'buy' ? 'text-bid' : 'text-ask'
        }`}
      >
        {formatPrice(trade.price)}
      </span>
      <span className="w-1/4 text-right text-gray-300">
        {formatAmount(trade.amount)}
      </span>
      <span className="w-1/4 text-right text-gray-400">
        {formatTime(trade.time)}
      </span>
      <span
        className={`w-1/4 text-right text-xs font-semibold ${
          trade.direction === 'buy' ? 'text-bid' : 'text-ask'
        }`}
      >
        {trade.direction.toUpperCase()}
      </span>
    </div>
  );
});

TradeRow.displayName = 'TradeRow';

export default function RecentTrades() {
  const { trades } = useBinanceSocket();
  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const previousTradesLengthRef = useRef(0);

  useEffect(() => {
    if (trades.length > previousTradesLengthRef.current && trades.length > 0) {
      setFlashIndex(0);
      const timeout = setTimeout(() => {
        setFlashIndex(null);
      }, 500);

      return () => clearTimeout(timeout);
    }
    previousTradesLengthRef.current = trades.length;
  }, [trades]);

  return (
    <div className="w-full">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">Recent Trades</h2>
        <p className="text-xs text-gray-500">Last 50 trades</p>
      </div>

      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2 text-xs font-semibold text-gray-500">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
        <span>Direction</span>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {trades.length > 0 ? (
          trades.map((trade, index) => {
            const isNew = flashIndex === index;
            const flashClass =
              isNew && trade.direction === 'buy'
                ? 'flash-green'
                : isNew && trade.direction === 'sell'
                ? 'flash-red'
                : '';

            return (
              <TradeRow key={`${trade.time}-${index}`} trade={trade} flashClass={flashClass} />
            );
          })
        ) : (
          <div className="flex h-32 items-center justify-center text-gray-600">
            No trades data
          </div>
        )}
      </div>
    </div>
  );
}

