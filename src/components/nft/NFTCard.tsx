import { Heart, ShoppingCart } from 'lucide-react';
import type { NFT } from '../../types';
import { useFavorites, useToggleFavorite, useAddToCart } from '../../hooks/useMarketplace';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

interface NFTCardProps {
  nft: NFT;
  onSelect: (id: string) => void;
}

export function NFTCard({ nft, onSelect }: NFTCardProps) {
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const addToCart = useAddToCart();
  const { openCart, openAuthModal, addToast } = useUI();

  const isFavorited =
    favorites?.some((f) => (typeof f === 'string' ? f === nft.id : f?.id === nft.id)) ?? false;
  const editionLabel = nft.editions?.[0]?.label ?? '1/50';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Login necessário',
        description: 'Faça login para salvar itens na sua lista de interesses.',
      });
      openAuthModal('login');
      return;
    }

    toggleFavorite.mutate(
      { nftId: nft.id, isFavorited, nft },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: isFavorited ? 'Removido dos interesses' : 'Adicionado aos interesses!',
            description: isFavorited
              ? `${nft.name} foi removido da sua lista de interesses.`
              : `${nft.name} foi salvo na sua lista de interesses.`,
          });
        },
      }
    );
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Login necessário',
        description: 'Faça login para adicionar itens ao carrinho.',
      });
      openAuthModal('login');
      return;
    }

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
            title: 'Adicionado ao Carrinho',
            description: `${nft.name} foi adicionado com sucesso.`,
          });
          openCart('cart');
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(nft.id);
    }
  };

  return (
    <article
      onClick={() => onSelect(nft.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes de ${nft.name}, preço ${nft.priceEth} ETH`}
      className="group relative cursor-pointer flex flex-col rounded-2xl bg-[#1F1711] border border-[#35271C] overflow-hidden transition-all duration-300 hover:border-[#E28D38] hover:shadow-[0_4px_20px_rgba(226,141,56,0.15)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E28D38]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#EAE5D9]">
        <img
          src={nft.imageUrl}
          alt={nft.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 ${
            isFavorited
              ? '!opacity-100 bg-[#E28D38] text-white shadow-[0_0_12px_rgba(226,141,56,0.6)]'
              : 'bg-[#120E0B]/70 text-[#B9A899] hover:text-white hover:bg-[#120E0B]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleQuickBuy}
          aria-label={`Comprar ou adicionar ${nft.name} ao carrinho`}
          title="Adicionar ao carrinho"
          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-[#120E0B]/70 text-[#B9A899] hover:text-white hover:bg-[#E28D38] backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3">
        <h3 className="font-mono text-xs sm:text-[13px] font-medium text-white group-hover:text-[#E28D38] transition-colors truncate">
          {nft.name}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs sm:text-[13px] text-[#E28D38]">
              {nft.priceEth} ETH
            </span>
            {nft.id === 'nft-003' && (
              <span className="font-mono text-xs text-[#7A6C60] line-through">
                2.29 ETH
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#7A6C60] px-1.5 py-0.5 rounded bg-[#120E0B] border border-[#35271C]">
            {editionLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
