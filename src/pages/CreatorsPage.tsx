import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, BarChart3, CalendarRange, ChevronLeft, ExternalLink, Sparkles, TrendingUp, Users, WalletCards } from 'lucide-react';
import { NFTCard } from '../components/nft/NFTCard';
import { NFTS } from '../mocks/fixtures';

type RankingPeriod = 'week' | 'month';

interface CreatorMetrics {
  volume: string;
  sales: number;
  change: string;
  collectors: number;
}

interface Creator {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location: string;
  website: string;
  metrics: Record<RankingPeriod, CreatorMetrics>;
}

const CREATOR_DETAILS: Creator[] = [
  {
    id: 'creator-kurio',
    displayName: 'Jungle Apes',
    handle: '@jungleapes',
    avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=JungleApes',
    coverUrl: '/nfts/captain-parrot-treasure.png',
    bio: 'Uma coleção de personagens selvagens para quem encontra beleza no caos da selva digital.',
    location: 'São Paulo, Brasil',
    website: 'jungleapes.xyz',
    metrics: { week: { volume: '18.42', sales: 36, change: '+24,8%', collectors: 214 }, month: { volume: '64.80', sales: 112, change: '+41,2%', collectors: 608 } },
  },
  {
    id: 'creator-neon',
    displayName: 'Wild Vaults',
    handle: '@wildvaults',
    avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=WildVaults',
    coverUrl: '/nfts/fox-sunglasses.png',
    bio: 'Arte digital, música e sinais luminosos vindos do lado mais experimental da web3.',
    location: 'Lisboa, Portugal',
    website: 'wildvaults.art',
    metrics: { week: { volume: '13.90', sales: 29, change: '+18,6%', collectors: 172 }, month: { volume: '49.35', sales: 84, change: '+32,7%', collectors: 441 } },
  },
  {
    id: 'creator-pixel',
    displayName: 'SavannaCraft',
    handle: '@savannacraft',
    avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=SavannaCraft',
    coverUrl: '/nfts/goblin-gold-hoard.png',
    bio: 'Paisagens, animais e mitologias tropicais renderizados entre o analógico e o cósmico.',
    location: 'Recife, Brasil',
    website: 'savannacraft.studio',
    metrics: { week: { volume: '10.76', sales: 21, change: '+12,3%', collectors: 138 }, month: { volume: '38.12', sales: 61, change: '+27,1%', collectors: 326 } },
  },
];

interface CreatorsPageProps {
  onSelectNft: (id: string) => void;
}

export function CreatorsPage({ onSelectNft }: CreatorsPageProps) {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const ranking = useMemo(() => [...CREATOR_DETAILS].sort((a, b) => Number.parseFloat(b.metrics[period].volume) - Number.parseFloat(a.metrics[period].volume)), [period]);
  const selectedCreator = CREATOR_DETAILS.find((creator) => creator.id === selectedCreatorId);

  if (selectedCreator) {
    return <CreatorProfile creator={selectedCreator} onBack={() => setSelectedCreatorId(null)} onSelectNft={onSelectNft} />;
  }

  const totalVolume = ranking.reduce((total, creator) => total + Number.parseFloat(creator.metrics[period].volume), 0);

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-[#35271C]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">Pessoas por trás da <span className="text-[#E28D38]">próxima cultura.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#B9A899] sm:text-base">Descubra artistas, estúdios e comunidades que estão criando as coleções mais desejadas da selva digital.</p>
          </div>
          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Criadores ativos', value: '128', icon: Users },
              { label: 'Volume nesta janela', value: totalVolume.toFixed(2) + ' ETH', icon: BarChart3 },
              { label: 'Coleções verificadas', value: '42', icon: BadgeCheck },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#35271C] bg-[#1F1711]/80 p-4"><stat.icon className="h-4 w-4 text-[#E28D38]" /><p className="mt-4 text-xl font-bold text-white">{stat.value}</p><p className="mt-1 text-[11px] text-[#7A6C60]">{stat.label}</p></div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-mono uppercase tracking-[0.25em] text-[#E28D38]">Ranking</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Criadores em destaque</h2><p className="mt-2 text-sm text-[#B9A899]">Quem está movimentando a comunidade agora.</p></div>
          <div className="flex rounded-xl border border-[#35271C] bg-[#1F1711] p-1">
            {([['week', 'Esta semana'], ['month', 'Este mês']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setPeriod(value)} className={'rounded-lg px-4 py-2 text-xs font-semibold transition-colors ' + (period === value ? 'bg-[#E28D38] text-[#120E0B]' : 'text-[#B9A899] hover:text-white')}>{label}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {ranking.map((creator, index) => {
            const metrics = creator.metrics[period];
            const nftCount = NFTS.filter((nft) => nft.creator.id === creator.id).length;
            return (
              <article key={creator.id} className={'group relative overflow-hidden rounded-2xl border bg-[#1F1711] p-5 transition-all hover:-translate-y-1 hover:border-[#E28D38] ' + (index === 0 ? 'border-[#E28D38]/60 shadow-[0_0_30px_rgba(226,141,56,0.12)]' : 'border-[#35271C]')}>
                <div className="flex items-start justify-between"><span className={'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ' + (index === 0 ? 'bg-[#E28D38] text-[#120E0B]' : 'bg-[#271E17] text-[#B9A899]')}>{String(index + 1).padStart(2, '0')}</span><span className="flex items-center gap-1 text-[11px] font-mono text-[#55C987]"><TrendingUp className="h-3.5 w-3.5" />{metrics.change}</span></div>
                <div className="mt-6 flex items-center gap-3"><img src={creator.avatarUrl} alt="" className="h-14 w-14 rounded-full border border-[#E28D38]/50 bg-[#271E17]" /><div><div className="flex items-center gap-1.5"><h3 className="font-bold text-white">{creator.displayName}</h3><BadgeCheck className="h-4 w-4 fill-[#E28D38] text-[#120E0B]" /></div><p className="text-xs text-[#7A6C60]">{creator.handle}</p></div></div>
                <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#35271C] py-4"><div><p className="text-[10px] uppercase tracking-wider text-[#7A6C60]">Volume</p><p className="mt-1 font-bold text-[#E28D38]">{metrics.volume} ETH</p></div><div><p className="text-[10px] uppercase tracking-wider text-[#7A6C60]">Vendas</p><p className="mt-1 font-bold text-white">{metrics.sales}</p></div></div>
                <p className="mb-5 mt-4 text-xs text-[#B9A899]">{nftCount} obras listadas na Kurio</p>
                <button type="button" onClick={() => setSelectedCreatorId(creator.id)} className="flex w-full items-center justify-between rounded-lg border border-[#35271C] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#E28D38] hover:text-[#E28D38]">Ver perfil e coleção <ArrowRight className="h-4 w-4" /></button>
              </article>
            );
          })}
        </div>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-mono uppercase tracking-[0.25em] text-[#E28D38]">Explorar</p><h2 className="mt-2 text-2xl font-bold text-white">Novos nomes para acompanhar</h2></div><CalendarRange className="h-5 w-5 text-[#7A6C60]" /></div>
          <div className="grid gap-4 md:grid-cols-3">
            {CREATOR_DETAILS.map((creator) => <button type="button" key={creator.id} onClick={() => setSelectedCreatorId(creator.id)} className="flex items-center gap-4 rounded-xl border border-[#35271C] bg-[#18120D] p-4 text-left transition-colors hover:border-[#E28D38]"><img src={creator.avatarUrl} alt="" className="h-11 w-11 rounded-full bg-[#271E17]" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{creator.displayName}</strong><span className="mt-1 block truncate text-xs text-[#7A6C60]">{creator.handle}</span></span><ExternalLink className="h-4 w-4 text-[#7A6C60]" /></button>)}
          </div>
        </section>
      </main>
    </div>
  );
}

function CreatorProfile({ creator, onBack, onSelectNft }: { creator: Creator; onBack: () => void; onSelectNft: (id: string) => void }) {
  const collection = NFTS.filter((nft) => nft.creator.id === creator.id);
  const monthMetrics = creator.metrics.month;
  return (
    <div className="w-full">
      <section className="relative border-b border-[#35271C]">
        <div className="h-48 overflow-hidden bg-[#1F1711] sm:h-64"><img src={creator.coverUrl} alt="" className="h-full w-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-[#120E0B] via-[#120E0B]/35 to-transparent" /></div>
        <div className="relative mx-auto -mt-12 max-w-7xl px-4 pb-10 sm:-mt-16 sm:px-6 lg:px-8">
          <button type="button" onClick={onBack} className="mb-8 flex items-center gap-2 text-xs text-[#B9A899] hover:text-white"><ChevronLeft className="h-4 w-4" /> Voltar para criadores</button>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end"><img src={creator.avatarUrl} alt={creator.displayName} className="h-28 w-28 rounded-full border-4 border-[#120E0B] bg-[#271E17] sm:h-36 sm:w-36" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold text-white">{creator.displayName}</h1><BadgeCheck className="h-5 w-5 fill-[#E28D38] text-[#120E0B]" /></div><p className="mt-1 text-sm text-[#7A6C60]">{creator.handle} · {creator.location}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-[#B9A899]">{creator.bio}</p></div><a href={'https://' + creator.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#35271C] px-4 py-2.5 text-xs font-semibold text-white hover:border-[#E28D38] hover:text-[#E28D38]">Visitar site <ExternalLink className="h-3.5 w-3.5" /></a></div>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Volume no mês', value: monthMetrics.volume + ' ETH', icon: BarChart3 },
            { label: 'Vendas', value: monthMetrics.sales, icon: WalletCards },
            { label: 'Colecionadores', value: monthMetrics.collectors, icon: Users },
            { label: 'Coleção', value: collection.length + ' itens', icon: Sparkles },
          ].map((stat) => <div key={stat.label} className="rounded-xl border border-[#35271C] bg-[#1F1711] p-4"><stat.icon className="h-4 w-4 text-[#E28D38]" /><p className="mt-4 text-lg font-bold text-white">{stat.value}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-[#7A6C60]">{stat.label}</p></div>)}
        </div>
        <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-mono uppercase tracking-[0.25em] text-[#E28D38]">Coleção completa</p><h2 className="mt-2 text-2xl font-bold text-white">Obras de {creator.displayName}</h2></div><p className="text-xs text-[#7A6C60]">{collection.length} itens</p></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">{collection.map((nft) => <NFTCard key={nft.id} nft={nft} onSelect={onSelectNft} />)}</div>
      </main>
    </div>
  );
}
