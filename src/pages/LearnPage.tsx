import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ChevronLeft, Clock3, LockKeyhole, Network, Search, ShieldCheck, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ArticleCategory = 'Fundamentos' | 'Carteiras' | 'Blockchain' | 'Segurança';

interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  summary: string;
  readTime: string;
  imageUrl: string;
  accent: string;
  content: string[];
  takeaways: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'nft-101',
    category: 'Fundamentos',
    title: 'NFTs sem mistério: o que você está colecionando?',
    summary: 'Um guia direto para entender tokens, propriedade digital, raridade e procedência.',
    readTime: '6 min',
    imageUrl: '/nfts/parrot-pirate-scout.png',
    accent: 'from-[#E28D38]/70 to-[#5B2F16]/90',
    content: ['NFT significa token não fungível: um registro único em uma rede blockchain que aponta para uma peça digital, uma edição ou um benefício. Diferente de uma moeda, cada token tem identidade e histórico próprios.', 'Ao comprar um NFT, você adquire a posse do token na sua carteira. A imagem, o áudio ou o item pode estar armazenado fora da blockchain, então sempre vale conferir o contrato, a coleção e os direitos descritos pelo criador.', 'Raridade é uma ferramenta de descoberta, não uma garantia de valor. Observe a procedência, o trabalho do artista, a liquidez da coleção e o que a comunidade está construindo ao redor dela.'],
    takeaways: ['O token é um registro verificável de propriedade.', 'Confira contrato, coleção e rede antes de comprar.', 'Preço e raridade não substituem pesquisa.'],
  },
  {
    id: 'wallet-start',
    category: 'Carteiras',
    title: 'Sua primeira carteira cripto em poucos passos',
    summary: 'Como escolher uma carteira, guardar sua frase-semente e conectar-se a um marketplace.',
    readTime: '8 min',
    imageUrl: '/nfts/chimp-emerald-mines.png',
    accent: 'from-[#3E8EB3]/70 to-[#142F3C]/90',
    content: ['Uma carteira cripto é a ferramenta que permite controlar suas chaves e assinar transações. Ela não “guarda” seus NFTs como uma galeria tradicional: a blockchain registra a posse, e a carteira dá acesso a ela.', 'Para começar, instale uma carteira reconhecida diretamente do site oficial, crie uma conta e anote a frase-semente em papel. Nunca fotografe, envie por mensagem ou digite essa frase em um site recebido por link.', 'Depois, escolha a rede compatível com o item que deseja comprar, abasteça a carteira com uma pequena quantia para a compra e as taxas, e só então conecte-a à Kurio.'],
    takeaways: ['A frase-semente é a chave-mestra da sua carteira.', 'Use links oficiais e teste com pequenas quantias.', 'Confira a rede antes de assinar qualquer transação.'],
  },
  {
    id: 'ethereum-solana',
    category: 'Blockchain',
    title: 'Ethereum ou Solana: como escolher uma rede?',
    summary: 'Entenda as diferenças práticas entre as duas redes mais populares para colecionáveis.',
    readTime: '7 min',
    imageUrl: '/nfts/chimp-map-explorer.png',
    accent: 'from-[#8568D5]/70 to-[#261C46]/90',
    content: ['Ethereum é uma rede ampla, com uma comunidade muito grande e um ecossistema maduro de contratos, ferramentas e coleções. Em períodos de alta demanda, suas taxas podem subir.', 'Solana foi desenhada para processar transações rápidas com custos menores, o que pode ser interessante para experiências com muitas interações. Ela usa ferramentas e carteiras próprias, diferentes das usadas no ecossistema Ethereum.', 'Não existe uma rede “melhor” para todos os casos. Compare a rede do NFT, a carteira compatível, as taxas e os marketplaces disponíveis antes de movimentar fundos.'],
    takeaways: ['A rede determina carteira, taxas e compatibilidade.', 'Ethereum tem ecossistema amplo; Solana privilegia velocidade e custo.', 'Nunca envie ativos entre redes sem uma ponte compatível.'],
  },
  {
    id: 'wallet-safety',
    category: 'Segurança',
    title: 'Checklist para manter sua carteira segura',
    summary: 'Cinco hábitos simples para evitar golpes, sites falsos e assinaturas perigosas.',
    readTime: '5 min',
    imageUrl: '/nfts/goblin-treasure-keeper.png',
    accent: 'from-[#3EB370]/70 to-[#153B28]/90',
    content: ['A segurança começa pelo navegador: salve o endereço da Kurio, evite links recebidos por mensagens e confirme o domínio antes de conectar a carteira.', 'Leia o que está sendo assinado. Uma solicitação que pede aprovação ilimitada ou transfere um ativo merece uma pausa. Quando possível, limite permissões e revogue acessos antigos.', 'Nenhum suporte legítimo pedirá sua frase-semente ou sua chave privada. Em caso de dúvida, cancele a transação e procure a central de ajuda pelos canais oficiais.'],
    takeaways: ['Nunca compartilhe frase-semente ou chave privada.', 'Confira domínio, rede e permissões antes de assinar.', 'Desconfie de urgência, brindes e mensagens privadas.'],
  },
  {
    id: 'collectors-routine',
    category: 'Fundamentos',
    title: 'Como pesquisar uma coleção antes de comprar',
    summary: 'Um roteiro para avaliar criador, comunidade, contrato e histórico de vendas.',
    readTime: '4 min',
    imageUrl: '/nfts/captain-parrot-treasure.png',
    accent: 'from-[#B05C9C]/70 to-[#371C32]/90',
    content: ['Comece pela fonte: encontre o perfil oficial do criador, confirme a coleção e compare o endereço do contrato com o publicado pelos canais oficiais.', 'Observe o histórico de vendas e a distribuição de holders, mas lembre que números passados não garantem retorno futuro. A melhor compra é aquela que faz sentido para você como colecionador.', 'Por fim, leia a descrição dos direitos, veja a atividade da comunidade e estabeleça um orçamento que não comprometa suas finanças.'],
    takeaways: ['Verifique o contrato na fonte oficial.', 'Analise contexto, não apenas volume.', 'Colecione dentro de um orçamento confortável.'],
  },
];

const CATEGORIES: { label: ArticleCategory; icon: LucideIcon }[] = [
  { label: 'Fundamentos', icon: BookOpen },
  { label: 'Carteiras', icon: WalletCards },
  { label: 'Blockchain', icon: Network },
  { label: 'Segurança', icon: ShieldCheck },
];

export function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'Todos'>('Todos');
  const [search, setSearch] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const filteredArticles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const categoryMatches = activeCategory === 'Todos' || article.category === activeCategory;
      const searchMatches = !normalizedSearch || (article.title + ' ' + article.summary + ' ' + article.category).toLowerCase().includes(normalizedSearch);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, search]);
  const selectedArticle = ARTICLES.find((article) => article.id === selectedArticleId);

  if (selectedArticle) return <ArticleReader article={selectedArticle} onBack={() => setSelectedArticleId(null)} />;
  const featuredArticle = ARTICLES[0];

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-[#35271C]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">Aprenda no seu ritmo. <span className="text-[#E28D38]">Colecione com confiança.</span></h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#B9A899] sm:text-base">Guias claros para dar os primeiros passos no universo dos NFTs, entender blockchains e proteger o que é seu.</p>
            <label className="mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-[#35271C] bg-[#1F1711] px-4 py-3 focus-within:border-[#E28D38]"><Search className="h-4 w-4 shrink-0 text-[#7A6C60]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque um guia, rede ou assunto..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#7A6C60]" /></label>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <button type="button" onClick={() => setSelectedArticleId(featuredArticle.id)} className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-[#35271C] text-left">
            <img src={featuredArticle.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className={'absolute inset-0 bg-gradient-to-t ' + featuredArticle.accent} />
            <div className="relative flex h-full min-h-[360px] flex-col justify-end p-6 sm:p-8"><span className="mb-4 w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-sm">Destaque da semana</span><h2 className="max-w-2xl text-2xl font-bold leading-tight text-white sm:text-3xl">{featuredArticle.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{featuredArticle.summary}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-[#FFD3A5]">Começar leitura <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
          </button>
          <div className="rounded-2xl border border-[#35271C] bg-[#1F1711] p-6 sm:p-8"><p className="text-xs font-mono uppercase tracking-[0.25em] text-[#E28D38]">Trilha para começar</p><h2 className="mt-3 text-2xl font-bold text-white">Do zero à primeira coleção</h2><p className="mt-3 text-sm leading-6 text-[#B9A899]">Uma sequência simples para entender o essencial sem se perder no jargão.</p><div className="mt-8 space-y-5">{[['01', 'Entenda os NFTs', 'Tokens, propriedade e raridade'], ['02', 'Configure sua carteira', 'Chaves, redes e primeira conexão'], ['03', 'Faça sua pesquisa', 'Criadores, contratos e segurança']].map(([number, title, description]) => <div key={number} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E28D38]/15 text-xs font-bold text-[#E28D38]">{number}</span><div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs text-[#7A6C60]">{description}</p></div></div>)}</div><div className="mt-8 flex items-center gap-2 border-t border-[#35271C] pt-5 text-[11px] text-[#7A6C60]"> Conteúdo para iniciantes e colecionadores curiosos</div></div>
        </div>

        <section className="mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-mono uppercase tracking-[0.25em] text-[#E28D38]">Biblioteca</p><h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Explore por assunto</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setActiveCategory('Todos')} className={'rounded-lg border px-3 py-2 text-xs transition-colors ' + (activeCategory === 'Todos' ? 'border-[#E28D38] bg-[#E28D38] text-[#120E0B]' : 'border-[#35271C] text-[#B9A899] hover:text-white')}>Todos</button>{CATEGORIES.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActiveCategory(label)} className={'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors ' + (activeCategory === label ? 'border-[#E28D38] bg-[#E28D38] text-[#120E0B]' : 'border-[#35271C] text-[#B9A899] hover:text-white')}><Icon className="h-3.5 w-3.5" /> {label}</button>)}</div></div>
          {filteredArticles.length === 0 ? <div className="mt-8 rounded-2xl border border-[#35271C] bg-[#1F1711] py-16 text-center"><Search className="mx-auto h-8 w-8 text-[#7A6C60]" /><p className="mt-4 text-sm text-white">Nenhum guia encontrado.</p><button type="button" onClick={() => { setSearch(''); setActiveCategory('Todos'); }} className="mt-4 text-xs text-[#E28D38] hover:underline">Limpar filtros</button></div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{filteredArticles.map((article) => <button key={article.id} type="button" onClick={() => setSelectedArticleId(article.id)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#35271C] bg-[#1F1711] text-left transition-all hover:-translate-y-1 hover:border-[#E28D38]"><div className="relative aspect-[4/3] overflow-hidden"><img src={article.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-[#120E0B]/80 px-2.5 py-1 text-[10px] text-[#E28D38] backdrop-blur-sm">{article.category}</span></div><div className="flex flex-1 flex-col p-5"><div className="flex items-center gap-2 text-[10px] text-[#7A6C60]"><Clock3 className="h-3.5 w-3.5" /> Leitura de {article.readTime}</div><h3 className="mt-3 font-bold leading-snug text-white group-hover:text-[#E28D38]">{article.title}</h3><p className="mt-3 line-clamp-3 text-xs leading-5 text-[#B9A899]">{article.summary}</p><span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#E28D38]">Ler guia <ArrowRight className="h-3.5 w-3.5" /></span></div></button>)}</div>}
        </section>
      </main>
    </div>
  );
}

function ArticleReader({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <div className="w-full"><div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><button type="button" onClick={onBack} className="mb-10 flex items-center gap-2 text-xs text-[#B9A899] hover:text-white"><ChevronLeft className="h-4 w-4" /> Voltar para Aprenda</button><div className="overflow-hidden rounded-2xl border border-[#35271C] bg-[#1F1711]"><div className="relative h-64 sm:h-80"><img src={article.imageUrl} alt="" className="h-full w-full object-cover" /><div className={'absolute inset-0 bg-gradient-to-t ' + article.accent} /><div className="absolute bottom-0 left-0 p-6 sm:p-10"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-sm">{article.category}</span><h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{article.title}</h1></div></div><div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_260px]"><article className="space-y-6 text-sm leading-7 text-[#B9A899]"><div className="flex items-center gap-2 border-b border-[#35271C] pb-5 text-xs text-[#7A6C60]"><Clock3 className="h-4 w-4" /> Leitura de {article.readTime}</div>{article.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article><aside className="h-fit rounded-xl border border-[#35271C] bg-[#18120D] p-5"><p className="flex items-center gap-2 text-xs font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-[#55C987]" /> O essencial</p><ul className="mt-4 space-y-4">{article.takeaways.map((takeaway) => <li key={takeaway} className="flex gap-2 text-xs leading-5 text-[#B9A899]"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#E28D38]" />{takeaway}</li>)}</ul><div className="mt-6 flex items-start gap-3 border-t border-[#35271C] pt-5 text-[11px] leading-5 text-[#7A6C60]"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#E28D38]" /><span>Nunca compartilhe sua frase-semente ou chave privada.</span></div></aside></div></div></div></div>
  );
}
