'use client';

import OrderBook from '@/components/OrderBook';
import RecentTrades from '@/components/RecentTrades';

export default function Home() {
  return (
    <main className="min-h-screen bg-black p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Real-Time Order Book Visualizer
          </h1>
          <p className="mt-2 text-gray-400">
            Live Binance BTC/USDT order book and trades
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <OrderBook />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50">
              <RecentTrades />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}




