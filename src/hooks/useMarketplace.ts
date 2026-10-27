import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type {
  NFT,
  NFTFilters,
  PaginatedResponse,
  Cart,
  Quote,
  Order,
  Wallet,
  CreateWalletPayload,
  UpdateWalletPayload,
  NFTCategory,
} from '../types';

export const QUERY_KEYS = {
  nfts: (filters?: NFTFilters) => ['nfts', filters] as const,
  nft: (id: string) => ['nft', id] as const,
  categories: ['categories'] as const,
  collections: ['collections'] as const,
  favorites: ['favorites'] as const,
  cart: ['cart'] as const,
  quote: ['quote'] as const,
  wallets: ['wallets'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
};

// â”€â”€â”€ NFTs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useNFTs(filters: NFTFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.nfts(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.collection) params.set('collection', filters.collection);
      if (filters.network) params.set('network', filters.network);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.perPage) params.set('perPage', String(filters.perPage));

      const res = await api.get<PaginatedResponse<NFT>>(`/nfts?${params.toString()}`);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useNFT(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.nft(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('NFT ID required');
      const res = await api.get<any>(`/nfts/${id}`);
      return (res.data?.nft ?? res.data) as NFT;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const res = await api.get<any>('/categories');
      return (res.data?.categories ?? res.data) as { category: NFTCategory; count: number }[];
    },
    staleTime: 60_000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: QUERY_KEYS.collections,
    queryFn: async () => {
      const res = await api.get<any>('/collections');
      return (res.data?.collections ?? res.data) as { name: string; slug: string; count: number }[];
    },
    staleTime: 60_000,
  });
}

// â”€â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useFavorites() {
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  return useQuery({
    queryKey: QUERY_KEYS.favorites,
    queryFn: async () => {
      const res = await api.get<any>('/favorites');
      return (res.data?.favorites ?? res.data) as NFT[];
    },
    enabled: hasToken,
    staleTime: 10_000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nftId,
      isFavorited,
    }: {
      nftId: string;
      isFavorited: boolean;
      nft?: NFT;
    }) => {
      if (isFavorited) {
        await api.delete(`/favorites/${nftId}`);
        return { nftId, isFavorited: false };
      } else {
        await api.post(`/favorites/${nftId}`);
        return { nftId, isFavorited: true };
      }
    },
    onMutate: async ({ nftId, isFavorited, nft }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites });
      const previous = queryClient.getQueryData<any[]>(QUERY_KEYS.favorites) || [];

      const updated = isFavorited
        ? previous.filter((item) => (typeof item === 'string' ? item !== nftId : item?.id !== nftId))
        : [...previous, nft || (typeof previous[0] === 'string' ? nftId : { id: nftId })];

      queryClient.setQueryData(QUERY_KEYS.favorites, updated);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEYS.favorites, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
    },
  });
}

// â”€â”€â”€ Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useCart() {
  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: async () => {
      const res = await api.get<any>('/cart');
      return (res.data?.cart ?? res.data) as Cart;
    },
    staleTime: 5_000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nftId,
      editionId,
      quantity = 1,
    }: {
      nftId: string;
      editionId?: string;
      quantity?: number;
    }) => {
      const res = await api.post<any>('/cart/items', {
        nftId,
        editionId,
        quantity,
      });
      return (res.data?.cart ?? res.data) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, updatedCart);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nftId,
      editionId,
      quantity,
    }: {
      nftId: string;
      editionId: string;
      quantity: number;
    }) => {
      const res = await api.patch<any>('/cart/items', {
        nftId,
        editionId,
        quantity,
      });
      return (res.data?.cart ?? res.data) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, updatedCart);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nftId, editionId }: { nftId: string; editionId: string }) => {
      const res = await api.delete<any>(`/cart/items/${nftId}/${editionId}`);
      return (res.data?.cart ?? res.data) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, updatedCart);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post<any>('/cart/coupon', { code });
      return (res.data?.cart ?? res.data) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, updatedCart);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<any>('/cart/coupon');
      return (res.data?.cart ?? res.data) as Cart;
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(QUERY_KEYS.cart, updatedCart);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
    },
  });
}

// â”€â”€â”€ Quote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useQuote() {
  return useQuery({
    queryKey: QUERY_KEYS.quote,
    queryFn: async () => {
      const res = await api.post<any>('/quote');
      return (res.data?.quote ?? res.data) as Quote;
    },
    staleTime: 5_000,
  });
}

// â”€â”€â”€ Wallets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useWallets() {
  return useQuery({
    queryKey: QUERY_KEYS.wallets,
    queryFn: async () => {
      const res = await api.get<any>('/wallets');
      return (res.data?.wallets ?? res.data) as Wallet[];
    },
    staleTime: 30_000,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWalletPayload) => {
      const res = await api.post<any>('/wallets', payload);
      return (res.data?.wallet ?? res.data) as Wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateWalletPayload) => {
      const res = await api.patch<any>(`/wallets/${id}`, payload);
      return (res.data?.wallet ?? res.data) as Wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets });
    },
  });
}

// â”€â”€â”€ Checkout & Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CreateOrderPayload {
  walletId: string;
  idempotencyKey: string;
  quoteVersion?: number;
  network?: string;
  paymentScenario?: 'confirmed' | 'declined' | 'timeout';
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const res = await api.post<any>('/orders', payload);
      return (res.data?.order ?? res.data) as Order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quote });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: ['nfts'] });
      return order;
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Order ID required');
      const res = await api.get<Order>('/orders/' + id);
      return (res.data as { order?: Order }).order ?? res.data;
    },
    enabled: Boolean(id),
    refetchInterval: id ? 1000 : false,
  });
}
export function useOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async () => {
      const res = await api.get<any>('/orders');
      return (res.data?.orders ?? res.data) as Order[];
    },
    staleTime: 10_000,
  });
}

