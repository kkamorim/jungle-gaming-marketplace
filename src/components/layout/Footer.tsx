import { useState } from 'react';
import { Shield, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { useUI } from '../../context/UIContext';

export function Footer() {
  const [email, setEmail] = useState('');
  const { addToast } = useUI();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addToast({
      type: 'success',
      title: 'Inscrição confirmada!',
      description: 'Você receberá com exclusividade os próximos lançamentos.',
    });
    setEmail('');
  };

  return (
    <footer className="w-full bg-[#120E0B] border-t border-[#35271C] text-[#B9A899] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-[#35271C]">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-[#18120D] border border-[#35271C]/60 hover:border-[#E28D38]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#E28D38]/10 text-[#E28D38] flex items-center justify-center shrink-0 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-1">Segurança da carteira</h4>
              <p className="text-xs text-[#7A6C60] leading-relaxed">
                Proteja sua carteira e colecione arte digital verificada com total confiança.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-[#18120D] border border-[#35271C]/60 hover:border-[#E28D38]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#E28D38]/10 text-[#E28D38] flex items-center justify-center shrink-0 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-1">Criadores em destaque</h4>
              <p className="text-xs text-[#7A6C60] leading-relaxed">
                Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-[#18120D] border border-[#35271C]/60 hover:border-[#E28D38]/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#E28D38]/10 text-[#E28D38] flex items-center justify-center shrink-0 font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-1">Alertas de lançamentos</h4>
              <p className="text-xs text-[#7A6C60] leading-relaxed">
                Receba calendários de cunhagem, novidades de listas de acesso e análises de mercado.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#1F1711] border border-[#35271C] flex flex-col justify-between">
            <div>
              <h4 className="text-white text-sm font-semibold mb-1">Antecipe-se ao próximo lançamento</h4>
              <p className="text-xs text-[#7A6C60] mb-3">Receba lançamentos selecionados e histórias de criadores.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Digite seu e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 min-w-0 bg-[#271E17] border border-[#35271C] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#7A6C60] focus:outline-none focus:border-[#E28D38]"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#D28A4C] hover:bg-[#C27438] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors flex items-center gap-1"
              >
                <span>Enviar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        <div className="py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#35271C] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-heading font-extrabold text-lg text-white tracking-widest">KURIO</span>
            <span className="text-[#7A6C60]">|</span>
            <span className="text-white">Feito para colecionadores, criadores e cultura</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs">
            <a href="mailto:contato@email.com" className="text-white transition-colors">
              contato@email.com
            </a>
            <span className="text-[#7A6C60]">|</span>
            <span className="text-white">+55 11 4002 8922</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12 text-xs">
          <div>
            <h5 className="font-semibold text-[#C27438] text-[16px] tracking-wider mb-4">Meu Perfil</h5>
            <ul className="space-y-2.5">
              <li><a href="#perfil" className="text-white hover:text-[#C27438] transition-colors">Meu perfil</a></li>
              <li><a href="#colecao" className="text-white hover:text-[#C27438] transition-colors">Minha coleção</a></li>
              <li><a href="#atividade" className="text-white hover:text-[#C27438] transition-colors">Atividade</a></li>
              <li><a href="#criador" className="text-white hover:text-[#C27438] transition-colors">Estúdio do criador</a></li>
              <li><a href="#favoritos" className="text-white hover:text-[#C27438] transition-colors">Lista de interesse</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[#C27438] text-[16px] tracking-wider mb-4">Central de Ajuda</h5>
            <ul className="space-y-2.5">
              <li><a href="#ajuda" className="text-white hover:text-[#C27438] transition-colors">Central de ajuda</a></li>
              <li><a href="#como-comprar" className="text-white hover:text-[#C27438] transition-colors">Como comprar NFTs</a></li>
              <li><a href="#seguranca" className="text-white hover:text-[#C27438] transition-colors">Carteira e segurança</a></li>
              <li><a href="#politica" className="text-white hover:text-[#C27438] transition-colors">Política do mercado</a></li>
              <li><a href="#denunciar" className="text-white hover:text-[#C27438] transition-colors">Denunciar item</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[#C27438] text-[16px] tracking-wider mb-4">Coleções</h5>
            <ul className="space-y-2.5">
              <li><a href="#arte-digital" className="text-white hover:text-[#C27438] transition-colors">Arte digital</a></li>
              <li><a href="#fotografia" className="text-white hover:text-[#C27438] transition-colors">Fotografia</a></li>
              <li><a href="#musica" className="text-white hover:text-[#C27438] transition-colors">Música</a></li>
              <li><a href="#arte-3d" className="text-white hover:text-[#C27438] transition-colors">Arte 3D</a></li>
              <li><a href="#utilidade" className="text-white hover:text-[#C27438] transition-colors">Utilidade</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-4">Redes sociais</h5>
            <div className="flex items-center gap-3">
              <a href="#facebook" className="p-2 rounded-lg bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38] hover:text-[#E28D38] transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#instagram" className="p-2 rounded-lg bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38] hover:text-[#E28D38] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#twitter" className="p-2 rounded-lg bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38] hover:text-[#E28D38] transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#linkedin" className="p-2 rounded-lg bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38] hover:text-[#E28D38] transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#youtube" className="p-2 rounded-lg bg-[#1F1711] border border-[#35271C] hover:border-[#E28D38] hover:text-[#E28D38] transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>
              </a>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h5 className="font-semibold text-white uppercase tracking-wider mb-4">Carteiras compatíveis</h5>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2.5 py-1 rounded bg-[#1F1711] border border-[#35271C] text-[#E28D38]">METAMASK · WALLETCONNECT · COINBASE </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#35271C] text-center text-xs text-[#7A6C60]">
          <p>© 2026 Kurio. Propriedade digital para todos.</p>
        </div>
      </div>
    </footer>
  );
}
