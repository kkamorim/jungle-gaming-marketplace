import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, X } from 'lucide-react';

interface JournalArticle {
  id: number;
  date: string;
  readTime: string;
  category: string;
  title: string;
  summary: string;
  imageUrl: string;
  accent: string;
  content: string[];
  takeaways: string[];
}

const ARTICLES: JournalArticle[] = [
  {
    id: 1,
    date: '12 de setembro',
    readTime: '6 min',
    category: 'Fundamentos',
    title: 'Como funciona a propriedade de NFTs',
    summary: 'Aprenda a colecionar, negociar e verificar ativos digitais na blockchain com total segurança.',
    imageUrl: '/nfts/parrot-pirate-scout.png',
    accent: 'from-[#E28D38]/80 to-[#1F1711]',
    content: [
      'NFT significa token não fungível: um registro criptográfico único em uma rede blockchain que comprova a autenticidade e a propriedade exclusiva de um ativo digital.',
      'Diferente de tokens convencionais, cada NFT possui metadados imutáveis e um contrato inteligente próprio. Ao adquirir uma peça, você passa a ser o titular público daquele ativo na rede descentralizada.',
      'Colecionar com responsabilidade envolve verificar a procedência da coleção, o histórico de transferências e garantir que o armazenamento dos arquivos esteja ancorado em redes distribuídas confiáveis.',
    ],
    takeaways: [
      'O token na blockchain é a certidão de propriedade auditável.',
      'A procedência é pública e protege criadores e colecionadores.',
      'Sempre verifique o contrato e a rede antes de confirmar uma transação.',
    ],
  },
  {
    id: 2,
    date: '13 de setembro',
    readTime: '4 min',
    category: 'Arte Digital',
    title: '10 artistas digitais para acompanhar',
    summary: 'Conheça criadores visionários que estão redefinindo as fronteiras da arte generativa e 3D.',
    imageUrl: '/nfts/chimp-map-explorer.png',
    accent: 'from-[#3E8EB3]/80 to-[#1F1711]',
    content: [
      'A web3 impulsionou uma nova onda estética combinando modelagem 3D avançada, personagens com ricas histórias visuais e narrativas lúdicas.',
      'Na Kurio, artistas como os estúdios por trás de Wild Vaults, Jungle Apes e SavannaCraft vêm explorando desde temas cibernéticos com iluminação neon até figuras mitológicas tropicais.',
      'Acompanhar de perto os perfis dos criadores permite antecipar lançamentos exclusivos (drops), garantir edições limitadas e fortalecer comunidades criativas sustentáveis.',
    ],
    takeaways: [
      'Criadores independentes agora possuem contato direto com seus apoiadores.',
      'Coleções sólidas constroem narrativas coerentes e identidades marcantes.',
      'Explore a página de Criadores da plataforma para descobrir novos lançamentos.',
    ],
  },
  {
    id: 3,
    date: '15 de setembro',
    readTime: '5 min',
    category: 'Colecionáveis',
    title: 'Raridade, atributos e procedência',
    summary: 'Entenda os sistemas de raridade, contratos inteligentes e os direitos de propriedade de cada token.',
    imageUrl: '/nfts/goblin-gold-hoard.png',
    accent: 'from-[#8568D5]/80 to-[#1F1711]',
    content: [
      'Em uma coleção de NFTs, os itens são compostos por conjuntos de características (traits ou atributos), como espécie, vestimentas, acessórios e fundos de estúdio.',
      'A frequência de ocorrência de cada atributo define o índice de raridade da peça. Edições raras ou com combinações únicas despertam especial fascínio no mercado.',
      'Porém, além das métricas numéricas, a preferência pessoal e o apreço estético pelo personagem devem guiar sua decisão ao expandir sua galeria particular.',
    ],
    takeaways: [
      'Atributos determinam a exclusividade visual e estatística do NFT.',
      'Edições 1/1 representam peças artísticas singulares.',
      'Colecione o que você realmente aprecia e se identifica.',
    ],
  },
  {
    id: 4,
    date: '15 de setembro',
    readTime: '5 min',
    category: 'Segurança',
    title: 'Como proteger sua carteira',
    summary: 'Boas práticas essenciais para proteger suas chaves privadas, transações e identidade digital.',
    imageUrl: '/nfts/fox-sunglasses.png',
    accent: 'from-[#3EB370]/80 to-[#1F1711]',
    content: [
      'Na custódia pessoal de criptoativos, a sua frase-semente (seed phrase) é a chave definitiva de acesso. Ela nunca deve ser compartilhada, digitada em sites suspeitos ou fotografada.',
      'Antes de assinar qualquer pedido ou conexão, confira o domínio do marketplace e os detalhes dos valores exibidos no resumo da compra.',
      'Utilize métodos de segurança adicionais, como carteiras frias (cold wallets) para coleções de alto valor e carteiras quentes apenas para operações cotidianas.',
    ],
    takeaways: [
      'Nenhum suporte legítimo solicitará sua chave privada ou frase-semente.',
      'Confira a URL e os valores de cada transação antes de assinar.',
      'Mantenha backups físicos e seguros de suas credenciais.',
    ],
  },
];

export function MintingJournal() {
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedArticle(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedArticle]);

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
            onClick={() => setSelectedArticle(article)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedArticle(article);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Ler artigo: ${article.title}`}
            className="group cursor-pointer flex flex-col rounded-2xl bg-[#1F1711] border border-[#35271C] overflow-hidden hover:border-[#E28D38] transition-all duration-300 hover:-translate-y-1 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E28D38]"
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
                  <span>Leitura de {article.readTime}</span>
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

      {/* Modal do Artigo */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl bg-[#1F1711] border border-[#35271C] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com imagem e botão fechar */}
            <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden">
              <img
                src={selectedArticle.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${selectedArticle.accent}`} />
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#120E0B]/80 text-[#B9A899] hover:text-white hover:bg-[#120E0B] border border-[#35271C] transition-colors"
                aria-label="Fechar artigo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white backdrop-blur-sm mb-2 border border-white/10">
                  {selectedArticle.category}
                </span>
                <h2 id="article-modal-title" className="text-xl sm:text-2xl font-heading font-extrabold text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Conteúdo rolável */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-sm text-[#B9A899] leading-relaxed">
              <div className="flex items-center gap-3 text-xs font-mono text-[#7A6C60] border-b border-[#35271C] pb-4">
                <span>{selectedArticle.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="w-3.5 h-3.5 text-[#E28D38]" />
                  {selectedArticle.readTime} de leitura
                </span>
              </div>

              {/* Parágrafos */}
              <div className="space-y-4">
                {selectedArticle.content.map((paragraph, index) => (
                  <p key={index} className="text-xs sm:text-sm leading-6 sm:leading-7 text-[#DDD3C9]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Destaque "O essencial" */}
              <aside className="rounded-xl border border-[#35271C] bg-[#18120D] p-5">
                <p className="flex items-center gap-2 text-xs font-bold text-white mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#55C987]" />
                  O essencial
                </p>
                <ul className="space-y-2.5">
                  {selectedArticle.takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#B9A899] leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E28D38]" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Dica de segurança */}
              <div className="flex items-start gap-3 rounded-lg border border-[#35271C]/70 bg-[#271E17]/50 p-4 text-[11px] text-[#7A6C60]">
                <LockKeyhole className="w-4 h-4 text-[#E28D38] shrink-0 mt-0.5" />
                <span>
                  Proteja suas chaves e senhas. Lembre-se de nunca assinar transações sem verificar o contrato e a URL oficial.
                </span>
              </div>

              {/* Botão de fechar inferior */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="w-full py-3 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] text-[#120E0B] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Concluir Leitura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
