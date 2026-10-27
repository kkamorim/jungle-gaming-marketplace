import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import type { NftUpdatedEvent, NFT, PaginatedResponse, Cart, Order, OrderUpdatedEvent, SocketEvent } from '../types';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { QUERY_KEYS } from '../hooks/useMarketplace';

interface SocketContextType {
  isConnected: boolean;
  socket: Socket | null;
  lastEvent: SocketEvent | null;
  triggerManualPriceChange: (nftId: string, deltaEth: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SocketEvent | null>(null);
  const appliedVersions = useRef(new Map<string, number>());

  const queryClient = useQueryClient();
  const { addToast } = useUI();
  const { session } = useAuth();

  useEffect(() => {
    const socketInstance = io('wss://api.kurio.marketplace', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    const reconcile = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      if (session?.user.id) socketInstance.emit('auth:session', { userId: session.user.id });
    };

    socketInstance.on('connect', () => {
      setIsConnected(true);
      reconcile();
    });

    socketInstance.on('reconnect', reconcile);
    socketInstance.on('disconnect', () => setIsConnected(false));

    socketInstance.on('nft.updated', (event: NftUpdatedEvent) => {
      const key = 'nft:' + event.nftId;
      if ((appliedVersions.current.get(key) ?? 0) >= event.version) return;
      appliedVersions.current.set(key, event.version);
      setLastEvent(event);

      queryClient.setQueryData<{ nft: NFT } | NFT>(QUERY_KEYS.nft(event.nftId), (oldData) => {
        if (!oldData) return oldData;
        if ('nft' in oldData) {
          return {
            ...oldData,
            nft: { ...oldData.nft, priceEth: event.priceEth, available: event.available, version: event.version },
          };
        }
        return { ...oldData, priceEth: event.priceEth, available: event.available, version: event.version };
      });

      queryClient.setQueriesData<PaginatedResponse<NFT>>({ queryKey: ['nfts'] }, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((item) => item.id === event.nftId
            ? { ...item, priceEth: event.priceEth, available: event.available, version: event.version }
            : item),
        };
      });

      queryClient.setQueryData<Cart>(QUERY_KEYS.cart, (oldCartData) => {
        if (!oldCartData) return oldCartData;
        return {
          ...oldCartData,
          items: oldCartData.items.map((item) => item.nftId === event.nftId
            ? {
                ...item,
                currentPriceEth: event.priceEth,
                priceChanged: item.unitPriceEth !== event.priceEth,
                availableQuantity: event.available,
              }
            : item),
        };
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
      addToast({
        type: 'warning',
        title: 'Atualização de preço em tempo real',
        description: 'O carrinho foi atualizado. Revise a cotação antes de continuar.',
      });
    });

    socketInstance.on('order.updated', (event: OrderUpdatedEvent) => {
      if (event.userId && event.userId !== session?.user.id) return;
      const key = 'order:' + event.orderId;
      if ((appliedVersions.current.get(key) ?? 0) >= event.version) return;
      appliedVersions.current.set(key, event.version);
      setLastEvent(event);

      queryClient.setQueryData<Order>(QUERY_KEYS.order(event.orderId), (oldOrder) => oldOrder
        ? { ...oldOrder, status: event.status, transactionHash: event.transactionHash, version: event.version }
        : oldOrder);

      queryClient.setQueryData<Order[]>(QUERY_KEYS.orders, (oldOrders) => oldOrders?.map((order) =>
        order.id === event.orderId
          ? { ...order, status: event.status, transactionHash: event.transactionHash, version: event.version }
          : order,
      ));
    });

    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [addToast, queryClient, session?.user.id]);

  const triggerManualPriceChange = (nftId: string, deltaEth: number) => {
    if (!socket) return;
    const currentPrice = 1.19;
    const newPrice = Math.max(0.05, currentPrice + deltaEth).toFixed(2);
    socket.emit('simulate:price', {
      event: 'nft.updated',
      nftId,
      priceEth: newPrice,
      available: 12,
      version: Date.now(),
      timestamp: new Date().toISOString(),
    } satisfies NftUpdatedEvent);
  };

  return (
    <SocketContext.Provider value={{ isConnected, socket, lastEvent, triggerManualPriceChange }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
}

