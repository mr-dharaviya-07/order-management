import { useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Order } from '../types';

export function useRealtimeOrder(onUpdate: (order: Order) => void) {
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:4000', { transports: ['websocket', 'polling'] });
    socket.on('order.updated', onUpdate);
    return () => { socket.disconnect(); };
  }, [onUpdate]);
}
