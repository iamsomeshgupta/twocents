# Real-Time Order Book Visualizer

A high-performance, real-time stock order book visualizer built with Next.js, TypeScript, and Tailwind CSS. This application connects to the live Binance WebSocket API to stream real-time market data for BTC/USDT trading pairs.

## Features

- **Real-Time Order Book**: Displays live bid and ask orders with depth visualization
- **Recent Trades Feed**: Shows the 50 most recent trades with flash highlighting
- **WebSocket Integration**: Robust connection to Binance API with automatic reconnection
- **High Performance**: Optimized with React memoization and efficient state updates
- **Professional UI**: Clean, modern interface with financial data visualization

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Project

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

For production build:
```bash
npm run build
npm start
```

## Design Choices & Trade-offs

### State Management: Zustand
I chose Zustand over React Context or useReducer for the following reasons:
- **Performance**: Zustand provides better performance for high-frequency updates with minimal re-renders
- **Simplicity**: Less boilerplate than Context + useReducer while still being lightweight
- **Efficiency**: The order book receives frequent delta updates, and Zustand's selective subscriptions prevent unnecessary re-renders
- **TypeScript Support**: Excellent TypeScript integration out of the box

### WebSocket Implementation
- **Custom Hook**: Created `useBinanceSocket` to encapsulate WebSocket logic and provide clean API to components
- **Reconnection Strategy**: Implements exponential backoff with max retry limits to handle connection issues gracefully
- **Data Parsing**: Handles both aggregate trades and order book delta events from Binance WebSocket streams

### Order Book Aggregation
- **Map Data Structure**: Used JavaScript Maps for O(1) price level lookups and updates, critical for handling high-frequency deltas
- **Cumulative Totals**: Calculated during rendering using `useMemo` to avoid recalculating on every render
- **Delta Processing**: Correctly handles removal of price levels when amount is 0, as per Binance API specification

### Performance Optimizations
- **React.memo**: Applied to row components to prevent unnecessary re-renders
- **useMemo**: Used for sorting and cumulative total calculations
- **Batched Updates**: Zustand batches state updates automatically
- **Minimal Re-renders**: Order book only re-renders when actual data changes

### Depth Visualization
- Background bars represent cumulative totals relative to the largest total in each side
- Provides visual depth chart effect while maintaining clean data presentation
- Color-coded: green for bids, red for asks

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── OrderBook.tsx        # Order book visualization component
│   └── RecentTrades.tsx     # Recent trades list component
├── hooks/
│   └── useBinanceSocket.ts  # WebSocket hook for Binance API
├── store/
│   └── orderBookStore.ts    # Zustand store for order book state
└── types/
    └── binance.ts           # TypeScript type definitions
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **WebSocket**: Native WebSocket API

## Binance WebSocket API

The application connects to two Binance WebSocket streams:
- `btcusdt@trade`: Aggregate trade events for completed trades
- `btcusdt@depth20@100ms`: Order book depth updates (20 levels, 100ms frequency)

## Notes

- The application defaults to BTC/USDT trading pair
- Trades are limited to the 50 most recent for performance
- Order book maintains full depth based on delta updates
- Connection status is displayed in the order book header
- Flash animations indicate new trades (green for buys, red for sells)




