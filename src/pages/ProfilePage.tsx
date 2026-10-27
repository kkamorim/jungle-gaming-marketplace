import { useState } from 'react';
import {
  User,
  Wallet as WalletIcon,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
  Save,
  Plus,
  ChevronDown,
  Mail,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useWallets,
  useCreateWallet,
  useUpdateWallet,
  useFavorites,
  useOrders,
  useToggleFavorite,
} from '../hooks/useMarketplace';
import { useUI } from '../context/UIContext';
import api from '../api/client';
import { NFTS } from '../mocks/fixtures';
import type { NFT, Order, WalletType, NetworkType } from '../types';

type ProfileTab = 'profile' | 'wallets' | 'activity' | 'wishlist' | 'offers' | 'support';

export function ProfilePage({
  onNavigateHome,
  onSelectNft,
}: {
  onNavigateHome: () => void;
  onSelectNft?: (id: string) => void;
}) {
  const { user, logout, refreshProfile } = useAuth();
  const { data: wallets } = useWallets();
  const { data: favorites } = useFavorites();
  const { data: orders } = useOrders();
  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const { addToast } = useUI();

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletLabel, setNewWalletLabel] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletNetwork, setNewWalletNetwork] = useState<NetworkType>('ethereum');
  const [newWalletType, setNewWalletType] = useState<WalletType>('metamask');
  const [supportTopic, setSupportTopic] = useState('Dúvida sobre uma compra');
  const [supportQuestion, setSupportQuestion] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const favoriteNfts = (favorites ?? []).filter(Boolean) as NFT[];
  const accountOrders = (orders ?? []).filter((order): order is Order => Boolean(order));
  const offerNfts = NFTS.filter((nft) => nft.id === 'nft-003');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/profile', {
        displayName,
        username,
        bio,
      });

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          addToast({
            type: 'error',
            title: 'Senhas não conferem',
            description: 'A nova senha e a confirmação devem ser iguais.',
          });
          setIsSaving(false);
          return;
        }
        await api.post('/profile/password', {
          currentPassword,
          newPassword,
          confirmPassword,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      await refreshProfile();
      addToast({
        type: 'success',
        title: 'Perfil atualizado!',
        description: 'Suas alterações foram salvas com sucesso.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar perfil',
        description: err.response?.data?.message || 'Falha ao salvar alterações.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletAddress.startsWith('0x') || newWalletAddress.length < 10) {
      addToast({
        type: 'error',
        title: 'Endereço inválido',
        description: 'Digite um endereço hexadecimal válido começando com 0x.',
      });
      return;
    }

    createWallet.mutate(
      {
        label: newWalletLabel || 'Nova Carteira',
        address: newWalletAddress,
        network: newWalletNetwork,
        type: newWalletType,
        isPrimary: false,
      },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Carteira vinculada!',
            description: 'A carteira foi registrada na sua conta.',
          });
          setIsAddingWallet(false);
          setNewWalletLabel('');
          setNewWalletAddress('');
        },
      }
    );
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportQuestion.trim()) {
      addToast({
        type: 'error',
        title: 'Escreva sua dúvida',
        description: 'Conte um pouco mais sobre como podemos ajudar.',
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Mensagem enviada',
      description: 'Nossa equipe responderá pelo e-mail da sua conta.',
    });
    setSupportQuestion('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[145px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:w-[145px]">
          <div className="rounded-md border border-[#35271C] bg-[#241811] p-2 lg:rounded-none lg:border-0 lg:p-0">
            <h3 className="mb-2 px-2 py-2 font-heading text-[11px] font-bold uppercase tracking-wider text-white">
              Meu Perfil
            </h3>

            <nav className="space-y-0.5 text-[10px] font-medium">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  activeTab === 'profile'
                    ? 'bg-[#E28D38]/15 text-[#E28D38] font-bold'
                    : 'text-[#B9A899] hover:bg-[#271E17] hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dados do perfil</span>
              </button>

              <button
                onClick={() => setActiveTab('wallets')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  activeTab === 'wallets'
                    ? 'bg-[#E28D38]/15 text-[#E28D38] font-bold'
                    : 'text-[#B9A899] hover:bg-[#271E17] hover:text-white'
                }`}
              >
                <WalletIcon className="w-4 h-4" />
                <span>Carteiras</span>
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6C60] hover:text-white hover:bg-[#271E17] transition-colors text-left"
              >
                <Activity className="w-4 h-4" />
                <span data-profile-tab='activity' onClick={(event) => { event.stopPropagation(); setActiveTab('activity'); }}>Atividade</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6C60] hover:text-white hover:bg-[#271E17] transition-colors text-left"
              >
                <Heart className="w-4 h-4" />
                <span data-profile-tab='wishlist' onClick={(event) => { event.stopPropagation(); setActiveTab('wishlist'); }}>Lista de interesse</span>
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6C60] hover:text-white hover:bg-[#271E17] transition-colors text-left"
              >
                <Tag className="w-4 h-4" />
                <span data-profile-tab='offers' onClick={(event) => { event.stopPropagation(); setActiveTab('offers'); }}>Ofertas</span>
              </button>

              <button
                onClick={() => addToast({ type: 'info', title: 'Arquivos', description: 'Metadados e mídias de alta resolução disponíveis no IPFS.' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6C60] hover:text-white hover:bg-[#271E17] transition-colors text-left"
              >
                <Download className="w-4 h-4" />
                <span>Arquivos baixados</span>
              </button>

              <button
                onClick={() => setActiveTab('support')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#7A6C60] hover:text-white hover:bg-[#271E17] transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4" />
                <span data-profile-tab='support' onClick={(event) => { event.stopPropagation(); setActiveTab('support'); }}>Suporte</span>
              </button>

              <div className="border-t border-[#35271C] my-2 pt-2">
                <button
                  onClick={() => {
                    logout();
                    onNavigateHome();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-950/20 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          {activeTab === 'profile' ? (
            <div className="p-0">
              <h2 className="mb-1 font-heading text-sm font-extrabold text-white">
                Perfil do colecionador
              </h2>
              <p className="mb-7 text-[10px] text-[#B9A899]">
                Personalize suas informações públicas de exibição e credenciais da conta.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-1.5">Nome de exibição *</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-1.5">Nome de usuário *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-1.5">E-mail</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'davi@kurio.com'}
                    className="w-full px-3 py-2.5 bg-[#18120D] border border-[#35271C] rounded-lg text-[#7A6C60] cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-[#7A6C60] mt-1 block">
                    O e-mail é o identificador único da conta e não pode ser alterado diretamente.
                  </span>
                </div>

                <div>
                  <label className="block text-white font-medium mb-1.5">Biografia</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte sobre sua coleção ou preferências..."
                    className="w-full px-3 py-2.5 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                  />
                </div>

                <div className="pt-6 border-t border-[#35271C]">
                  <h3 className="font-heading font-bold text-sm text-white mb-4">
                    Alterar senha
                  </h3>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="block text-[#B9A899] mb-1">Senha atual</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B9A899] mb-1">Nova senha</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B9A899] mb-1">Confirmar nova senha</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-[#271E17] border border-[#35271C] rounded-lg text-white focus:outline-none focus:border-[#E28D38]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </form>
            </div>
          ) : activeTab === 'wallets' ? (
            <div className="p-0">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-1 font-heading text-sm font-extrabold text-white">
                    Carteiras vinculadas
                  </h2>
                  <p className="text-[10px] text-[#B9A899]">
                    Estas carteiras ficam disponíveis no checkout e para assinar transferências.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingWallet((prev) => !prev)}
                  className="px-4 py-2 bg-[#271E17] hover:bg-[#E28D38] text-white text-xs font-semibold rounded-lg border border-[#35271C] hover:border-transparent transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar carteira</span>
                </button>
              </div>

              {isAddingWallet && (
                <form
                  onSubmit={handleCreateWallet}
                  className="mb-8 p-5 rounded-xl bg-[#271E17] border border-[#E28D38]/50 space-y-4 text-xs animate-scale-in"
                >
                  <h4 className="font-bold text-white text-sm">Vincular nova carteira</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#B9A899] mb-1">Apelido da carteira</label>
                      <input
                        type="text"
                        placeholder="ex: Minha Ledger"
                        value={newWalletLabel}
                        onChange={(e) => setNewWalletLabel(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1711] border border-[#35271C] rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B9A899] mb-1">Endereço público (0x...)</label>
                      <input
                        type="text"
                        required
                        placeholder="0x..."
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-[#1F1711] border border-[#35271C] rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#B9A899] mb-1">Rede principal</label>
                      <select
                        value={newWalletNetwork}
                        onChange={(e) => setNewWalletNetwork(e.target.value as NetworkType)}
                        className="w-full px-3 py-2 bg-[#1F1711] border border-[#35271C] rounded-lg text-white"
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="polygon">Polygon</option>
                        <option value="solana">Solana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#B9A899] mb-1">Tipo de carteira</label>
                      <select
                        value={newWalletType}
                        onChange={(e) => setNewWalletType(e.target.value as WalletType)}
                        className="w-full px-3 py-2 bg-[#1F1711] border border-[#35271C] rounded-lg text-white"
                      >
                        <option value="metamask">MetaMask</option>
                        <option value="walletconnect">WalletConnect</option>
                        <option value="coinbase">Coinbase Wallet</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createWallet.isPending}
                      className="px-4 py-2 bg-[#E28D38] hover:bg-[#F5A047] text-white font-semibold rounded-lg"
                    >
                      Salvar Carteira
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingWallet(false)}
                      className="px-4 py-2 bg-[#1F1711] text-[#7A6C60] hover:text-white rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {(wallets || []).map((w) => (
                  <div
                    key={w.id}
                    className="p-5 rounded-xl bg-[#271E17] border border-[#35271C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-white">
                          {w.label}
                        </span>
                        {w.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                            Principal
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-[#1F1711] text-[#B9A899] text-[10px] uppercase font-mono">
                          {w.network}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#7A6C60] mt-1">
                        {w.address}
                      </p>
                    </div>

                    {!w.isPrimary && (
                      <button
                        onClick={() =>
                          updateWallet.mutate({
                            id: w.id,
                            isPrimary: true,
                          })
                        }
                        className="text-xs text-[#E28D38] hover:underline font-medium"
                      >
                        Definir como principal
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'activity' ? (
            <ProfileActivity orders={accountOrders} />
          ) : activeTab === 'wishlist' ? (
            <ProfileCollection
              title='Lista de interesses'
              description='Os NFTs que voce curtiu ficam reunidos aqui.'
              nfts={favoriteNfts}
              emptyTitle='Sua lista ainda esta vazia'
              emptyDescription='Use o coracao nos cards do mercado para salvar uma peca.'
              onSelectNft={onSelectNft}
            />
          ) : activeTab === 'offers' ? (
            <ProfileCollection
              title='Ofertas do mercado'
              description='Acompanhe os cards que estao com preco promocional.'
              nfts={offerNfts}
              emptyTitle='Nenhuma oferta disponivel'
              emptyDescription='Novas oportunidades aparecerao aqui quando forem publicadas.'
              onSelectNft={onSelectNft}
              showOffer
            />
          ) : (
            <ProfileSupport
              email='contato@gmail.com'
              topic={supportTopic}
              question={supportQuestion}
              openFaq={openFaq}
              onTopicChange={setSupportTopic}
              onQuestionChange={setSupportQuestion}
              onFaqToggle={setOpenFaq}
              onSubmit={handleSupportSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function ProfileActivity({ orders }: { orders: Order[] }) {
  return <section className='space-y-6'><div><h2 className='mb-1 font-heading text-sm font-extrabold text-white'>Atividade</h2><p className='text-[10px] text-[#B9A899]'>Acompanhe suas compras, confirmacoes e itens adquiridos.</p></div>{orders.length === 0 ? <ProfileEmptyState title='Nenhuma compra registrada' description='Quando voce concluir uma compra no mercado, ela aparecera nesta area.' /> : <div className='space-y-4'>{orders.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => <article key={order.id} className='rounded-xl border border-[#35271C] bg-[#1F1711] p-4'><div className='mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#35271C] pb-3'><div><p className='font-heading text-xs font-bold text-white'>Compra em {formatProfileDate(order.createdAt)}</p><p className='mt-1 font-mono text-[10px] text-[#7A6C60]'>Pedido #{order.id.slice(-8)}</p></div><span className={'rounded-full px-2.5 py-1 text-[10px] font-bold ' + (order.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#E28D38]/15 text-[#E28D38]')}>{order.status === 'confirmed' ? 'Confirmada' : 'Processando'}</span></div>{order.items.map((item) => <div key={order.id + '-' + item.editionId} className='mb-3 flex items-center gap-3 last:mb-0'><img src={item.nftImageUrl} alt={item.nftName} className='h-14 w-14 rounded-lg object-cover' /><div className='min-w-0 flex-1'><p className='truncate font-mono text-xs font-bold text-white'>{item.nftName}</p><p className='mt-1 text-[10px] text-[#7A6C60]'>{item.editionLabel} - Quantidade {item.quantity}</p></div><p className='font-mono text-xs font-bold text-[#E28D38]'>{item.totalPriceEth} ETH</p></div>)}<div className='mt-4 flex items-center justify-between border-t border-[#35271C] pt-3'><span className='text-[10px] text-[#7A6C60]'>Total da compra</span><span className='font-mono text-xs font-bold text-white'>{order.totalEth} ETH</span></div></article>)}</div>}</section>;
}

interface ProfileCollectionProps { title: string; description: string; nfts: NFT[]; emptyTitle: string; emptyDescription: string; onSelectNft?: (id: string) => void; showOffer?: boolean; }

function ProfileCollection({ title, description, nfts, emptyTitle, emptyDescription, onSelectNft, showOffer = false }: ProfileCollectionProps) {
  const toggleFavorite = useToggleFavorite();
  const handleUnfavorite = (event: React.MouseEvent, nft: NFT) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite.mutate({ nftId: nft.id, isFavorited: true, nft });
  };
  return <section className='space-y-6'><div><h2 className='mb-1 font-heading text-sm font-extrabold text-white'>{title}</h2><p className='text-[10px] text-[#B9A899]'>{description}</p></div>{nfts.length === 0 ? <ProfileEmptyState title={emptyTitle} description={emptyDescription} /> : <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>{nfts.map((nft) => <button key={nft.id} type='button' onClick={() => onSelectNft?.(nft.id)} className='group overflow-hidden rounded-xl border border-[#35271C] bg-[#1F1711] text-left transition hover:-translate-y-0.5 hover:border-[#E28D38] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E28D38]'><div className='relative aspect-square overflow-hidden bg-[#EAE5D9]'><img src={nft.imageUrl} alt={nft.name} className='h-full w-full object-cover transition duration-500 group-hover:scale-105' />{!showOffer && <span role='button' tabIndex={0} aria-label='Remover dos interesses' onClick={(event) => handleUnfavorite(event, nft)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); toggleFavorite.mutate({ nftId: nft.id, isFavorited: true, nft }); } }} className='absolute right-3 top-3 rounded-full bg-[#E28D38] p-2 text-white shadow-lg'><Heart className='h-4 w-4 fill-current' /></span>}{showOffer && <span className='absolute left-3 top-3 rounded-full bg-[#E28D38] px-2 py-1 text-[9px] font-bold uppercase text-[#120E0B]'>Oferta</span>}</div><div className='p-3'><p className='truncate font-mono text-xs font-bold text-white'>{nft.name}</p><div className='mt-2 flex items-center gap-2 font-mono text-xs'><span className='font-bold text-[#E28D38]'>{nft.priceEth} ETH</span>{showOffer && <span className='text-[#7A6C60] line-through'>2.29 ETH</span>}</div></div></button>)}</div>}</section>;
}

function ProfileEmptyState({ title, description }: { title: string; description: string }) {
  return <div className='rounded-xl border border-dashed border-[#4A3526] bg-[#1F1711] px-5 py-10 text-center'><Heart className='mx-auto mb-3 h-6 w-6 text-[#E28D38]' /><h3 className='font-heading text-sm font-bold text-white'>{title}</h3><p className='mx-auto mt-2 max-w-sm text-xs leading-5 text-[#7A6C60]'>{description}</p></div>;
}

function ProfileSupport({ email, topic, question, openFaq, onTopicChange, onQuestionChange, onFaqToggle, onSubmit }: { email: string; topic: string; question: string; openFaq: number | null; onTopicChange: (value: string) => void; onQuestionChange: (value: string) => void; onFaqToggle: (value: number | null) => void; onSubmit: (event: React.FormEvent) => void }) {
  const faqs = [{ question: 'Como funciona a compra de um NFT?', answer: 'Escolha uma peça no mercado, adicione ao carrinho e conclua o checkout usando uma carteira vinculada.' }, { question: 'Onde encontro minha compra depois do checkout?', answer: 'Depois da compra, o pedido aparece em Atividade no seu perfil com o status da confirmação.' }, { question: 'Posso remover um item da lista de interesses?', answer: 'Sim. Abra o card no mercado e clique no coração novamente para retirar o item.' }, { question: 'Como mantenho minha carteira segura?', answer: 'Nunca compartilhe sua frase-semente, senha ou chave privada. A equipe Kurio nunca solicita esses dados.' }];
  return <section className='space-y-6'><div><h2 className='mb-1 font-heading text-sm font-extrabold text-white'>Suporte</h2><p className='text-[10px] text-[#B9A899]'>Encontre respostas rápidas ou envie uma dúvida para nossa equipe.</p></div><div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'><div className='space-y-2'>{faqs.map((faq, index) => <div key={faq.question} className='overflow-hidden rounded-xl border border-[#35271C] bg-[#1F1711]'><button type='button' onClick={() => onFaqToggle(openFaq === index ? null : index)} className='flex w-full items-center justify-between gap-4 p-4 text-left text-xs font-bold text-white'><span>{faq.question}</span><ChevronDown className={'h-4 w-4 shrink-0 text-[#E28D38] transition-transform ' + (openFaq === index ? 'rotate-180' : '')} /></button>{openFaq === index && <p className='border-t border-[#35271C] px-4 pb-4 pt-3 text-xs leading-5 text-[#B9A899]'>{faq.answer}</p>}</div>)}</div><div className='rounded-xl border border-[#35271C] bg-[#1F1711] p-4 sm:p-5'><div className='mb-5 rounded-lg border border-[#35271C] bg-[#18120D] p-3'><p className='mb-1 text-[10px] uppercase tracking-wider text-[#7A6C60]'>E-mail de suporte</p><a href={'mailto:' + email} className='flex items-center gap-2 text-xs font-bold text-[#E28D38] hover:underline'><Mail className='h-4 w-4' />{email}</a></div><form onSubmit={onSubmit} className='space-y-3'><div><label className='mb-1 block text-[10px] font-bold text-white'>Assunto</label><select value={topic} onChange={(event) => onTopicChange(event.target.value)} className='w-full rounded-lg border border-[#35271C] bg-[#271E17] px-3 py-2 text-xs text-white focus:border-[#E28D38] focus:outline-none'><option>Dúvida sobre uma compra</option><option>Problema com a carteira</option><option>Lista de interesses</option><option>Outro assunto</option></select></div><div><label className='mb-1 block text-[10px] font-bold text-white'>Sua dúvida</label><textarea required rows={5} value={question} onChange={(event) => onQuestionChange(event.target.value)} placeholder='Explique como podemos ajudar...' className='w-full resize-y rounded-lg border border-[#35271C] bg-[#271E17] px-3 py-2 text-xs text-white placeholder:text-[#7A6C60] focus:border-[#E28D38] focus:outline-none' /></div><button type='submit' className='flex w-full items-center justify-center gap-2 rounded-lg bg-[#E28D38] px-4 py-2.5 text-xs font-bold text-[#120E0B] transition hover:bg-[#F5A047]'><Send className='h-4 w-4' />Enviar dúvida</button></form></div></div></section>;
}
