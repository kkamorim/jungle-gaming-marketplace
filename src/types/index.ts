// â”€â”€â”€ User & Session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// â”€â”€â”€ Wallet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'phantom';
export type NetworkType = 'ethereum' | 'polygon' | 'solana';

export interface Wallet {
  id: string;
  userId: string;
  label: string;
  address: string;
  network: NetworkType;
  type: WalletType;
  isPrimary: boolean;
  ensName?: string;
  indexCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletPayload {
  label: string;
  address: string;
  network: NetworkType;
  type: WalletType;
  isPrimary: boolean;
  ensName?: string;
  indexCode?: string;
}

export interface UpdateWalletPayload extends Partial<CreateWalletPayload> {
  id: string;
}

// â”€â”€â”€ NFT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type NFTCategory =
  | 'arte-digital'
  | 'fotografia'
  | 'musica'
  | 'arte-3d'
  | 'colecionaveis'
  | 'geometrico'
  | 'jogos'
  | 'aventureiro'
  | 'utilidade';

export interface NFTEdition {
  id: string;
  name: string;
  /** e.g. "1/50" */
  label: string;
  totalSupply: number;
  available: number;
}

export interface NFTCreator {
  id: string;
  displayName: string;
  avatarUrl: string;
  verified: boolean;
}

export interface NFTAttribute {
  traitType: string;
  value: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  /** Price in ETH represented as a decimal string for precision */
  priceEth: string;
  collection: string;
  collectionSlug: string;
  creator: NFTCreator;
  category: NFTCategory;
  editions: NFTEdition[];
  attributes: NFTAttribute[];
  totalSupply: number;
  available: number;
  favorites: number;
  rating: number;
  ratingsCount: number;
  /** Contract address (simulated) */
  contractAddress: string;
  tokenId: string;
  /** ISO-8601 */
  createdAt: string;
  updatedAt: string;
  /** Version for optimistic concurrency / event ordering */
  version: number;
}

// â”€â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Favorite {
  userId: string;
  nftId: string;
  createdAt: string;
}

// â”€â”€â”€ Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CartItem {
  nftId: string;
  editionId: string;
  quantity: number;
  /** Snapshot of the price at the time of addition (ETH string) */
  unitPriceEth: string;
  /** Current live price from the API (ETH string) */
  currentPriceEth: string;
  /** Whether the price changed since the item was added */
  priceChanged: boolean;
  /** Max available at time of last check */
  availableQuantity: number;
}

export interface Cart {
  userId: string | null;
  items: CartItem[];
  couponCode: string | null;
  updatedAt: string;
}

// â”€â”€â”€ Coupon â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Coupon {
  code: string;
  /** Discount percentage (0â€“100) */
  discountPercent: number;
  /** Fixed discount in ETH (string) */
  discountEth: string;
  type: 'percent' | 'fixed';
  active: boolean;
  expiresAt: string;
}

// â”€â”€â”€ Quote / Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface QuoteLineItem {
  nftId: string;
  editionId: string;
  quantity: number;
  unitPriceEth: string;
  totalPriceEth: string;
}

export interface Quote {
  items: QuoteLineItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  couponCode: string | null;
  /** ISO-8601 â€” quote is valid until this time */
  validUntil: string;
  version: number;
}

// â”€â”€â”€ Order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OrderStatus = 'pending' | 'confirmed' | 'declined' | 'expired';

export interface OrderItem {
  nftId: string;
  nftName: string;
  nftImageUrl: string;
  editionId: string;
  editionLabel: string;
  quantity: number;
  unitPriceEth: string;
  totalPriceEth: string;
}

export interface Order {
  id: string;
  userId: string;
  /** Client-generated key to prevent duplicate submissions */
  idempotencyKey: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  couponCode: string | null;
  walletId: string;
  network: NetworkType;
  /** Simulated blockchain transaction hash */
  transactionHash: string | null;
  /** Simulated block explorer URL */
  explorerUrl: string | null;
  createdAt: string;
  updatedAt: string;
  /** Snapshot version â€” immutable after creation */
  version: number;
  requestFingerprint?: string;
}

// â”€â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// â”€â”€â”€ API Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// â”€â”€â”€ Socket.IO Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface NftUpdatedEvent {
  event: 'nft.updated';
  nftId: string;
  priceEth: string;
  available: number;
  version: number;
  timestamp: string;
}

export interface OrderUpdatedEvent {
  event: 'order.updated';
  orderId: string;
  status: OrderStatus;
  transactionHash: string | null;
  version: number;
  timestamp: string;
  userId?: string;
}

export type SocketEvent = NftUpdatedEvent | OrderUpdatedEvent;

// â”€â”€â”€ NFT Filters (query params) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SortField = 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'rating' | 'name';

export interface NFTFilters {
  search?: string;
  category?: NFTCategory;
  collection?: string;
  network?: NetworkType;
  minPrice?: string;
  maxPrice?: string;
  sort?: SortField;
  page?: number;
  perPage?: number;
}


