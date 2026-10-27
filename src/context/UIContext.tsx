import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
}

export type CartDrawerTab = 'cart' | 'wishlist';

interface UIContextType {
  isCartOpen: boolean;
  cartTab: CartDrawerTab;
  setCartTab: (tab: CartDrawerTab) => void;
  openCart: (tab?: CartDrawerTab | unknown) => void;
  openWishlist: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  authModal: 'login' | 'register' | null;
  openAuthModal: (mode: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTab, setCartTab] = useState<CartDrawerTab>('cart');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const openCart = (tab?: CartDrawerTab | unknown) => {
    setCartTab(tab === 'wishlist' ? 'wishlist' : 'cart');
    setIsCartOpen(true);
  };
  const openWishlist = () => {
    setCartTab('wishlist');
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openAuthModal = (mode: 'login' | 'register') => setAuthModal(mode);
  const closeAuthModal = () => setAuthModal(null);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UIContext.Provider
      value={{
        isCartOpen,
        cartTab,
        setCartTab,
        openCart,
        openWishlist,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        authModal,
        openAuthModal,
        closeAuthModal,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
