import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { NFTCategory, NFTFilters, NetworkType } from '../../types';

interface NFTFiltersSidebarProps {
  filters: NFTFilters;
  onFilterChange: (newFilters: Partial<NFTFilters>) => void;
  onReset: () => void;
}

const CATEGORIES: { category: NFTCategory; name: string; count: number }[] = [
  { category: 'arte-digital', name: 'Arte digital', count: 33 },
  { category: 'fotografia', name: 'Fotografia', count: 12 },
  { category: 'musica', name: 'Música', count: 65 },
  { category: 'arte-3d', name: 'Arte 3D', count: 39 },
  { category: 'colecionaveis', name: 'Colecionáveis', count: 23 },
  { category: 'geometrico', name: 'Generativa', count: 17 },
  { category: 'jogos', name: 'Jogos', count: 19 },
  { category: 'aventureiro', name: 'Assinaturas', count: 13 },
  { category: 'utilidade', name: 'Utilidade', count: 18 },
];

const NETWORKS: { label: string; value: NetworkType; count: number }[] = [
  { label: 'Ethereum', value: 'ethereum', count: 119 },
  { label: 'Polygon', value: 'polygon', count: 78 },
  { label: 'Solana', value: 'solana', count: 86 },
];

export function NFTFiltersSidebar({ filters, onFilterChange, onReset }: NFTFiltersSidebarProps) {
  const [minPrice, setMinPrice] = useState(filters.minPrice ? Number(filters.minPrice) : 0.02);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ? Number(filters.maxPrice) : 12.3);

  useEffect(() => {
    if (!filters.minPrice) setMinPrice(0.02);
    if (!filters.maxPrice) setMaxPrice(12.3);
  }, [filters.minPrice, filters.maxPrice]);

  const formatEth = (value: number) => value.toFixed(2).replace('.', ',');
  const minPercent = ((minPrice - 0.02) / 14.98) * 100;
  const maxPercent = ((maxPrice - 0.02) / 14.98) * 100;
  const hasFilters = Boolean(filters.category || filters.network || filters.minPrice || filters.maxPrice);

  return (
    <aside className="w-full shrink-0 text-[10px] font-mono min-[560px]:w-32 sm:w-40 lg:w-48 lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-5">
        <div>
          <h4 className="mb-2 font-sans text-xs font-semibold tracking-wide text-white">Coleções</h4>
          <div className="space-y-0.5">
            {CATEGORIES.map((category) => {
              const active = filters.category === category.category;
              return (
                <button key={category.category} type="button" onClick={() => onFilterChange({ category: active ? undefined : category.category, page: 1 })} className={'flex w-full items-center justify-between gap-1 rounded px-1 py-1 text-left transition-colors ' + (active ? 'font-bold text-[#E28D38]' : 'text-[#B9A899] hover:text-white')}>
                  <span className="truncate">{category.name}</span><span className="shrink-0 text-[9px] text-[#7A6C60]">({category.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-2.5 font-sans text-xs font-semibold tracking-wide text-white">Faixa de preço</h4>
          <div className="relative mb-1 h-5">
            <div className="absolute top-2 h-1 w-full rounded-full bg-[#35271C]" />
            <div className="absolute top-2 h-1 rounded-full bg-[#E28D38]" style={{ left: minPercent + '%', width: Math.max(0, maxPercent - minPercent) + '%' }} />
            <input type="range" min="0.02" max="15" step="0.01" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 0.1))} className="absolute top-2 z-10 h-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#120E0B] [&::-webkit-slider-thumb]:bg-[#E28D38]" aria-label="Preço mínimo em ETH" />
            <input type="range" min="0.02" max="15" step="0.01" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 0.1))} className="absolute top-2 z-20 h-1 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#120E0B] [&::-webkit-slider-thumb]:bg-[#E28D38]" aria-label="Preço máximo em ETH" />
          </div>
          <p className="mb-2 text-[9px] text-[#B9A899]">Preço: {formatEth(minPrice)} - {formatEth(maxPrice)} ETH</p>
          <button type="button" onClick={() => onFilterChange({ minPrice: String(minPrice), maxPrice: String(maxPrice), page: 1 })} className="w-full rounded bg-[#E28D38] py-1.5 text-[10px] font-bold text-[#120E0B] transition-colors hover:bg-[#C27438]">Aplicar</button>
        </div>

        <div>
          <h4 className="mb-2 font-sans text-xs font-semibold tracking-wide text-white">Rede</h4>
          <div className="space-y-0.5">
            {NETWORKS.map((network) => {
              const active = filters.network === network.value;
              return <button key={network.value} type="button" onClick={() => onFilterChange({ network: active ? undefined : network.value, page: 1 })} className={'flex w-full items-center justify-between rounded px-1 py-1 text-left ' + (active ? 'font-bold text-[#E28D38]' : 'text-[#B9A899] hover:text-white')}><span>{network.label}</span><span className="text-[9px] text-[#7A6C60]">({network.count})</span></button>;
            })}
          </div>
        </div>

        {hasFilters && <button type="button" onClick={() => { setMinPrice(0.02); setMaxPrice(12.3); onReset(); }} className="flex w-full items-center justify-center gap-1 rounded border border-[#35271C] py-1.5 text-[10px] text-[#E28D38] hover:border-[#E28D38]/50 hover:text-white"><RotateCcw className="h-3 w-3" /> Limpar filtros</button>}

        <div className="overflow-hidden rounded-lg border border-[#35271C] bg-[#1A1208]">
          <div className="px-2.5 pb-2 pt-3 text-center"><span className="block text-[9px] font-bold uppercase tracking-wider text-[#E28D38]">NFT em destaque</span><h5 className="mt-0.5 text-[10px] font-bold tracking-wide text-white">Oferta limitada</h5></div>
          <div className="h-40 w-full bg-[#EAE5D9] sm:h-48 lg:h-56"><img src="/nfts/ape-featured-banner.png" alt="NFT em destaque" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /></div>
        </div>
      </div>
    </aside>
  );
}
