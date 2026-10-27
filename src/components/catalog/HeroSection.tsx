import { ArrowDown, Flame } from 'lucide-react';

interface HeroSectionProps {
  onSelectNft: (id: string) => void;
  onExplore: () => void;
}

export function HeroSection({ onSelectNft, onExplore }: HeroSectionProps) {
  const nft = { id: 'nft-001', name: 'Parrot Pirate Scout #001', priceEth: '0.99', imageUrl: '/nfts/parrot-pirate-scout.png', collection: 'Pirate Scouts', editions: [{ id: 'ed-001', name: 'Edição 1/50', label: '1/50', totalSupply: 50, available: 42 }] };
  return (
    <section className="relative w-full overflow-hidden border-b border-[#35271C]/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_42%,rgba(226,141,56,0.08),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-8 min-[560px]:grid-cols-12 min-[560px]:gap-5 lg:gap-12">
          <div className="min-[560px]:col-span-7">
            <p className="mb-4 text-[9px] font-mono uppercase tracking-[0.28em] text-[#B9A899] sm:text-[10px]">Bem-vindo à Kurio</p>
            <h1 className="max-w-[520px] font-heading text-[28px] font-bold leading-[1.2] tracking-[0.04em] text-white sm:text-4xl lg:text-[44px]">SEJA DONO DO FUTURO DA <span className="text-[#E28D38]">ARTE DIGITAL</span></h1>
            <p className="mt-4 max-w-[430px] text-[10px] leading-5 text-[#B9A899] sm:text-xs sm:leading-6">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura digital verificada na blockchain.</p>
            <button onClick={onExplore} className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#D28A4C] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_4px_18px_rgba(226,141,56,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#C27438] active:translate-y-0">Explorar <ArrowDown className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex justify-start min-[560px]:col-span-5 min-[560px]:justify-end">
            <button type="button" onClick={() => onSelectNft(nft.id)} className="group relative w-full max-w-[220px] overflow-hidden rounded-xl bg-[#EAE5D9] text-left shadow-[0_12px_36px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1 min-[560px]:max-w-[190px] sm:max-w-[230px] lg:max-w-[270px]" aria-label={'Ver NFT em destaque ' + nft.name}>
              <div className="aspect-square overflow-hidden"><img src={nft.imageUrl} alt={nft.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="eager" /></div>
              <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#120E0B]/80 px-2 py-1 text-[9px] font-semibold text-[#E28D38] backdrop-blur-sm"><Flame className="h-3 w-3 fill-current" /> Destaque</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
