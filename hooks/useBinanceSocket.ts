import { useEffect, useRef, useState, useCallback } from 'react';
import type { TradeEvent, OrderBookDeltaEvent, ParsedTrade } from '@/types/binance';

interface UseBinanceSocketReturn {
  trades: ParsedTrade[];
  orderBookUpdates: OrderBookDeltaEvent | null;
  isConnected: boolean;
  error: string | null;
}

const BINANCE_WS_BASE = 'wss://stream.binance.com';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useBinanceSocket(symbol: string = 'btcusdt'): UseBinanceSocketReturn {
  const [trades, setTrades] = useState<ParsedTrade[]>([]);
  const [orderBookUpdates, setOrderBookUpdates] = useState<OrderBookDeltaEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);

  const parseTrade = useCallback((event: TradeEvent): ParsedTrade => {
    const direction: 'buy' | 'sell' = event.m ? 'sell' : 'buy';

    return {
      price: parseFloat(event.p),
      amount: parseFloat(event.q),
      time: event.T,
      direction,
    };
  }, []);

  const connect = useCallback(() => {
    try {
      const lowerSymbol = symbol.toLowerCase();
      const tradeStream = `${lowerSymbol}@trade`;
      const orderBookStream = `${lowerSymbol}@depth@100ms`;
      const wsUrl = `${BINANCE_WS_BASE}/stream?streams=${tradeStream}/${orderBookStream}`;

      console.log('Connecting to Binance WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Binance');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        isClosingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.stream && message.data) {
            const streamName = message.stream;
            const data = message.data;
            if (streamName.includes('@trade') && data.e === 'trade') {
              const parsedTrade = parseTrade(data as TradeEvent);
              setTrades((prev) => {
                const updated = [parsedTrade, ...prev].slice(0, 50);
                return updated;
              });
            }
            if (streamName.includes('@depth') && data.e === 'depthUpdate') {
              setOrderBookUpdates(data as OrderBookDeltaEvent);
            }
          }
          else if (message.e) {
            if (message.e === 'trade') {
              const parsedTrade = parseTrade(message as TradeEvent);
              setTrades((prev) => {
                const updated = [parsedTrade, ...prev].slice(0, 50);
                return updated;
              });
            }
            if (message.e === 'depthUpdate') {
              setOrderBookUpdates(message as OrderBookDeltaEvent);
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse message');
        }
      };

      ws.onerror = (err) => {
        if (!isClosingRef.current && ws.readyState !== WebSocket.CLOSED) {
          console.warn('WebSocket error:', err);
          if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
            setError('WebSocket connection error');
            setIsConnected(false);
          }
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        if (!isClosingRef.current) {
          console.log('WebSocket disconnected', event.code, event.reason || '');
        }
        if (
          !isClosingRef.current &&
          event.code !== 1000 &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
      setIsConnected(false);
    }
  }, [symbol, parseTrade]);

  useEffect(() => {
    connect();

    return () => {
      isClosingRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        const ws = wsRef.current;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Component unmounting');
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    trades,
    orderBookUpdates,
    isConnected,
    error,
  };
}

