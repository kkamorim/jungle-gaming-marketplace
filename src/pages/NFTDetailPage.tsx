import { useState } from 'react';
import { Heart, Mail, Minus, Plus, ShoppingCart, Star, X, ZoomIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useAddToCart, useFavorites, useNFT, useNFTs, useToggleFavorite } from '../hooks/useMarketplace';
import { formatEth } from '../lib/utils';
import { NFTCard } from '../components/nft/NFTCard';

interface NFTDetailPageProps {
  nftId: string;
  onBack: () => void;
  onSelectNft: (id: string) => void;
  onHome?: () => void;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>;
}

export function NFTDetailPage({ nftId, onBack, onSelectNft, onHome }: NFTDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const { data: nft, isLoading, isError } = useNFT(nftId);
  const { data: allNfts } = useNFTs({ perPage: 15 });
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const addToCart = useAddToCart();
  const { openCart, openCheckout, openAuthModal, addToast } = useUI();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedEditionIdx, setSelectedEditionIdx] = useState<number | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true"><div className="h-4 w-24 animate-pulse rounded bg-[#1F1711]" /><div className="mt-6 grid gap-6 min-[560px]:grid-cols-2"><div className="aspect-square animate-pulse rounded-xl bg-[#1F1711]" /><div className="h-80 animate-pulse rounded-xl bg-[#1F1711]" /></div></div>;
  }

  if (isError || !nft) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6"><h1 className="text-xl font-bold text-white">NFT não encontrado</h1><p className="mt-2 text-sm text-[#B9A899]">Este item pode ter sido removido ou não está disponível no mock.</p><button type="button" onClick={onBack} className="mt-6 rounded-lg bg-[#E28D38] px-5 py-2 text-sm font-bold text-[#120E0B]">Voltar ao mercado</button></div>;
  }

  const gallery = [nft.imageUrl, nft.imageUrl, nft.imageUrl, nft.imageUrl];
  const editions = nft.editions?.length ? nft.editions.map((edition) => ({ id: edition.id, label: edition.label })) : [{ id: 'ed-001', label: '1/1' }];
  const activeEditionIdx = selectedEditionIdx ?? Math.max(0, editions.findIndex((edition) => edition.label === '1/50'));
  const activeEdition = editions[activeEditionIdx] || editions[0];
  const editionId = activeEdition.id || nft.editions?.[0]?.id || 'ed-001';
  const relatedNfts = allNfts?.data.filter((item) => item.id !== nftId) || [];
  const isFavorited = favorites?.some((favorite) => (typeof favorite === 'string' ? favorite === nftId : favorite?.id === nftId)) ?? false;
  const rating = Math.round(Number(nft.rating) || 5);
  const attributes = nft.attributes?.map((attribute) => attribute.value).filter(Boolean).join(', ');
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const shareText = nft.name + ' â€” ' + nft.collection;

  const needsAuth = () => {
    if (isAuthenticated) return true;
    addToast({ type: 'warning', title: 'Login necessário', description: 'Faça login para continuar.' });
    openAuthModal('login');
    return false;
  };

  const buy = (checkout: boolean) => {
    if (!needsAuth()) return;
    addToCart.mutate({ nftId: nft.id, editionId, quantity }, {
      onSuccess: () => {
        if (checkout) openCheckout();
        else {
          addToast({ type: 'success', title: 'Adicionado ao carrinho', description: quantity + 'x ' + nft.name + ' foi adicionado.' });
          openCart('cart');
        }
      },
    });
  };

  const toggle = () => {
    if (!needsAuth()) return;
    toggleFavorite.mutate({ nftId: nft.id, isFavorited, nft }, {
      onSuccess: () => addToast({ type: 'success', title: isFavorited ? 'Removido dos interesses' : 'Adicionado aos interesses!', description: nft.name }),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 font-mono sm:px-6 sm:py-8 lg:px-8">
      <nav className="mb-4 flex items-center gap-1.5 text-[9px] text-[#B9A899] sm:text-[10px]" aria-label="Breadcrumb">
        <button type="button" onClick={onHome || onBack} className="hover:text-[#E28D38]">Início</button><span className="text-[#7A6C60]">/</span><button type="button" onClick={onBack} className="hover:text-[#E28D38]">Mercado</button>
      </nav>

      <div className="grid gap-6 min-[560px]:grid-cols-[minmax(0,1.05fr)_minmax(220px,0.95fr)] lg:gap-8">
        <section className="flex flex-col gap-3 min-[560px]:flex-row">
          <div className="order-2 flex gap-2 min-[560px]:order-1 min-[560px]:flex-col min-[560px]:gap-3">
            {gallery.map((image, index) => <button key={index} type="button" onClick={() => setSelectedImageIndex(index)} className={'h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-[#1F1711] p-0.5 transition-colors sm:h-14 sm:w-14 ' + (selectedImageIndex === index ? 'border-[#E28D38]' : 'border-[#35271C] hover:border-[#E28D38]/60')} aria-label={'Ver imagem ' + (index + 1)}><img src={image} alt="" className="h-full w-full rounded object-cover" /></button>)}
          </div>
          <div className="relative order-1 min-w-0 flex-1 rounded-xl border border-[#35271C] bg-[#1F1711] p-2.5 min-[560px]:order-2 sm:p-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-[#EAE5D9]"><img src={gallery[selectedImageIndex] || nft.imageUrl} alt={nft.name} className="h-full w-full object-cover" /></div>
            <button type="button" onClick={() => setZoomOpen(true)} className="absolute right-4 top-4 rounded-full bg-[#120E0B]/75 p-1.5 text-white hover:text-[#E28D38]" aria-label="Ampliar imagem"><ZoomIn className="h-3.5 w-3.5" /></button>
          </div>
        </section>

        <section className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-3"><div><h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{nft.name}</h1><p className="mt-1 text-sm font-bold text-[#E28D38]">{formatEth(nft.priceEth)} ETH</p></div><div className="flex items-center gap-1 pt-1 text-[#E28D38]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className={'h-3 w-3 ' + (item <= rating ? 'fill-current' : 'opacity-25')} />)}<span className="ml-1 text-[9px] text-[#B9A899]">{nft.ratingsCount || 19} avaliações</span></div></div>
          <div className="mt-4 border-t border-[#35271C] pt-4"><h3 className="mb-1 text-[10px] font-bold text-white">Sobre este NFT:</h3><p className="text-[10px] leading-5 text-[#D9A066]">{nft.description}</p></div>
          <div className="mt-4"><h3 className="mb-2 text-[10px] font-bold text-white">Edição:</h3><div className="flex flex-wrap items-center gap-1.5">{editions.map((edition, index) => <button key={edition.id || edition.label} type="button" onClick={() => setSelectedEditionIdx(index)} className={'rounded-full border px-2 py-0.5 text-[9px] transition-colors ' + (activeEditionIdx === index ? 'border-[#E28D38] bg-[#E28D38]/10 text-[#E28D38]' : 'border-[#35271C] text-[#B9A899] hover:text-white')}>{edition.label}</button>)}<span className="ml-1 text-[9px] uppercase text-[#7A6C60]">Aberta</span></div></div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#35271C] pt-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D28A4C] text-white disabled:opacity-40"><Minus className="h-3 w-3" /></button><span className="w-5 text-center text-xs font-bold text-white">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(nft.available, value + 1))} disabled={quantity >= nft.available} className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D28A4C] text-white disabled:opacity-40"><Plus className="h-3 w-3" /></button></div><div className="flex items-center gap-1.5"><button type="button" onClick={() => buy(true)} className="rounded bg-[#E28D38] px-5 py-2 text-[9px] font-bold uppercase text-[#120E0B] hover:bg-[#F5A047]">Comprar</button><button type="button" onClick={() => buy(false)} className="rounded border border-[#35271C] p-2 text-[#E28D38] hover:border-[#E28D38]" aria-label="Adicionar ao carrinho"><ShoppingCart className="h-3.5 w-3.5" /></button><button type="button" onClick={toggle} className={'flex items-center gap-1 rounded border px-2.5 py-2 text-[9px] ' + (isFavorited ? 'border-[#E28D38] bg-[#E28D38]/15 text-white' : 'border-[#E28D38]/60 text-white')}><Heart className={'h-3 w-3 text-[#E28D38] ' + (isFavorited ? 'fill-current' : '')} /> Favoritar</button></div></div>
          <dl className="mt-4 space-y-1 text-[9px] text-[#8F8174]"><div>ID do token: <span className="text-[#B9A899]">#{nft.tokenId || '0042'}</span></div><div>Coleção: <span className="text-[#B9A899]">{nft.collection}</span></div>{attributes && <div>Atributos: <span className="text-[#B9A899]">{attributes}</span></div>}</dl>
          <div className="mt-4 flex items-center gap-2 text-[9px]"><span className="font-bold text-white">Compartilhar este NFT:</span><a href={'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl)} target="_blank" rel="noreferrer" className="text-[#B9A899] hover:text-[#E28D38]" aria-label="Compartilhar no LinkedIn"><LinkedInIcon /></a><a href={'mailto:?subject=' + encodeURIComponent(shareText) + '&body=' + encodeURIComponent(shareUrl)} className="text-[#B9A899] hover:text-[#E28D38]" aria-label="Compartilhar por e-mail"><Mail className="h-3.5 w-3.5" /></a></div>
        </section>
      </div>

      <section className="mt-9 sm:mt-12">
        <div className="flex gap-5 border-b border-[#35271C]"><button type="button" onClick={() => setActiveTab('details')} className={'border-b-2 pb-2 text-[10px] font-semibold ' + (activeTab === 'details' ? 'border-[#E28D38] text-[#E28D38]' : 'border-transparent text-[#B9A899]')}>Detalhes do NFT</button><button type="button" onClick={() => setActiveTab('reviews')} className={'border-b-2 pb-2 text-[10px] font-semibold ' + (activeTab === 'reviews' ? 'border-[#E28D38] text-[#E28D38]' : 'border-transparent text-[#B9A899]')}>Avaliações de colecionadores ({nft.ratingsCount || 19})</button></div>
        <div className="py-5 text-[10px] leading-5 text-[#C9B8A6]">{activeTab === 'details' ? <div className="space-y-3"><p>{nft.name} é uma obra digital {activeEdition.label} finalizada à mão da coleção {nft.collection}. Cada atributo fica armazenado nos metadados do token e verificado na blockchain.</p><div><strong className="text-white">Rede:</strong><p>Cunhado na Ethereum com procedência imutável e metadados armazenados no IPFS.</p></div><div><strong className="text-white">Direitos autorais:</strong><p>Direitos do criador pagos automaticamente nas vendas secundárias compatíveis.</p></div><div><strong className="text-white">Contrato:</strong><p>0x7A42â€¦19E8 Â· Contrato inteligente ERC-721 verificado.</p></div></div> : <div className="rounded-lg border border-[#35271C] bg-[#1F1711] p-4"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-white">Lucas M.</span><div className="flex text-[#E28D38]">{[1, 2, 3, 4, 5].map((item) => <Star key={item} className="h-3 w-3 fill-current" />)}</div></div><p>Arte impecável e procedência 100% verificada no IPFS. Uma das melhores adições à minha coleção este ano!</p></div>}</div>
      </section>

      {relatedNfts.length > 0 && <section className="mt-4"><h3 className="border-b border-[#35271C] pb-2 text-[10px] font-bold uppercase tracking-wider text-[#E28D38]">Mais desta coleção</h3><div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{relatedNfts.map((item) => <div key={item.id} className="w-[calc((100vw-2.25rem)/2)] shrink-0 min-[560px]:w-[calc((100%-3rem)/5)] sm:w-[calc((100%-3rem)/4)]"><NFTCard nft={item} onSelect={onSelectNft} /></div>)}</div></section>}

      {zoomOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" onClick={() => setZoomOpen(false)} role="dialog" aria-modal="true"><button type="button" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 rounded-full bg-[#1F1711] p-2 text-white hover:text-[#E28D38]" aria-label="Fechar"><X className="h-5 w-5" /></button><img src={gallery[selectedImageIndex] || nft.imageUrl} alt={nft.name} className="max-h-[88vh] max-w-full rounded-xl object-contain" onClick={(event) => event.stopPropagation()} /></div>}
    </div>
  );
}

