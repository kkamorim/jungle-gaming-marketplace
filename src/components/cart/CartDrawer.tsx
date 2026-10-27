import { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  ArrowRight,
  Tag,
  ShoppingBag,
  Heart,
  ShoppingCart,
  LogIn,
  Check,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
  useAddToCart,
  useFavorites,
  useToggleFavorite,
  useApplyCoupon,
  useRemoveCoupon,
  useQuote,
  useNFTs,
} from '../../hooks/useMarketplace';
import { formatEth } from '../../lib/utils';
import type { NFT } from '../../types';

export function CartDrawer() {
  const {
    isCartOpen,
    cartTab,
    setCartTab,
    closeCart,
    openCheckout,
    openAuthModal,
    addToast,
  } = useUI();
  const { isAuthenticated } = useAuth();

  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: favorites, isLoading: isFavoritesLoading } = useFavorites();
  const { data: quote } = useQuote();
  const { data: nftsData } = useNFTs({ perPage: 100 });

  const updateQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();
  const toggleFavorite = useToggleFavorite();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [addingNftId, setAddingNftId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  // Match cart items with full NFT data
  const itemsWithNft =
    cart?.items.map((item) => {
      const nft = nftsData?.data.find((n) => n.id === item.nftId);
      return {
        ...item,
        nft,
      };
    }) || [];

  // Match favorite items with full NFT data if needed
  const favoriteNfts: NFT[] = (favorites || [])
    .map((item: any) => {
      if (typeof item === 'string') {
        return nftsData?.data.find((n) => n.id === item);
      }
      if (item && item.id) {
        // If it's a partial mock object, fill details from nftsData
        return nftsData?.data.find((n) => n.id === item.id) || (item as NFT);
      }
      return null;
    })
    .filter(Boolean) as NFT[];

  const cartCount = cart?.items.length || 0;
  const wishlistCount = favoriteNfts.length;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);

    applyCoupon.mutate(couponInput.trim().toUpperCase(), {
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Cupom aplicado!',
          description: 'Desconto adicionado ao seu pedido.',
        });
        setCouponInput('');
      },
      onError: (err: any) => {
        setCouponError(err.response?.data?.message || 'Cupom inválido ou expirado');
      },
    });
  };

  const handleCheckoutClick = () => {
    const hasPriceChange = cart?.items.some((i) => i.priceChanged);
    if (hasPriceChange) {
      addToast({
        type: 'warning',
        title: 'Preço alterado no mercado',
        description: 'Os valores foram atualizados para refletir o mercado em tempo real.',
      });
    }
    openCheckout();
  };

  const handleAddWishlistItemToCart = (nft: NFT) => {
    setAddingNftId(nft.id);
    addToCart.mutate(
      {
        nftId: nft.id,
        editionId: nft.editions?.[0]?.id ?? 'ed-001',
        quantity: 1,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Adicionado ao Carrinho!',
            description: `${nft.name} foi adicionado ao seu carrinho com sucesso.`,
          });
          setAddingNftId(null);
        },
        onError: () => {
          addToast({
            type: 'error',
            title: 'Erro ao adicionar',
            description: 'Não foi possível adicionar o NFT ao carrinho.',
          });
          setAddingNftId(null);
        },
      }
    );
  };

  const handleRemoveWishlistItem = (nft: NFT) => {
    toggleFavorite.mutate(
      {
        nftId: nft.id,
        isFavorited: true,
        nft,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'info',
            title: 'Removido dos interesses',
            description: `${nft.name} foi removido da sua lista de interesses.`,
          });
        },
      }
    );
  };

  const handleAddAllWishlistToCart = () => {
    favoriteNfts.forEach((nft) => {
      const alreadyInCart = cart?.items.some((i) => i.nftId === nft.id);
      if (!alreadyInCart) {
        addToCart.mutate({
          nftId: nft.id,
          editionId: nft.editions?.[0]?.id ?? 'ed-001',
          quantity: 1,
        });
      }
    });

    addToast({
      type: 'success',
      title: 'Itens adicionados!',
      description: 'Todos os itens da sua lista foram adicionados ao carrinho.',
    });
    setCartTab('cart');
  };

  return (
    <div
      className="fixed inset-0 z-[200] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-[#0A0705]/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside className="w-screen max-w-md bg-[#18120D] border-l border-[#35271C] shadow-2xl flex flex-col justify-between">
          <div className="border-b border-[#35271C] bg-[#140E0A]">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <h2 id="cart-drawer-title" className="font-heading font-bold text-base sm:text-lg text-white">
                {cartTab === 'cart' ? 'Carrinho de Compras' : 'Lista de Interesses'}
              </h2>

              <button
                onClick={closeCart}
                className="p-1.5 text-[#7A6C60] hover:text-white hover:bg-[#1F1711] rounded-lg transition-colors"
                aria-label="Fechar gaveta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-t border-[#35271C] px-3">
              <button
                onClick={() => setCartTab('cart')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b-2 transition-all ${
                  cartTab === 'cart'
                    ? 'border-[#E28D38] text-[#E28D38] bg-[#E28D38]/5'
                    : 'border-transparent text-[#B9A899] hover:text-white hover:bg-[#1F1711]/50'
                }`}
                aria-selected={cartTab === 'cart'}
                role="tab"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Carrinho</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    cartTab === 'cart'
                      ? 'bg-[#E28D38] text-white'
                      : 'bg-[#271E17] text-[#B9A899] border border-[#35271C]'
                  }`}
                >
                  {cartCount}
                </span>
              </button>

              <button
                onClick={() => setCartTab('wishlist')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b-2 transition-all ${
                  cartTab === 'wishlist'
                    ? 'border-[#E28D38] text-[#E28D38] bg-[#E28D38]/5'
                    : 'border-transparent text-[#B9A899] hover:text-white hover:bg-[#1F1711]/50'
                }`}
                aria-selected={cartTab === 'wishlist'}
                role="tab"
              >
                <Heart className={`w-4 h-4 ${cartTab === 'wishlist' ? 'fill-current' : ''}`} />
                <span>Interesses</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    cartTab === 'wishlist'
                      ? 'bg-[#E28D38] text-white'
                      : 'bg-[#271E17] text-[#B9A899] border border-[#35271C]'
                  }`}
                >
                  {wishlistCount}
                </span>
              </button>
            </div>
          </div>

          {cartTab === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isCartLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-[#1F1711] animate-pulse" />
                    ))}
                  </div>
                ) : itemsWithNft.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#1F1711] border border-[#35271C] flex items-center justify-center text-[#7A6C60] mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-base mb-1">
                      Seu carrinho está vazio
                    </h3>
                    <p className="text-xs text-[#7A6C60] max-w-xs mb-6">
                      Explore o catálogo de NFTs para encontrar coleções exclusivas e raras.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={closeCart}
                        className="px-5 py-2.5 rounded-lg bg-[#E28D38] hover:bg-[#F5A047] text-white text-xs font-semibold shadow-md transition-colors"
                      >
                        Explorar Mercado
                      </button>
                      {wishlistCount > 0 && (
                        <button
                          onClick={() => setCartTab('wishlist')}
                          className="px-4 py-2.5 rounded-lg bg-[#271E17] hover:bg-[#35271C] text-[#B9A899] hover:text-white text-xs font-semibold border border-[#35271C] transition-colors"
                        >
                          Ver Lista de Interesses ({wishlistCount})
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  itemsWithNft.map((item) => (
                    <div
                      key={`${item.nftId}-${item.editionId}`}
                      className={`p-3 rounded-xl bg-[#1F1711] border transition-all ${
                        item.priceChanged ? 'border-[#E28D38] bg-[#221810]' : 'border-[#35271C]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#120E0B] shrink-0 border border-[#35271C]">
                          <img
                            src={
                              item.nft?.imageUrl ||
                              'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200'
                            }
                            alt={item.nft?.name || 'NFT'}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-heading font-semibold text-sm text-white truncate">
                              {item.nft?.name || `NFT #${item.nftId}`}
                            </h4>
                            <button
                              onClick={() =>
                                removeFromCart.mutate({
                                  nftId: item.nftId,
                                  editionId: item.editionId,
                                })
                              }
                              className="text-[#7A6C60] hover:text-red-400 p-1 transition-colors"
                              aria-label={`Remover ${item.nft?.name} do carrinho`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] font-mono text-[#7A6C60] mt-0.5">
                            Edição: {item.nft?.editions?.[0]?.label || '1/50'}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="font-mono font-bold text-xs text-[#E28D38]">
                              {formatEth(item.currentPriceEth || item.unitPriceEth)} ETH
                            </div>

                            <div className="flex items-center gap-2 bg-[#271E17] rounded-md border border-[#35271C] px-1 py-0.5">
                              <button
                                onClick={() =>
                                  updateQuantity.mutate({
                                    nftId: item.nftId,
                                    editionId: item.editionId,
                                    quantity: Math.max(1, item.quantity - 1),
                                  })
                                }
                                disabled={item.quantity <= 1}
                                className="p-1 text-[#B9A899] hover:text-white disabled:opacity-30"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-xs text-white px-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity.mutate({
                                    nftId: item.nftId,
                                    editionId: item.editionId,
                                    quantity: item.quantity + 1,
                                  })
                                }
                                className="p-1 text-[#B9A899] hover:text-white"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time price changed warning banner */}
                      {item.priceChanged && (
                        <div className="mt-2 pt-2 border-t border-[#E28D38]/30 flex items-center gap-1.5 text-[11px] text-[#E28D38]">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Preço alterado no mercado em tempo real.</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {itemsWithNft.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-[#35271C] bg-[#140E0A] space-y-4">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[#7A6C60] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="CÓDIGO DE CUPOM..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#1F1711] border border-[#35271C] rounded-lg text-xs text-white placeholder-[#7A6C60] focus:outline-none focus:border-[#E28D38] uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={applyCoupon.isPending}
                      className="px-4 py-2 bg-[#271E17] hover:bg-[#E28D38] text-white text-xs font-semibold rounded-lg border border-[#35271C] hover:border-transparent transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>

                  {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}

                  {cart?.couponCode && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#E28D38]/10 border border-[#E28D38]/30 text-xs">
                      <span className="font-mono text-[#E28D38] font-bold">
                        Cupom: {cart.couponCode}
                      </span>
                      <button
                        onClick={() => removeCoupon.mutate()}
                        className="text-[#7A6C60] hover:text-red-400 text-[11px]"
                      >
                        Remover
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-[#B9A899] font-mono">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">{formatEth(quote?.subtotalEth || '0')} ETH</span>
                    </div>

                    {parseFloat(quote?.discountEth || '0') > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto</span>
                        <span>(-) {formatEth(quote?.discountEth || '0')} ETH</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Taxa de rede (gas est.)</span>
                      <span className="text-white">{quote?.networkFeeEth || '0.016'} ETH</span>
                    </div>

                    <div className="border-t border-[#35271C] my-2 pt-2 flex justify-between text-sm font-bold">
                      <span className="text-white font-sans">Total</span>
                      <span className="text-[#E28D38]">{formatEth(quote?.totalEth || '0')} ETH</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] active:bg-[#C87827] text-white font-semibold text-sm tracking-wide shadow-[0_4px_20px_rgba(226,141,56,0.35)] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Conectar e finalizar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {cartTab === 'wishlist' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {!isAuthenticated ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#E28D38]/10 border border-[#E28D38]/30 flex items-center justify-center text-[#E28D38] mb-4">
                      <LogIn className="w-7 h-7" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-base mb-1">
                      Acesse sua Lista de Interesses
                    </h3>
                    <p className="text-xs text-[#7A6C60] max-w-xs mb-6">
                      Faça login para salvar seus NFTs favoritos, sincronizar entre dispositivos e movê-los diretamente para o carrinho.
                    </p>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="px-5 py-2.5 rounded-lg bg-[#E28D38] hover:bg-[#F5A047] text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Conectar à minha conta</span>
                    </button>
                  </div>
                ) : isFavoritesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-[#1F1711] animate-pulse" />
                    ))}
                  </div>
                ) : favoriteNfts.length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#1F1711] border border-[#35271C] flex items-center justify-center text-[#7A6C60] mb-4">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-semibold text-white text-base mb-1">
                      Sua lista de interesses está vazia
                    </h3>
                    <p className="text-xs text-[#7A6C60] max-w-xs mb-6">
                      Clique no ícone de coração nos cards de NFTs do mercado para salvá-los aqui e acompanhá-los de perto.
                    </p>
                    <button
                      onClick={closeCart}
                      className="px-5 py-2.5 rounded-lg bg-[#E28D38] hover:bg-[#F5A047] text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      Explorar Mercado
                    </button>
                  </div>
                ) : (
                  favoriteNfts.map((nft) => {
                    const isAlreadyInCart = cart?.items.some((i) => i.nftId === nft.id);
                    const isAddingThis = addingNftId === nft.id;

                    return (
                      <div
                        key={nft.id}
                        className="p-3 rounded-xl bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38]/50 transition-all flex items-start gap-3"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#120E0B] shrink-0 border border-[#35271C]">
                          <img
                            src={nft.imageUrl || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200'}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-heading font-semibold text-sm text-white truncate">
                              {nft.name}
                            </h4>
                            <button
                              onClick={() => handleRemoveWishlistItem(nft)}
                              className="text-[#7A6C60] hover:text-red-400 p-1 transition-colors"
                              title="Remover da lista de interesses"
                              aria-label={`Remover ${nft.name} da lista de interesses`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#7A6C60] truncate">
                              {nft.collection}
                            </span>
                            <span className="text-[10px] font-mono text-[#E28D38] bg-[#E28D38]/10 px-1.5 py-0.2 rounded border border-[#E28D38]/20">
                              {nft.editions?.[0]?.label || '1/50'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2.5">
                            <div className="font-mono font-bold text-xs text-[#E28D38]">
                              {formatEth(nft.priceEth)} ETH
                            </div>

                            <button
                              onClick={() => handleAddWishlistItemToCart(nft)}
                              disabled={isAddingThis}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                isAlreadyInCart
                                  ? 'bg-[#271E17] text-[#B9A899] hover:text-white border border-[#35271C]'
                                  : 'bg-[#E28D38] hover:bg-[#F5A047] text-white shadow-sm'
                              }`}
                              title={isAlreadyInCart ? 'Já está no carrinho (adicionar mais 1)' : 'Adicionar ao carrinho'}
                            >
                              {isAlreadyInCart ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>No carrinho (+1)</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Adicionar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {isAuthenticated && favoriteNfts.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-[#35271C] bg-[#140E0A] flex flex-col gap-2.5">
                  <button
                    onClick={handleAddAllWishlistToCart}
                    className="w-full py-3 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] active:bg-[#C87827] text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Adicionar todos ao carrinho</span>
                  </button>

                  <button
                    onClick={() => setCartTab('cart')}
                    className="w-full py-2.5 rounded-xl bg-[#1F1711] hover:bg-[#271E17] text-[#B9A899] hover:text-white text-xs font-semibold border border-[#35271C] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Ir para o carrinho ({cartCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
