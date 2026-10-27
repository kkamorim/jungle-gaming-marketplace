import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Heart, LogOut, Menu, Search, ShoppingBag, UserRound, Wallet, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useCart, useFavorites } from '../../hooks/useMarketplace';

export type AppView = 'home' | 'market' | 'nft-detail' | 'profile' | 'creators' | 'learn';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView, nftId?: string) => void;
  onSearch?: (query: string) => void;
}

export function Header({ currentView, onNavigate, onSearch }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { openCart, openWishlist, openAuthModal, addToast } = useUI();
  const { data: cart } = useCart();
  const { data: favorites } = useFavorites();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const favoritesCount = favorites?.length || 0;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const navItems: { label: string; view: AppView; active: boolean }[] = [
    { label: 'Início', view: 'home', active: currentView === 'home' },
    { label: 'Mercado', view: 'market', active: currentView === 'market' || currentView === 'nft-detail' },
    { label: 'Criadores', view: 'creators', active: currentView === 'creators' },
    { label: 'Aprenda', view: 'learn', active: currentView === 'learn' },
  ];

  const navigate = (view: AppView) => {
    setMobileOpen(false);
    onNavigate(view);
  };
  const requireAuth = (action: () => void) => {
    if (isAuthenticated) return action();
    addToast({ type: 'warning', title: 'Login necessário', description: 'Faça login para continuar.' });
    openAuthModal('login');
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#35271C] bg-[#120E0B]/95 backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="shrink-0 justify-self-start rounded px-1 font-heading text-[13px] font-extrabold tracking-[0.28em] text-white transition-colors hover:text-[#E28D38] sm:text-sm"
          aria-label="Ir para a página inicial da Kurio"
        >
          KURIO
        </button>

        <nav
          className="col-start-2 hidden items-center gap-5 whitespace-nowrap sm:flex"
          aria-label="Navegação principal" 
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.view)}
              aria-current={item.active ? 'page' : undefined}
              className={
                'border-b pb-1 text-[11px] transition-colors sm:text-xs ' +
                (item.active
                  ? 'border-[#E28D38] text-[#E28D38]'
                  : 'border-transparent text-[#B9A899] hover:text-white')
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-self-end gap-1 sm:gap-2">
          <form onSubmit={submitSearch} className="flex items-center">
            {searchOpen && (
              <input
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  onSearch?.(event.target.value);
                }}
                onBlur={() => {
                  if (!searchValue) setSearchOpen(false);
                }}
                autoFocus
                placeholder="Buscar..."
                className="w-28 rounded-full border border-[#35271C] bg-[#1F1711] px-3 py-1.5 text-[10px] text-white outline-none focus:border-[#E28D38] sm:w-44"
              />
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded p-2 text-[#B9A899] hover:bg-[#1F1711] hover:text-white"
              aria-label="Buscar"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => requireAuth(openWishlist)}
            className="relative rounded p-2 text-[#B9A899] hover:bg-[#1F1711] hover:text-white"
            aria-label="Lista de interesses"
          >
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {favoritesCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E28D38] px-0.5 text-[8px] text-[#120E0B]">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openCart('cart')}
            className="relative rounded p-2 text-[#B9A899] hover:bg-[#1F1711] hover:text-white"
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E28D38] px-0.5 text-[8px] text-[#120E0B]">
                {cartCount}
              </span>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserOpen((open) => !open)}
                className="rounded-full border border-[#35271C] p-0.5 hover:border-[#E28D38]"
                aria-label="Menu do usuário"
              >
                <img src={user.avatarUrl} alt={user.displayName} className="h-6 w-6 rounded-full object-cover" />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 rounded-lg border border-[#35271C] bg-[#1F1711] p-2 shadow-2xl">
                  <div className="border-b border-[#35271C] px-2 pb-2">
                    <p className="truncate text-xs font-semibold text-white">{user.displayName}</p>
                    <p className="truncate text-[10px] text-[#7A6C60]">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      navigate('profile');
                    }}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left text-[10px] text-[#B9A899] hover:text-white"
                  >
                    <UserRound className="h-3.5 w-3.5 text-[#E28D38]" /> Meu perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      navigate('profile');
                    }}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left text-[10px] text-[#B9A899] hover:text-white"
                  >
                    <Wallet className="h-3.5 w-3.5 text-[#E28D38]" /> Minhas carteiras
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 border-t border-[#35271C] px-2 py-2 text-left text-[10px] text-red-400 hover:text-red-300"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="rounded bg-[#D28A4C] px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-[#C27438] sm:px-4"
            >
              Entrar
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded p-2 text-[#B9A899] hover:text-white min-[560px]:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#35271C] bg-[#18120D] px-4 py-3 min-[560px]:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.view)}
              className={'block w-full py-2 text-left text-xs ' + (item.active ? 'text-[#E28D38]' : 'text-[#B9A899]')}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate('profile')}
              className="block w-full border-t border-[#35271C] py-2 text-left text-xs text-[#B9A899]"
            >
              Meu perfil e carteiras
            </button>
          )}
        </div>
      )}
    </header>
  );
}
