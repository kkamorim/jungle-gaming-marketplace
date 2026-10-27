import { ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    date: '12 de setembro',
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    summary: 'Aprenda a colecionar, negociar e verificar ativos digitais na blockchain com total segurança.',
    imageUrl: '/nfts/parrot-pirate-scout.png',
  },
  {
    id: 2,
    date: '13 de setembro',
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    summary: 'Conheça criadores visionários que estão redefinindo as fronteiras da arte generativa e 3D.',
    imageUrl: '/nfts/chimp-map-explorer.png',
  },
  {
    id: 3,
    date: '15 de setembro',
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    summary: 'Entenda os sistemas de raridade, contratos inteligentes e os direitos de propriedade de cada token.',
    imageUrl: '/nfts/goblin-gold-hoard.png',
  },
  {
    id: 4,
    date: '15 de setembro',
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    summary: 'Boas práticas essenciais para proteger suas chaves privadas, transações e identidade digital.',
    imageUrl: '/nfts/fox-sunglasses.png',
  },
];

export function MintingJournal() {
  return (
    <section className="my-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-[#B9A899]">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ARTICLES.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col rounded-2xl bg-[#1F1711] border border-[#35271C] overflow-hidden hover:border-[#E28D38] transition-all duration-300 hover:-translate-y-1 shadow-lg"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#18120D]">
              <img
                src={article.imageUrl}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#7A6C60] mb-2">
                  <span>{article.date}</span>
                  <span>|</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-[#E28D38] transition-colors leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-xs text-[#B9A899] line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#35271C]/50 flex items-center gap-1.5 text-xs font-semibold text-[#E28D38] group-hover:translate-x-1 transition-transform">
                <span>Ler mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
