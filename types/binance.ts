export interface TradeEvent {
  e: string;
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  b: number;
  a: number;
  T: number;
  m: boolean;
  M: boolean;
}

export interface OrderBookDeltaEvent {
  e: string;
  E: number;
  s: string;
  U: number;
  u: number;
  b: string[][];
  a: string[][];
}

export interface ParsedTrade {
  price: number;
  amount: number;
  time: number;
  direction: 'buy' | 'sell';
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  bids: Map<number, OrderBookLevel>;
  asks: Map<number, OrderBookLevel>;
}




