import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { HeroSection } from '../components/catalog/HeroSection';
import { MintingJournal } from '../components/catalog/MintingJournal';
import { PromotionalBanners } from '../components/catalog/PromotionalBanners';
import { NFTCard } from '../components/nft/NFTCard';
import { NFTFiltersSidebar } from '../components/nft/NFTFiltersSidebar';
import { useNFTs } from '../hooks/useMarketplace';
import type { NFTFilters, SortField } from '../types';

interface HomePageProps {
  onSelectNft: (id: string) => void;
  externalSearch?: string;
}

export function HomePage({ onSelectNft, externalSearch }: HomePageProps) {
  const [filters, setFilters] = useState<NFTFilters>({ page: 1, perPage: 9, sort: 'newest', search: externalSearch || undefined });
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'trending'>('all');
  const { data: response, isLoading, isError } = useNFTs(filters);

  useEffect(() => {
    if (externalSearch !== undefined) setFilters((current) => ({ ...current, search: externalSearch || undefined, page: 1 }));
  }, [externalSearch]);

  const updateFilters = (next: Partial<NFTFilters>) => setFilters((current) => ({ ...current, ...next }));
  const resetFilters = () => {
    setFilters({ page: 1, perPage: 9, sort: 'newest' });
    setActiveTab('all');
  };
  const setTab = (tab: 'all' | 'new' | 'trending') => {
    setActiveTab(tab);
    updateFilters({ sort: tab === 'trending' ? 'rating' : 'newest', page: 1 });
  };
  const scrollToCatalog = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  const nfts = response?.data || [];
  const page = filters.page || 1;

  return (
    <div className="w-full">
      <HeroSection onSelectNft={onSelectNft} onExplore={scrollToCatalog} />
      <div id="catalogo" className="mx-auto max-w-7xl px-4 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <div className="flex flex-col gap-7 min-[560px]:flex-row min-[560px]:items-start min-[560px]:gap-5 lg:gap-8">
          <NFTFiltersSidebar filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />
          <main className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col items-start justify-between gap-3 border-b border-[#35271C]/50 pb-3 font-mono text-[10px] min-[560px]:flex-row min-[560px]:items-center sm:mb-6 sm:text-xs">
              <div className="flex max-w-full items-center gap-4 overflow-x-auto whitespace-nowrap sm:gap-6">
                {[
                  ['all', 'Todos os NFTs'],
                  ['new', 'Novos lançamentos'],
                  ['trending', 'Em alta'],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setTab(value as 'all' | 'new' | 'trending')} className={'shrink-0 border-b-2 pb-1 font-semibold transition-colors ' + (activeTab === value ? 'border-[#E28D38] text-[#E28D38]' : 'border-transparent text-[#B9A899] hover:text-white')}>
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex shrink-0 items-center gap-1.5 text-[10px] text-[#B9A899] sm:text-xs">
                Ordenar por:
                <select value={filters.sort || 'newest'} onChange={(event) => updateFilters({ sort: event.target.value as SortField, page: 1 })} className="max-w-[135px] cursor-pointer border-none bg-transparent font-mono text-[10px] text-white outline-none sm:text-xs">
                  <option value="newest" className="bg-[#1F1711]">Mais recentes</option>
                  <option value="price_asc" className="bg-[#1F1711]">Menor preço</option>
                  <option value="price_desc" className="bg-[#1F1711]">Maior preço</option>
                  <option value="rating" className="bg-[#1F1711]">Melhor avaliação</option>
                  <option value="name" className="bg-[#1F1711]">Nome (A-Z)</option>
                </select>
              </label>
            </div>

            {filters.search && (
              <div className="mb-5 flex items-center justify-between rounded-lg border border-[#35271C] bg-[#1F1711] p-3 text-[10px]">
                <span className="text-[#B9A899]">Resultados para: <strong className="text-white">"{filters.search}"</strong></span>
                <button type="button" onClick={() => updateFilters({ search: undefined, page: 1 })} className="text-[#E28D38] hover:underline">Limpar</button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="aspect-square animate-pulse rounded-lg border border-[#35271C] bg-[#1F1711]" />)}</div>
            ) : isError ? (
              <div className="rounded-xl border border-[#35271C] bg-[#1F1711] py-16 text-center"><p className="mb-3 text-xs text-red-400">Falha ao carregar o catálogo.</p><button type="button" onClick={resetFilters} className="rounded-lg bg-[#E28D38] px-4 py-2 text-xs font-semibold text-[#120E0B]">Tentar novamente</button></div>
            ) : nfts.length === 0 ? (
              <div className="rounded-xl border border-[#35271C] bg-[#1F1711] px-4 py-20 text-center"><Sparkles className="mx-auto mb-3 h-9 w-9 text-[#7A6C60]" /><h4 className="text-sm font-semibold text-white">Nenhum NFT encontrado</h4><button type="button" onClick={resetFilters} className="mt-5 rounded-lg bg-[#E28D38] px-5 py-2.5 text-xs font-semibold text-[#120E0B]">Restaurar filtros</button></div>
            ) : (
              <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3 sm:gap-5">{nfts.map((nft) => <NFTCard key={nft.id} nft={nft} onSelect={onSelectNft} />)}</div>
            )}

            <div className="mt-7 flex items-center justify-end gap-1.5 border-t border-[#35271C]/50 pt-4">
              {[1, 2, 3, 4].map((item) => <button key={item} type="button" onClick={() => updateFilters({ page: item })} className={'flex h-7 w-7 items-center justify-center rounded font-mono text-xs font-bold transition-colors ' + (page === item ? 'bg-[#E28D38] text-[#120E0B]' : 'border border-[#35271C] bg-[#1F1711] text-[#B9A899] hover:text-white')}>{item}</button>)}
              <button type="button" onClick={() => updateFilters({ page: Math.min(4, page + 1) })} disabled={page >= 4} className="flex h-7 w-7 items-center justify-center rounded border border-[#35271C] bg-[#1F1711] text-[#B9A899] disabled:cursor-not-allowed disabled:opacity-30" aria-label="Próxima página"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </main>
        </div>
        <PromotionalBanners onExplore={scrollToCatalog} />
        <MintingJournal />
      </div>
    </div>
  );
}
