import { ArrowRight } from 'lucide-react';

interface PromotionalBannersProps {
  onExplore: () => void;
}

export function PromotionalBanners({ onExplore }: PromotionalBannersProps) {
  return (
   <section className="my-16 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#1F1711] border border-[#35271C] flex items-stretch group hover:border-[#E28D38] transition-all">
        <div className="w-40 sm:w-48 shrink-0 overflow-hidden rounded-lg border-r border-[#35271C] bg-[#EAE5D9]">
          <img
            src="/nfts/chimp-emerald-mines.png"
            alt="Lançamentos gênesis"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
          />
        </div>
        <div className="p-5 sm:p-6 flex flex-col justify-center items-end text-right flex-1">
          <div className="max-w-[220px] sm:max-w-[260px] flex flex-col items-end">
            <h3 className="font-heading font-bold text-base sm:text-lg text-white mb-2 leading-snug">
              Lançamentos gênesis de edição limitada
            </h3>
            <p className="text-xs text-[#B9A899] mb-4">
              Colecione edições escassas diretamente dos criadores antes da revelação pública.
            </p>
            <div>
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D28A4C] hover:bg-[#C27438] text-white text-xs font-semibold transition-colors shadow-md"
              >
                <span>Explorar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-[#1F1711] border border-[#35271C] flex items-stretch group hover:border-[#E28D38] transition-all">
        <div className="w-40 sm:w-48 shrink-0 overflow-hidden rounded-lg border-r border-[#35271C] bg-[#EAE5D9]">
          <img
            src="/nfts/fox-sunglasses.png"
            alt="Arte digital selecionada"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
          />
        </div>
        <div className="p-5 sm:p-6 flex flex-col justify-center items-end text-right flex-1">
          <div className="max-w-[220px] sm:max-w-[260px] flex flex-col items-end">
            <h3 className="font-heading font-bold text-base sm:text-lg text-white mb-2 leading-snug">
              Arte digital selecionada e muito mais
            </h3>
            <p className="text-xs text-[#B9A899] mb-4">
              Explore novos artistas com coleções verificadas e obras digitais que definem tendências.
            </p>
            <div>
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D28A4C] hover:bg-[#C27438] text-white text-xs font-semibold transition-colors shadow-md"
              >
                <span>Explorar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
