import { useState, useMemo, useCallback, useEffect, type ComponentProps } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { ChevronDown, SlidersHorizontal, SearchX, X } from 'lucide-react';
import type { NFTFilters } from '../types';
import { useNFTs } from '../hooks/useMarketplace';
import { NFTCard } from '../components/nft/NFTCard';
import { NFTFiltersSidebar } from '../components/nft/NFTFiltersSidebar';
import { Pagination } from '../components/ui';


// 9 itens por página = grade 3x3 (a tela nunca cresce além disso)
const PER_PAGE = 9;
type MarketTab = 'all' | 'new' | 'trending';
type MarketSort = 'recent' | 'price-asc' | 'price-desc' | 'popular';

const TABS: { id: MarketTab; label: string }[] = [
  { id: 'all', label: 'Todos os NFTs' },
  { id: 'new', label: 'Novos lançamentos' },
  { id: 'trending', label: 'Em alta' },
];

const SORT_OPTIONS: { value: MarketSort; label: string }[] = [
  { value: 'recent', label: 'Listados recentemente' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'popular', label: 'Mais populares' },
];

const CATEGORY_NAMES: Record<string, string> = {
  'arte-digital': 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  'arte-3d': 'Arte 3D',
  colecionaveis: 'Colecionáveis',
  geometrico: 'Generativa',
  jogos: 'Jogos',
  aventureiro: 'Assinaturas',
  utilidade: 'Utilidade',
};

const NETWORK_NAMES: Record<string, string> = {
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  solana: 'Solana',
};

type NFTItem = ComponentProps<typeof NFTCard>['nft'];

interface NFTListPayload {
  data?: NFTItem[];
  total?: number;
  totalPages?: number;
  meta?: { total?: number; totalPages?: number };
  pagination?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}
const formatEth = (value: string | number) => Number(value).toFixed(2).replace('.', ',');


interface MarketPageProps {
  onSelectNft: (id: string) => void;
}

export function MarketPage({ onSelectNft }: MarketPageProps) {
  const location = useLocation();
  const navigate = useNavigate({ from: '/market' });
  const [showFilters, setShowFilters] = useState(false);
  const params = useMemo(() => new URLSearchParams(location.searchStr), [location.searchStr]);

  const filters = useMemo<NFTFilters>(() => ({
    search: params.get('q') || undefined,
    category: (params.get('category') || undefined) as NFTFilters['category'],
    collection: params.get('collection') || undefined,
    network: (params.get('network') || undefined) as NFTFilters['network'],
    minPrice: params.get('minPrice') || undefined,
    maxPrice: params.get('maxPrice') || undefined,
    page: Math.max(1, Number(params.get('page') || 1)),
  }), [params]);

  const tab: MarketTab = params.get('tab') === 'new' || params.get('tab') === 'trending' ? params.get('tab') as MarketTab : 'all';
  const sort: MarketSort = SORT_OPTIONS.some((option) => option.value === params.get('sort')) ? params.get('sort') as MarketSort : 'recent';
  const page = filters.page ?? 1;
  const search = filters.search;

  const updateUrl = useCallback((nextFilters: NFTFilters, nextTab: MarketTab = tab, nextSort: MarketSort = sort) => {
    const nextSearch: Record<string, string> = {};
    const values: Record<string, string | undefined> = {
      q: nextFilters.search,
      category: nextFilters.category,
      collection: nextFilters.collection,
      network: nextFilters.network,
      minPrice: nextFilters.minPrice,
      maxPrice: nextFilters.maxPrice,
      page: nextFilters.page && nextFilters.page > 1 ? String(nextFilters.page) : undefined,
      tab: nextTab !== 'all' ? nextTab : undefined,
      sort: nextSort !== 'recent' ? nextSort : undefined,
    };
    Object.entries(values).forEach(([key, value]) => { if (value) nextSearch[key] = value; });
    navigate({ search: nextSearch } as never);
  }, [navigate, sort, tab]);

  const updateFilters = useCallback((partial: Partial<NFTFilters>) => {
    updateUrl({ ...filters, ...partial, page: partial.page ?? 1 });
  }, [filters, updateUrl]);

  const resetFilters = useCallback(() => updateUrl({ page: 1, search }, tab, sort), [search, sort, tab, updateUrl]);
  const clearSearch = useCallback(() => updateUrl({ ...filters, search: undefined, page: 1 }, tab, sort), [filters, sort, tab, updateUrl]);
  const changeTab = (next: MarketTab) => updateUrl({ ...filters, page: 1 }, next, sort);
  const changeSort = (next: MarketSort) => updateUrl({ ...filters, page: 1 }, tab, next);
  const mappedSort = useMemo(() => {
    switch (sort) {
      case 'price-asc':
        return 'price_asc' as const;
      case 'price-desc':
        return 'price_desc' as const;
      case 'popular':
        return 'rating' as const;
      case 'recent':
      default:
        return 'newest' as const;
    }
  }, [sort]);

  const query = useMemo(() => {
    const q: NFTFilters = {
      ...filters,
      page,
      perPage: PER_PAGE,
      sort: tab === 'new' ? 'newest' : tab === 'trending' ? 'rating' : mappedSort,
      search,
    };
    return q;
  }, [filters, page, mappedSort, tab, search]);

  const { data, isLoading, isFetching, isError, refetch } = useNFTs(query);

  const payload = (data ?? {}) as NFTListPayload;
  const rawItems = payload.data ?? [];
  const serverTotal = payload.pagination?.total ?? payload.total ?? payload.meta?.total;
  const serverPages = payload.pagination?.totalPages ?? payload.totalPages ?? payload.meta?.totalPages;

  // Se a API devolveu tudo de uma vez (dados mock não fatiados), fatiamos aqui
  const isUnpaginated = serverTotal === undefined && serverPages === undefined && rawItems.length > PER_PAGE;
  const total = isUnpaginated
    ? rawItems.length
    : serverTotal ?? (serverPages ? serverPages * PER_PAGE : rawItems.length);
  const totalPages = Math.max(1, serverPages ?? Math.ceil(total / PER_PAGE));
  const items = isUnpaginated ? rawItems.slice((page - 1) * PER_PAGE, page * PER_PAGE) : rawItems;

  const rangeStart = items.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const rangeEnd = items.length === 0 ? 0 : (page - 1) * PER_PAGE + items.length;

  // Se a página atual deixou de existir (ex.: filtro reduziu os resultados), volta para a última válida
  useEffect(() => {
    if (!isLoading && !isFetching && page > totalPages) updateFilters({ page: totalPages });
  }, [page, totalPages, isLoading, isFetching, updateFilters]);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.category) {
    chips.push({
      key: 'category',
      label: CATEGORY_NAMES[filters.category] ?? String(filters.category),
      onRemove: () => updateFilters({ category: undefined, page: 1 }),
    });
  }
  if (filters.network) {
    chips.push({
      key: 'network',
      label: NETWORK_NAMES[filters.network] ?? String(filters.network),
      onRemove: () => updateFilters({ network: undefined, page: 1 }),
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'price',
      label: `${formatEth(filters.minPrice ?? 0.02)} ”“ ${formatEth(filters.maxPrice ?? 12.3)} ETH`,
      onRemove: () => updateFilters({ minPrice: undefined, maxPrice: undefined, page: 1 }),
    });
  }
  if (search) {
    chips.push({ key: 'search', label: `Busca: “${search}”`, onRemove: clearSearch });
  }

  const clearAll = () => {
    resetFilters();
    clearSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-mono">
      <header className="mb-6">
        <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">Mercado</h1>
        <p className="text-xs text-[#B9A899] mt-1.5 max-w-xl">
          Explore coleções, filtre por rede e preço e encontre o próximo NFT para a sua coleção.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          aria-expanded={showFilters}
          className="lg:hidden flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-[#35271C] text-xs text-white hover:border-[#E28D38]/60 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#E28D38]" />
          <span>{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
          {chips.length > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-[#E28D38] text-[#120E0B] text-[11px] font-bold flex items-center justify-center">
              {chips.length}
            </span>
          )}
        </button>

        {/*
          lg:contents → no desktop o wrapper "some" do layout e o <aside> vira filho direto
          do flex, o que mantém o position: sticky da sidebar funcionando.
        */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:contents`}>
          <NFTFiltersSidebar filters={filters} onFilterChange={updateFilters} onReset={resetFilters} />
        </div>

        <main className="flex-1 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-[#35271C] mb-4">
            <div role="tablist" aria-label="Seções do mercado" className="flex items-center gap-5">
              {TABS.map((t) => {
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => changeTab(t.id)}
                    className={`text-[11px] font-semibold pb-2 -mb-px border-b-2 transition-colors ${
                      isActive
                        ? 'text-[#E28D38] border-[#E28D38]'
                        : 'text-[#B9A899] border-transparent hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2 text-[11px] text-[#B9A899] pb-2">
              <span>Ordenar por:</span>
              <span className="relative inline-flex items-center">
                <select
                  value={sort}
                  onChange={(e) => changeSort(e.target.value as MarketSort)}
                  className="appearance-none bg-transparent text-white font-semibold pr-5 cursor-pointer focus:outline-none focus-visible:text-[#E28D38]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1F1711] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 pointer-events-none text-white" />
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-5 min-h-6">
            <span className="text-[11px] text-[#7A6C60]" aria-live="polite">
              {isLoading
                ? 'Carregando NFTs…'
                : total === 0
                  ? 'Nenhum resultado'
                  : `Mostrando ${rangeStart}”“${rangeEnd} de ${total} NFTs`}
            </span>

            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remover filtro ${chip.label}`}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full border border-[#E28D38]/50 bg-[#E28D38]/10 text-[11px] text-[#E28D38] hover:bg-[#E28D38]/20 transition-colors"
              >
                <span>{chip.label}</span>
                <X className="w-3 h-3" />
              </button>
            ))}

            {chips.length > 1 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-[#B9A899] underline underline-offset-2 hover:text-white transition-colors"
              >
                Limpar tudo
              </button>
            )}
          </div>

          {isError ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-20 rounded-xl border border-[#35271C] bg-[#1A1208]">
              <p className="text-sm text-white font-semibold">Não foi possível carregar os NFTs.</p>
              <p className="text-xs text-[#B9A899]">Verifique sua conexão e tente novamente.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-1.5 rounded bg-[#E28D38] hover:bg-[#C27438] text-[#120E0B] text-[11px] font-bold transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#1F1711] border border-[#35271C] overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-[#2A1E15]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-2/3 bg-[#2A1E15] rounded" />
                    <div className="h-3 w-1/4 bg-[#2A1E15] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-20 rounded-xl border border-[#35271C] bg-[#1A1208]">
              <SearchX className="w-8 h-8 text-[#E28D38]" />
              <p className="text-sm text-white font-semibold">Nenhum NFT encontrado</p>
              <p className="text-xs text-[#B9A899] max-w-xs">
                Nada combina com os filtros atuais. Tente ampliar a faixa de preço ou remover algum filtro.
              </p>
              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-4 py-1.5 rounded bg-[#E28D38] hover:bg-[#C27438] text-[#120E0B] text-[11px] font-bold transition-colors"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${
                isFetching ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {items.map((item) => (
                <NFTCard key={item.id} nft={item} onSelect={onSelectNft} />
              ))}
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
              <span className="text-[11px] text-[#7A6C60]">
                Página {page} de {totalPages}
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(next) => updateFilters({ page: next })}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}





