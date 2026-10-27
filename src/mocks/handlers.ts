import { http, HttpResponse, delay } from 'msw';
import type {
  NFT,
  NFTFilters,
  PaginatedResponse,
  ApiError,
  Cart,
  Order,
  OrderStatus,
  Favorite,
  Wallet,
  UserSession,
  Quote,
  QuoteLineItem,
} from '../types';
import {
  USERS,
  NFTS,
  COUPONS,
  WALLETS,
  NETWORK_FEE_ETH,
} from './fixtures';
import { broadcastNftUpdate, broadcastOrderUpdate } from './socket';

// â”€â”€â”€ In-memory state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let nfts: NFT[] = structuredClone(NFTS);
let sessions: Map<string, UserSession> = new Map();
let favorites: Favorite[] = [];
let carts: Map<string, Cart> = new Map();
let orders: Order[] = [];
let wallets: Wallet[] = structuredClone(WALLETS);
let registeredUsers = structuredClone(USERS);
const latestQuotes = new Map<string, Quote>();
const MOCK_STORAGE_KEY = 'kurio:mock-state:v3';

// Clear previous storage keys so stale cached NFT data is discarded immediately
if (typeof window !== 'undefined') {
  localStorage.removeItem('kurio:mock-state:v1');
  localStorage.removeItem('kurio:mock-state:v2');
  localStorage.removeItem('kurio:mock-state');
}

function persistMockState() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify({
    nfts,
    sessions: Array.from(sessions.entries()),
    favorites,
    carts: Array.from(carts.entries()),
    orders,
    wallets,
  }));
}

function hydrateMockState() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return;
    const snapshot = JSON.parse(raw) as {
      nfts?: NFT[];
      sessions?: [string, UserSession][];
      favorites?: Favorite[];
      carts?: [string, Cart][];
      orders?: Order[];
      wallets?: Wallet[];
    };
    if (snapshot.nfts) {
      nfts = snapshot.nfts.map((nft) => {
        if (nft.id === 'nft-003' || nft.name.includes('Fox Course Seller')) {
          return {
            ...nft,
            name: 'Fox Sunglasses Boss #552',
            description:
              'Raposa executiva em blazer escuro ajustando seus óculos de sol com elegância. Relógio dourado no pulso e lenço no bolso. O CEO da selva cripto.',
            imageUrl: '/nfts/fox-sunglasses.png',
          };
        }
        return nft;
      });
    }
    if (snapshot.sessions) sessions = new Map(snapshot.sessions);
    if (snapshot.favorites) favorites = snapshot.favorites;
    if (snapshot.carts) carts = new Map(snapshot.carts);
    if (snapshot.orders) orders = snapshot.orders;
    if (snapshot.wallets) wallets = snapshot.wallets;
  } catch {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }
}

hydrateMockState();
if (typeof window !== 'undefined') {
  window.setInterval(persistMockState, 500);
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const LATENCY_MS = { min: 200, max: 600 };

function randomDelay() {
  const ms = Math.floor(
    Math.random() * (LATENCY_MS.max - LATENCY_MS.min) + LATENCY_MS.min
  );
  return delay(ms);
}

function getSessionFromRequest(request: Request): UserSession | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const session = sessions.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function unauthorizedResponse() {
  return HttpResponse.json<ApiError>(
    { code: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada.' },
    { status: 401 }
  );
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Safe ETH arithmetic using integer micro-ETH (6 decimals). */
function ethToMicro(eth: string): number {
  const [whole = '0', frac = ''] = eth.split('.');
  const padded = (frac + '000000').slice(0, 6);
  return parseInt(whole, 10) * 1_000_000 + parseInt(padded, 10);
}

function microToEth(micro: number): string {
  const sign = micro < 0 ? '-' : '';
  const abs = Math.abs(micro);
  const whole = Math.floor(abs / 1_000_000);
  const frac = String(abs % 1_000_000).padStart(6, '0').replace(/0+$/, '');
  return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

// â”€â”€â”€ Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function resetMockState() {
  nfts = structuredClone(NFTS);
  sessions = new Map();
  favorites = [];
  carts = new Map();
  orders = [];
  wallets = structuredClone(WALLETS);
  registeredUsers = structuredClone(USERS);
  latestQuotes.clear();
  if (typeof window !== 'undefined') localStorage.removeItem(MOCK_STORAGE_KEY);
}

// â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const handlers = [
  // â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** POST /api/register */
  http.post('/api/register', async ({ request }) => {
    await randomDelay();

    const body = (await request.json()) as {
      email: string;
      password: string;
      displayName: string;
      username: string;
    };

    if (!body.email || !body.password || !body.displayName || !body.username) {
      return HttpResponse.json<ApiError>(
        {
          code: 'VALIDATION_ERROR',
          message: 'Todos os campos são obrigatórios.',
          details: {
            ...(!body.email && { email: ['E-mail é obrigatório.'] }),
            ...(!body.password && { password: ['Senha é obrigatória.'] }),
            ...(!body.displayName && { displayName: ['Nome é obrigatório.'] }),
            ...(!body.username && { username: ['Usuário é obrigatório.'] }),
          },
        },
        { status: 422 }
      );
    }

    if (registeredUsers.some((u) => u.email === body.email)) {
      return HttpResponse.json<ApiError>(
        { code: 'CONFLICT', message: 'Este e-mail já está cadastrado.' },
        { status: 409 }
      );
    }

    if (registeredUsers.some((u) => u.username === body.username)) {
      return HttpResponse.json<ApiError>(
        { code: 'CONFLICT', message: 'Este nome de usuário já está em uso.' },
        { status: 409 }
      );
    }

    const newUser = {
      id: generateId('user'),
      email: body.email,
      password: body.password,
      displayName: body.displayName,
      username: body.username,
      avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${body.username}&backgroundColor=f5a623`,
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);

    const token = generateToken();
    const session: UserSession = {
      user: { ...newUser, password: undefined } as any,
      token,
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    };
    // Clean password from user object
    const { password: _, ...userWithoutPassword } = newUser;
    session.user = userWithoutPassword;
    sessions.set(token, session);

    return HttpResponse.json(session, { status: 201 });
  }),

  /** POST /api/login */
  http.post('/api/login', async ({ request }) => {
    await randomDelay();

    const body = (await request.json()) as { email: string; password: string };

    const user = registeredUsers.find(
      (u) => u.email === body.email && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json<ApiError>(
        { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    const token = generateToken();
    const { password: _, ...userWithoutPassword } = user;
    const session: UserSession = {
      user: userWithoutPassword,
      token,
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    };
    sessions.set(token, session);

    return HttpResponse.json(session);
  }),

  /** GET /api/session */
  http.get('/api/session', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();
    return HttpResponse.json(session);
  }),

  /** POST /api/logout */
  http.post('/api/logout', async ({ request }) => {
    await randomDelay();
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessions.delete(authHeader.slice(7));
    }
    return HttpResponse.json({ success: true });
  }),

  // â”€â”€â”€ Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** GET /api/profile */
  http.get('/api/profile', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();
    return HttpResponse.json(session.user);
  }),

  /** PATCH /api/profile */
  http.patch('/api/profile', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as Record<string, string>;
    const user = registeredUsers.find((u) => u.id === session.user.id);
    if (!user) return unauthorizedResponse();

    if (body.displayName) user.displayName = body.displayName;
    if (body.username) {
      if (registeredUsers.some((u) => u.username === body.username && u.id !== user.id)) {
        return HttpResponse.json<ApiError>(
          { code: 'CONFLICT', message: 'Nome de usuário já em uso.' },
          { status: 409 }
        );
      }
      user.username = body.username;
    }
    if (body.bio !== undefined) user.bio = body.bio;
    if (body.avatarUrl) user.avatarUrl = body.avatarUrl;
    user.updatedAt = new Date().toISOString();

    const { password: _, ...userWithoutPassword } = user;
    session.user = userWithoutPassword;

    return HttpResponse.json(userWithoutPassword);
  }),

  /** POST /api/profile/password */
  http.post('/api/profile/password', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };

    const user = registeredUsers.find((u) => u.id === session.user.id);
    if (!user) return unauthorizedResponse();

    if (user.password !== body.currentPassword) {
      return HttpResponse.json<ApiError>(
        {
          code: 'VALIDATION_ERROR',
          message: 'Senha atual incorreta.',
          details: { currentPassword: ['Senha atual não confere.'] },
        },
        { status: 422 }
      );
    }

    if (body.newPassword !== body.confirmPassword) {
      return HttpResponse.json<ApiError>(
        {
          code: 'VALIDATION_ERROR',
          message: 'As senhas não coincidem.',
          details: { confirmPassword: ['Nova senha e confirmação não coincidem.'] },
        },
        { status: 422 }
      );
    }

    if (body.newPassword.length < 6) {
      return HttpResponse.json<ApiError>(
        {
          code: 'VALIDATION_ERROR',
          message: 'A senha deve ter no mínimo 6 caracteres.',
          details: { newPassword: ['Mínimo 6 caracteres.'] },
        },
        { status: 422 }
      );
    }

    user.password = body.newPassword;
    user.updatedAt = new Date().toISOString();

    return HttpResponse.json({ success: true });
  }),

  // â”€â”€â”€ Wallets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** GET /api/wallets */
  http.get('/api/wallets', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();
    const userWallets = wallets.filter((w) => w.userId === session.user.id);
    return HttpResponse.json(userWallets);
  }),

  /** POST /api/wallets */
  http.post('/api/wallets', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as any;
    const wallet: Wallet = {
      id: generateId('wallet'),
      userId: session.user.id,
      label: body.label,
      address: body.address,
      network: body.network,
      type: body.type,
      isPrimary: body.isPrimary ?? false,
      ensName: body.ensName,
      indexCode: body.indexCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (wallet.isPrimary) {
      wallets
        .filter((w) => w.userId === session.user.id)
        .forEach((w) => (w.isPrimary = false));
    }

    wallets.push(wallet);
    return HttpResponse.json(wallet, { status: 201 });
  }),

  /** PATCH /api/wallets/:id */
  http.patch('/api/wallets/:id', async ({ request, params }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const wallet = wallets.find(
      (w) => w.id === params.id && w.userId === session.user.id
    );
    if (!wallet) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Carteira não encontrada.' },
        { status: 404 }
      );
    }

    const body = (await request.json()) as Partial<Wallet>;
    if (body.label) wallet.label = body.label;
    if (body.address) wallet.address = body.address;
    if (body.network) wallet.network = body.network;
    if (body.type) wallet.type = body.type;
    if (body.ensName !== undefined) wallet.ensName = body.ensName;
    if (body.indexCode !== undefined) wallet.indexCode = body.indexCode;
    if (body.isPrimary) {
      wallets
        .filter((w) => w.userId === session.user.id)
        .forEach((w) => (w.isPrimary = false));
      wallet.isPrimary = true;
    }
    wallet.updatedAt = new Date().toISOString();

    return HttpResponse.json(wallet);
  }),

  // â”€â”€â”€ NFTs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** GET /api/nfts */
  http.get('/api/nfts', async ({ request }) => {
    await randomDelay();

    const url = new URL(request.url);
    const filters: NFTFilters = {
      search: url.searchParams.get('search') ?? undefined,
      category: (url.searchParams.get('category') as any) ?? undefined,
      collection: url.searchParams.get('collection') ?? undefined,
      minPrice: url.searchParams.get('minPrice') ?? undefined,
      maxPrice: url.searchParams.get('maxPrice') ?? undefined,
      sort: (url.searchParams.get('sort') as any) ?? 'newest',
      page: parseInt(url.searchParams.get('page') ?? '1', 10),
      perPage: parseInt(url.searchParams.get('perPage') ?? '8', 10),
    };

    let results = [...nfts];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (nft) =>
          nft.name.toLowerCase().includes(q) ||
          nft.description.toLowerCase().includes(q) ||
          nft.collection.toLowerCase().includes(q) ||
          nft.creator.displayName.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category) {
      results = results.filter((nft) => nft.category === filters.category);
    }

    // Collection
    if (filters.collection) {
      results = results.filter((nft) => nft.collectionSlug === filters.collection);
    }

    // Price range
    if (filters.minPrice) {
      const minMicro = ethToMicro(filters.minPrice);
      results = results.filter((nft) => ethToMicro(nft.priceEth) >= minMicro);
    }
    if (filters.maxPrice) {
      const maxMicro = ethToMicro(filters.maxPrice);
      results = results.filter((nft) => ethToMicro(nft.priceEth) <= maxMicro);
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':
        results.sort((a, b) => ethToMicro(a.priceEth) - ethToMicro(b.priceEth));
        break;
      case 'price_desc':
        results.sort((a, b) => ethToMicro(b.priceEth) - ethToMicro(a.priceEth));
        break;
      case 'newest':
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        results.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    // Paginate
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 8;
    const total = results.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const data = results.slice(start, start + perPage);

    return HttpResponse.json<PaginatedResponse<NFT>>({
      data,
      pagination: { page, perPage, total, totalPages },
    });
  }),

  /** GET /api/nfts/:id */
  http.get('/api/nfts/:id', async ({ params }) => {
    await randomDelay();

    const nft = nfts.find((n) => n.id === params.id);
    if (!nft) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'NFT não encontrado.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(nft);
  }),

  // â”€â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** GET /api/favorites */
  http.get('/api/favorites', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const userFavs = favorites.filter((f) => f.userId === session.user.id);
    const favNfts = userFavs
      .map((f) => nfts.find((n) => n.id === f.nftId))
      .filter(Boolean);

    return HttpResponse.json(favNfts);
  }),

  /** POST /api/favorites/:nftId */
  http.post('/api/favorites/:nftId', async ({ request, params }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const nftId = params.nftId as string;
    if (!nfts.find((n) => n.id === nftId)) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'NFT não encontrado.' },
        { status: 404 }
      );
    }

    const exists = favorites.find(
      (f) => f.userId === session.user.id && f.nftId === nftId
    );
    if (!exists) {
      favorites.push({
        userId: session.user.id,
        nftId,
        createdAt: new Date().toISOString(),
      });
      const nft = nfts.find((n) => n.id === nftId);
      if (nft) nft.favorites += 1;
    }

    return HttpResponse.json({ success: true }, { status: 201 });
  }),

  /** DELETE /api/favorites/:nftId */
  http.delete('/api/favorites/:nftId', async ({ request, params }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const nftId = params.nftId as string;
    const idx = favorites.findIndex(
      (f) => f.userId === session.user.id && f.nftId === nftId
    );
    if (idx !== -1) {
      favorites.splice(idx, 1);
      const nft = nfts.find((n) => n.id === nftId);
      if (nft) nft.favorites = Math.max(0, nft.favorites - 1);
    }

    return HttpResponse.json({ success: true });
  }),

  // â”€â”€â”€ Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** GET /api/cart */
  http.get('/api/cart', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    let cart = carts.get(userId);
    if (!cart) {
      cart = {
        userId: session?.user.id ?? null,
        items: [],
        couponCode: null,
        updatedAt: new Date().toISOString(),
      };
      carts.set(userId, cart);
    }

    // Refresh current prices and availability
    for (const item of cart.items) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (nft) {
        const prevPrice = item.currentPriceEth;
        item.currentPriceEth = nft.priceEth;
        item.priceChanged = prevPrice !== nft.priceEth || item.unitPriceEth !== nft.priceEth;
        const edition = nft.editions.find((e) => e.id === item.editionId);
        item.availableQuantity = edition?.available ?? 0;
      }
    }

    return HttpResponse.json(cart);
  }),

  /** POST /api/cart/items */
  http.post('/api/cart/items', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const body = (await request.json()) as {
      nftId: string;
      editionId: string;
      quantity: number;
    };

    const nft = nfts.find((n) => n.id === body.nftId);
    if (!nft) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'NFT não encontrado.' },
        { status: 404 }
      );
    }

    const edition = nft.editions.find((e) => e.id === body.editionId);
    if (!edition) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Edição não encontrada.' },
        { status: 404 }
      );
    }

    if (body.quantity > edition.available) {
      return HttpResponse.json<ApiError>(
        {
          code: 'INSUFFICIENT_STOCK',
          message: `Apenas ${edition.available} unidades disponíveis.`,
        },
        { status: 409 }
      );
    }

    let cart = carts.get(userId);
    if (!cart) {
      cart = {
        userId: session?.user.id ?? null,
        items: [],
        couponCode: null,
        updatedAt: new Date().toISOString(),
      };
      carts.set(userId, cart);
    }

    const existing = cart.items.find(
      (i) => i.nftId === body.nftId && i.editionId === body.editionId
    );
    if (existing) {
      const newQty = existing.quantity + body.quantity;
      if (newQty > edition.available) {
        return HttpResponse.json<ApiError>(
          {
            code: 'INSUFFICIENT_STOCK',
            message: `Limite de ${edition.available} unidades.`,
          },
          { status: 409 }
        );
      }
      existing.quantity = newQty;
      existing.currentPriceEth = nft.priceEth;
      existing.priceChanged = existing.unitPriceEth !== nft.priceEth;
    } else {
      cart.items.push({
        nftId: body.nftId,
        editionId: body.editionId,
        quantity: body.quantity,
        unitPriceEth: nft.priceEth,
        currentPriceEth: nft.priceEth,
        priceChanged: false,
        availableQuantity: edition.available,
      });
    }

    cart.updatedAt = new Date().toISOString();
    return HttpResponse.json(cart, { status: 201 });
  }),

  /** PATCH /api/cart/items */
  http.patch('/api/cart/items', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const body = (await request.json()) as {
      nftId: string;
      editionId: string;
      quantity: number;
    };

    const cart = carts.get(userId);
    if (!cart) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Carrinho não encontrado.' },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (i) => i.nftId === body.nftId && i.editionId === body.editionId
    );
    if (!item) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Item não encontrado no carrinho.' },
        { status: 404 }
      );
    }

    const nft = nfts.find((n) => n.id === body.nftId);
    const edition = nft?.editions.find((e) => e.id === body.editionId);
    if (edition && body.quantity > edition.available) {
      return HttpResponse.json<ApiError>(
        {
          code: 'INSUFFICIENT_STOCK',
          message: `Apenas ${edition.available} unidades disponíveis.`,
        },
        { status: 409 }
      );
    }

    if (body.quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.nftId === body.nftId && i.editionId === body.editionId)
      );
    } else {
      item.quantity = body.quantity;
      if (nft) {
        item.currentPriceEth = nft.priceEth;
        item.priceChanged = item.unitPriceEth !== nft.priceEth;
      }
    }

    cart.updatedAt = new Date().toISOString();
    return HttpResponse.json(cart);
  }),

  /** DELETE /api/cart/items/:nftId/:editionId */
  http.delete('/api/cart/items/:nftId/:editionId', async ({ request, params }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const cart = carts.get(userId);
    if (!cart) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Carrinho não encontrado.' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (i) => !(i.nftId === params.nftId && i.editionId === params.editionId)
    );
    cart.updatedAt = new Date().toISOString();

    return HttpResponse.json(cart);
  }),

  /** POST /api/cart/coupon */
  http.post('/api/cart/coupon', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const body = (await request.json()) as { code: string };
    const coupon = COUPONS.find(
      (c) => c.code.toUpperCase() === body.code.toUpperCase()
    );

    if (!coupon) {
      return HttpResponse.json<ApiError>(
        { code: 'INVALID_COUPON', message: 'Cupom não encontrado.' },
        { status: 404 }
      );
    }

    if (!coupon.active || new Date(coupon.expiresAt) < new Date()) {
      return HttpResponse.json<ApiError>(
        { code: 'EXPIRED_COUPON', message: 'Este cupom está expirado.' },
        { status: 410 }
      );
    }

    const cart = carts.get(userId);
    if (cart) {
      cart.couponCode = coupon.code;
      cart.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json({ coupon, applied: true });
  }),

  /** DELETE /api/cart/coupon */
  http.delete('/api/cart/coupon', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const cart = carts.get(userId);
    if (cart) {
      cart.couponCode = null;
      cart.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json({ success: true });
  }),

  /** POST /api/cart/merge â€” merge guest cart into authenticated cart */
  http.post('/api/cart/merge', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const guestCart = carts.get('guest');
    if (!guestCart || guestCart.items.length === 0) {
      return HttpResponse.json({ merged: false });
    }

    let userCart = carts.get(session.user.id);
    if (!userCart) {
      userCart = {
        userId: session.user.id,
        items: [],
        couponCode: null,
        updatedAt: new Date().toISOString(),
      };
      carts.set(session.user.id, userCart);
    }

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) => i.nftId === guestItem.nftId && i.editionId === guestItem.editionId
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userCart.items.push({ ...guestItem });
      }
    }

    userCart.updatedAt = new Date().toISOString();
    guestCart.items = [];
    guestCart.updatedAt = new Date().toISOString();

    return HttpResponse.json({ merged: true, cart: userCart });
  }),

  // â”€â”€â”€ Quote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** POST /api/quote */
  http.post('/api/quote', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    const userId = session?.user.id ?? 'guest';

    const cart = carts.get(userId);
    if (!cart || cart.items.length === 0) {
      return HttpResponse.json<ApiError>(
        { code: 'EMPTY_CART', message: 'O carrinho está vazio.' },
        { status: 422 }
      );
    }

    const lineItems: QuoteLineItem[] = [];
    let subtotalMicro = 0;

    for (const item of cart.items) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (!nft) continue;

      const unitMicro = ethToMicro(nft.priceEth);
      const totalMicro = unitMicro * item.quantity;
      subtotalMicro += totalMicro;

      lineItems.push({
        nftId: item.nftId,
        editionId: item.editionId,
        quantity: item.quantity,
        unitPriceEth: nft.priceEth,
        totalPriceEth: microToEth(totalMicro),
      });
    }

    let discountMicro = 0;
    if (cart.couponCode) {
      const coupon = COUPONS.find((c) => c.code === cart.couponCode);
      if (coupon && coupon.active && new Date(coupon.expiresAt) > new Date()) {
        if (coupon.type === 'percent') {
          discountMicro = Math.floor((subtotalMicro * coupon.discountPercent) / 100);
        } else {
          discountMicro = ethToMicro(coupon.discountEth);
        }
      }
    }

    const feeMicro = ethToMicro(NETWORK_FEE_ETH);
    const totalMicro = subtotalMicro - discountMicro + feeMicro;

    const quote: Quote = {
      items: lineItems,
      subtotalEth: microToEth(subtotalMicro),
      discountEth: microToEth(discountMicro),
      networkFeeEth: NETWORK_FEE_ETH,
      totalEth: microToEth(totalMicro),
      couponCode: cart.couponCode,
      validUntil: new Date(Date.now() + 300_000).toISOString(), // 5 min
      version: Date.now(),
    };

    latestQuotes.set(userId, quote);
    return HttpResponse.json(quote);
  }),

  // â”€â”€â”€ Orders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** POST /api/orders */
  http.post('/api/orders', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const body = (await request.json()) as {
      idempotencyKey: string;
      walletId: string;
      network: string;
      quoteVersion: number;
      paymentScenario?: 'confirmed' | 'declined' | 'timeout';
    };
    const scenario = body.paymentScenario ?? 'confirmed';
    const requestFingerprint = JSON.stringify({ walletId: body.walletId, network: body.network, quoteVersion: body.quoteVersion, scenario });

    // Check idempotency â€” same key returns same order
    const existingOrder = orders.find(
      (o) => o.idempotencyKey === body.idempotencyKey && o.userId === session.user.id
    );
    if (existingOrder) {
      if (existingOrder.requestFingerprint && existingOrder.requestFingerprint !== requestFingerprint) {
        return HttpResponse.json<ApiError>(
          { code: 'IDEMPOTENCY_CONFLICT', message: 'A chave de idempotência já foi usada com outro conteúdo.' },
          { status: 409 },
        );
      }
      return HttpResponse.json(existingOrder);
    }

    const cart = carts.get(session.user.id);
    if (!cart || cart.items.length === 0) {
      return HttpResponse.json<ApiError>(
        { code: 'EMPTY_CART', message: 'Carrinho vazio.' },
        { status: 422 }
      );
    }

    const latestQuote = latestQuotes.get(session.user.id);
    if (!latestQuote || body.quoteVersion !== latestQuote.version) {
      return HttpResponse.json<ApiError>(
        { code: 'QUOTE_STALE', message: 'A cotação expirou. Atualize o resumo antes de pagar.' },
        { status: 409 },
      );
    }
    // Validate wallet
    const wallet = wallets.find(
      (w) => w.id === body.walletId && w.userId === session.user.id
    );
    if (!wallet) {
      return HttpResponse.json<ApiError>(
        { code: 'INVALID_WALLET', message: 'Carteira não encontrada.' },
        { status: 422 }
      );
    }

    // Build order items and validate availability
    const orderItems: Order['items'] = [];
    let subtotalMicro = 0;

    for (const item of cart.items) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (!nft) {
        return HttpResponse.json<ApiError>(
          { code: 'NOT_FOUND', message: `NFT ${item.nftId} não encontrado.` },
          { status: 404 }
        );
      }

      const edition = nft.editions.find((e) => e.id === item.editionId);
      if (!edition || edition.available < item.quantity) {
        return HttpResponse.json<ApiError>(
          {
            code: 'INSUFFICIENT_STOCK',
            message: `${nft.name} (${edition?.label ?? item.editionId}): apenas ${edition?.available ?? 0} disponíveis.`,
          },
          { status: 409 }
        );
      }

      const unitMicro = ethToMicro(nft.priceEth);
      const totalMicro = unitMicro * item.quantity;
      subtotalMicro += totalMicro;

      orderItems.push({
        nftId: nft.id,
        nftName: nft.name,
        nftImageUrl: nft.imageUrl,
        editionId: item.editionId,
        editionLabel: edition.label,
        quantity: item.quantity,
        unitPriceEth: nft.priceEth,
        totalPriceEth: microToEth(totalMicro),
      });
    }

    // Discount
    let discountMicro = 0;
    if (cart.couponCode) {
      const coupon = COUPONS.find((c) => c.code === cart.couponCode);
      if (coupon && coupon.active) {
        discountMicro =
          coupon.type === 'percent'
            ? Math.floor((subtotalMicro * coupon.discountPercent) / 100)
            : ethToMicro(coupon.discountEth);
      }
    }

    const feeMicro = ethToMicro(NETWORK_FEE_ETH);
    const totalMicro = subtotalMicro - discountMicro + feeMicro;

    const order: Order = {
      id: generateId('order'),
      userId: session.user.id,
      idempotencyKey: body.idempotencyKey,
      requestFingerprint,
      status: 'pending' as OrderStatus,
      items: orderItems,
      subtotalEth: microToEth(subtotalMicro),
      discountEth: microToEth(discountMicro),
      networkFeeEth: NETWORK_FEE_ETH,
      totalEth: microToEth(totalMicro),
      couponCode: cart.couponCode,
      walletId: body.walletId,
      network: wallet.network,
      transactionHash: null,
      explorerUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    orders.push(order);

    // Declined payments preserve the cart and stock.
    if (scenario !== 'declined') {
      for (const item of cart.items) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (nft) {
        const edition = nft.editions.find((e) => e.id === item.editionId);
        if (edition) {
          edition.available -= item.quantity;
          nft.available = nft.editions.reduce((sum, e) => sum + e.available, 0);
          nft.version += 1;
          broadcastNftUpdate({ event: 'nft.updated', nftId: nft.id, priceEth: nft.priceEth, available: nft.available, version: nft.version, timestamp: new Date().toISOString() });
        }
      }
    }
    }

    if (scenario !== 'declined') {
      cart.items = [];
      cart.couponCode = null;
      cart.updatedAt = new Date().toISOString();
    }

    // Simulate the network response asynchronously.
    if (scenario !== 'timeout') setTimeout(() => {
      order.status = scenario === 'declined' ? 'declined' : 'confirmed';
      order.transactionHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      order.explorerUrl = `https://etherscan.io/tx/${order.transactionHash}`;
      order.updatedAt = new Date().toISOString();
      order.version = 2;
      broadcastOrderUpdate({ event: 'order.updated', orderId: order.id, userId: order.userId, status: order.status, transactionHash: order.transactionHash, version: order.version, timestamp: order.updatedAt });
      persistMockState();
    }, scenario === 'declined' ? 1200 : 2000);

    persistMockState();
    return HttpResponse.json(order, { status: 201 });
  }),

  /** GET /api/orders */
  http.get('/api/orders', async ({ request }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const userOrders = orders.filter((o) => o.userId === session.user.id);
    return HttpResponse.json(userOrders);
  }),

  /** GET /api/orders/:id */
  http.get('/api/orders/:id', async ({ request, params }) => {
    await randomDelay();
    const session = getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const order = orders.find(
      (o) => o.id === params.id && o.userId === session.user.id
    );
    if (!order) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(order);
  }),

  // â”€â”€â”€ Collections & Categories (read-only) â”€â”€â”€â”€â”€â”€

  /** GET /api/collections */
  http.get('/api/collections', async () => {
    await randomDelay();
    // Dynamically compute counts
    const collectionMap = new Map<string, { slug: string; name: string; count: number }>();
    for (const nft of nfts) {
      const existing = collectionMap.get(nft.collectionSlug);
      if (existing) {
        existing.count += 1;
      } else {
        collectionMap.set(nft.collectionSlug, {
          slug: nft.collectionSlug,
          name: nft.collection,
          count: 1,
        });
      }
    }
    return HttpResponse.json([...collectionMap.values()]);
  }),

  /** GET /api/categories */
  http.get('/api/categories', async () => {
    await randomDelay();
    const categoryMap = new Map<string, { slug: string; name: string; count: number }>();
    const nameMap: Record<string, string> = {
      'arte-digital': 'Arte digital',
      fotografia: 'Fotografia',
      musica: 'Música',
      'arte-3d': 'Arte 3D',
      colecionaveis: 'Colecionáveis',
      geometrico: 'Geométrico',
      jogos: 'Jogos',
      aventureiro: 'Aventureiro',
      utilidade: 'Utilidade',
    };
    for (const nft of nfts) {
      const existing = categoryMap.get(nft.category);
      if (existing) {
        existing.count += 1;
      } else {
        categoryMap.set(nft.category, {
          slug: nft.category,
          name: nameMap[nft.category] ?? nft.category,
          count: 1,
        });
      }
    }
    return HttpResponse.json([...categoryMap.values()]);
  }),

  // â”€â”€â”€ Mock state management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** POST /api/mock/reset */
  http.post('/api/mock/reset', async () => {
    await delay(100);
    resetMockState();
    return HttpResponse.json({ reset: true });
  }),

  /** POST /api/mock/update-nft â€” for simulating Socket.IO price/availability changes */
  http.post('/api/mock/update-nft', async ({ request }) => {
    await delay(100);

    const body = (await request.json()) as {
      nftId: string;
      priceEth?: string;
      available?: number;
    };

    const nft = nfts.find((n) => n.id === body.nftId);
    if (!nft) {
      return HttpResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'NFT não encontrado.' },
        { status: 404 }
      );
    }

    if (body.priceEth !== undefined) nft.priceEth = body.priceEth;
    if (body.available !== undefined) {
      nft.available = body.available;
      // Distribute across editions proportionally
      if (nft.editions.length > 0) {
        nft.editions[0].available = body.available;
      }
    }
    nft.version += 1;
    nft.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      event: 'nft.updated',
      nftId: nft.id,
      priceEth: nft.priceEth,
      available: nft.available,
      version: nft.version,
      timestamp: nft.updatedAt,
    });
  }),
];






