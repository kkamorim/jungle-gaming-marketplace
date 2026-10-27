import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { SocketProvider } from './context/SocketContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';

// Lazy-load de páginas: cada rota vira um chunk independente → menor bundle inicial
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MarketPage = lazy(() => import('./pages/MarketPage').then((m) => ({ default: m.MarketPage })));
const NFTDetailPage = lazy(() => import('./pages/NFTDetailPage').then((m) => ({ default: m.NFTDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const CreatorsPage = lazy(() => import('./pages/CreatorsPage').then((m) => ({ default: m.CreatorsPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then((m) => ({ default: m.LearnPage })));

/** Skeleton genérico exibido durante o carregamento lazy de cada rota */
function PageSkeleton() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col gap-8 px-4 py-10 max-w-7xl mx-auto w-full animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export type ViewMode = 'home' | 'market' | 'nft-detail' | 'profile' | 'creators' | 'learn';

function MarketplaceApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const selectedNftId = pathname.startsWith('/nft/')
    ? decodeURIComponent(pathname.slice('/nft/'.length))
    : null;
  const currentView: ViewMode = selectedNftId
    ? 'nft-detail'
    : pathname === '/market'
      ? 'market'
      : pathname === '/profile'
        ? 'profile'
        : pathname === '/creators'
          ? 'creators'
          : pathname === '/learn'
            ? 'learn'
            : 'home';
  const searchQuery = new URLSearchParams(location.searchStr).get('q') ?? '';

  const navigateTo = (view: ViewMode, nftId?: string) => {
    const to = view === 'nft-detail' && nftId
      ? `/nft/${encodeURIComponent(nftId)}`
      : view === 'home'
        ? '/'
        : `/${view}`;

    navigate({ to } as never);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (q: string) => {
    navigate({ to: '/market', search: q.trim() ? { q: q.trim() } : {} } as never);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#120E0B] text-white selection:bg-[#E28D38] selection:text-white">
      <Header
        currentView={currentView}
        onNavigate={(view, nftId) => navigateTo(view as ViewMode, nftId)}
        onSearch={handleSearch}
      />

      <main className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          {currentView === 'home' && (
            <HomePage
              onSelectNft={(id) => navigateTo('nft-detail', id)}
              externalSearch={searchQuery}
            />
          )}

          {currentView === 'market' && (
            <MarketPage onSelectNft={(id) => navigateTo('nft-detail', id)} />
          )}

          {currentView === 'nft-detail' && selectedNftId && (
            <NFTDetailPage
              nftId={selectedNftId}
              onBack={() => navigateTo('market')}
              onSelectNft={(id) => navigateTo('nft-detail', id)}
              onHome={() => navigateTo('home')}
            />
          )}

          {currentView === 'profile' && (
            <ProfilePage
              onNavigateHome={() => navigateTo('home')}
              onSelectNft={(id) => navigateTo('nft-detail', id)}
            />
          )}

          {currentView === 'creators' && (
            <CreatorsPage onSelectNft={(id) => navigateTo('nft-detail', id)} />
          )}

          {currentView === 'learn' && <LearnPage />}
        </Suspense>
      </main>

      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <ToastContainer />
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: MarketplaceApp });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' });
const marketRoute = createRoute({ getParentRoute: () => rootRoute, path: '/market' });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile' });
const creatorsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/creators' });
const learnRoute = createRoute({ getParentRoute: () => rootRoute, path: '/learn' });
const nftRoute = createRoute({ getParentRoute: () => rootRoute, path: '/nft/$nftId' });
const routeTree = rootRoute.addChildren([
  homeRoute,
  marketRoute,
  profileRoute,
  creatorsRoute,
  learnRoute,
  nftRoute,
]);
const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <SocketProvider>
            <RouterProvider router={router} />
          </SocketProvider>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


