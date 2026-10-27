import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, ExternalLink, ShieldCheck, AlertTriangle, Loader2, Copy, LogIn } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useWallets, useQuote, useCheckout, useCart, useOrder } from '../../hooks/useMarketplace';
import { generateIdempotencyKey, formatEth, truncateAddress } from '../../lib/utils';
import type { Order } from '../../types';

export function CheckoutModal() {
  const queryClient = useQueryClient();
  const { isCheckoutOpen, closeCheckout, openAuthModal, addToast } = useUI();
  const { isAuthenticated, login } = useAuth();
  const { data: wallets } = useWallets();
  const { data: quote } = useQuote();
  const { data: cart } = useCart();
  const checkout = useCheckout();
  const [selectedWalletId, setSelectedWalletId] = useState<string>('wallet-001');
  const [selectedMethod, setSelectedMethod] = useState<'metamask' | 'walletconnect' | 'coinbase'>('metamask');
  const [paymentScenario, setPaymentScenario] = useState<'confirmed' | 'declined' | 'timeout'>('confirmed');
  const [walletConnected, setWalletConnected] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyKey());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data: refreshedOrder } = useOrder(pendingOrder?.id);

  useEffect(() => {
    if (!isCheckoutOpen) return;
    const previousElement = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCheckout();
        return;
      }
      if (event.key !== 'Tab' || !dialog || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousElement?.focus();
    };
  }, [closeCheckout, isCheckoutOpen]);

  useEffect(() => {
    if (!refreshedOrder || refreshedOrder.status === 'pending') return;
    setPendingOrder(null);
    if (refreshedOrder.status === 'confirmed') {
      setConfirmedOrder(refreshedOrder);
      addToast({ type: 'success', title: 'Compra confirmada', description: 'A transação foi confirmada no mock.' });
    } else {
      setErrorMessage('A transação não foi confirmada. Seus itens permanecem disponíveis no carrinho.');
      addToast({ type: 'error', title: 'Pagamento não confirmado', description: 'Tente novamente ou escolha outra carteira.' });
    }
  }, [addToast, refreshedOrder]);

  if (!isCheckoutOpen) return null;

  const activeWallets = wallets || [
    {
      id: 'wallet-001',
      label: 'Carteira Principal (Ethereum)',
      address: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      network: 'ethereum',
      type: 'metamask',
      isPrimary: true,
      ensName: 'davimont.eth',
    },
    {
      id: 'wallet-002',
      label: 'Carteira Secundária (Polygon)',
      address: '0xaabbccdd11223344556677889900aabbccddeeff',
      network: 'polygon',
      type: 'metamask',
      isPrimary: false,
    },
  ];

  const hasPriceChange = cart?.items.some((i) => i.priceChanged);

  const handleQuickLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login({ email: 'davi@kurio.com', password: 'Senha@123' });
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      await queryClient.invalidateQueries({ queryKey: ['quote'] });
      addToast({
        type: 'success',
        title: 'Autenticado com sucesso',
        description: 'Conectado como Davi Montalvão para autorizar a compra.',
      });
      setErrorMessage(null);
    } catch {
      setErrorMessage('Falha ao autenticar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleConfirmPurchase = () => {
    if (!isAuthenticated) {
      setErrorMessage('Você precisa estar conectado à sua conta de colecionador.');
      return;
    }
    if (!quote?.version) {
      setErrorMessage('A cotação expirou. Atualize o resumo antes de confirmar.');
      return;
    }

    setErrorMessage(null);
    checkout.mutate(
      {
        walletId: selectedWalletId,
        idempotencyKey,
        quoteVersion: quote.version,
        network: activeWallets.find((wallet) => wallet.id === selectedWalletId)?.network,
        paymentScenario,
      },
      {
        onSuccess: (order) => {
          if (order.status === 'confirmed') {
            setConfirmedOrder(order);
            return;
          }
          setPendingOrder(order);
          addToast({ type: 'info', title: 'Pagamento em processamento', description: 'Aguardando confirmação da rede simulada.' });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Falha no processamento do pagamento.';
          setErrorMessage(msg);
          addToast({ type: 'error', title: 'Erro na transação', description: msg });
        },
      },
    );
  };
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    addToast({
      type: 'info',
      title: 'Copiado para a área de transferência',
      description: hash,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div
        onClick={closeCheckout}
        className="fixed inset-0 bg-[#0A0705]/85 backdrop-blur-md transition-opacity"
      />

      <div ref={dialogRef} className="relative w-full max-w-lg bg-[#18120D] border border-[#35271C] rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in">
        <div className="p-6 border-b border-[#35271C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E28D38]" />
            <h3 id="checkout-title" className="font-heading font-bold text-lg text-white">
              {confirmedOrder ? 'Recibo da Transação' : 'Pagamento com Carteira'}
            </h3>
          </div>

          <button
            onClick={() => {
              setConfirmedOrder(null);
              setPendingOrder(null);
              setIdempotencyKey(generateIdempotencyKey());
              closeCheckout();
            }}
            className="p-1.5 text-[#7A6C60] hover:text-white hover:bg-[#1F1711] rounded-lg transition-colors"
            aria-label="Fechar checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-6 space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="font-heading font-extrabold text-xl text-white">
                Transação Confirmada!
              </h4>
              <p className="text-xs text-[#B9A899] mt-1">
                Seus NFTs foram transferidos com sucesso para a sua carteira conectada.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1F1711] border border-[#35271C] space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#7A6C60]">ID do Pedido:</span>
                <span className="text-white">{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6C60]">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{confirmedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6C60]">Total Pago:</span>
                <span className="text-[#E28D38] font-bold">{formatEth(confirmedOrder.totalEth)} ETH</span>
              </div>
              {confirmedOrder.transactionHash && (
                <div className="pt-2 border-t border-[#35271C] flex items-center justify-between">
                  <span className="text-[#7A6C60]">Hash da Tx:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white">
                      {truncateAddress(confirmedOrder.transactionHash, 6)}
                    </span>
                    <button
                      onClick={() => handleCopyHash(confirmedOrder.transactionHash!)}
                      className="text-[#E28D38] hover:text-[#F5A047]"
                      title="Copiar Hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {confirmedOrder.explorerUrl && (
              <a
                href={confirmedOrder.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-lg bg-[#271E17] hover:bg-[#35271C] text-[#E28D38] text-xs font-semibold border border-[#35271C] flex items-center justify-center gap-2 transition-colors"
              >
                <span>Ver no Explorador de Blocos</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => {
                setConfirmedOrder(null);
                setPendingOrder(null);
                setIdempotencyKey(generateIdempotencyKey());
                closeCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Concluir e Explorar Mais
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {!isAuthenticated && (
              <div className="p-4 rounded-xl bg-[#281810] border border-[#E28D38] flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-5 h-5 text-[#E28D38] shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Autenticação necessária</p>
                    <p className="text-[#B9A899] mt-0.5">
                      Para emitir a compra na blockchain, entre com sua conta de colecionador.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleQuickLogin}
                    disabled={isLoggingIn}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#E28D38] hover:bg-[#F5A047] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoggingIn ? 'Entrando...' : 'Entrar como Davi (1 Clique)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="py-2 px-3 rounded-lg bg-[#1F1711] hover:bg-[#271E17] border border-[#35271C] text-white text-xs"
                  >
                    Outra conta
                  </button>
                </div>
              </div>
            )}

            {/* Real-time price change alert */}
            {hasPriceChange && (
              <div className="p-3.5 rounded-xl bg-[#281810] border border-[#E28D38] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#E28D38] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Preço atualizado em tempo real</p>
                  <p className="text-[#B9A899] mt-0.5">
                    O valor de alguns itens no mercado flutuou. Revise o novo total antes de assinar a transação.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white mb-2 uppercase tracking-wider">
                Carteira conectada
              </label>
              <div className="space-y-2">
                {activeWallets.map((wallet) => (
                  <label
                    key={wallet.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedWalletId === wallet.id
                        ? 'border-[#E28D38] bg-[#271E17]'
                        : 'border-[#35271C] bg-[#1F1711] hover:border-[#4A3728]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="wallet"
                        value={wallet.id}
                        checked={selectedWalletId === wallet.id}
                        onChange={() => setSelectedWalletId(wallet.id)}
                        className="accent-[#E28D38]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{wallet.label}</span>
                          {wallet.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded bg-[#E28D38]/15 text-[#E28D38] text-[10px] font-mono">
                              Principal
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#7A6C60]">
                          {truncateAddress(wallet.address, 6)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#B9A899] uppercase">
                      {wallet.network}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-2 uppercase tracking-wider">
                Provedor de Conexão
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['metamask', 'walletconnect', 'coinbase'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`py-2 px-3 rounded-lg border font-medium capitalize transition-all ${
                      selectedMethod === method
                        ? 'border-[#E28D38] bg-[#271E17] text-white'
                        : 'border-[#35271C] bg-[#1F1711] text-[#7A6C60] hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#35271C] bg-[#1F1711] p-3 text-xs">
              <span className="text-[#B9A899]">Carteira: <strong className="text-white">{walletConnected ? 'conectada' : 'desconectada'}</strong></span>
              <button type="button" onClick={() => setWalletConnected((connected) => !connected)} className="rounded border border-[#E28D38]/60 px-2 py-1 text-[#E28D38]">
                {walletConnected ? 'Desconectar' : 'Conectar'}
              </button>
              <label className="flex items-center gap-2 text-[#B9A899]">
                Cenário
                <select value={paymentScenario} onChange={(event) => setPaymentScenario(event.target.value as typeof paymentScenario)} className="rounded border border-[#35271C] bg-[#120E0B] px-2 py-1 text-white">
                  <option value="confirmed">Confirmar</option>
                  <option value="declined">Recusar</option>
                  <option value="timeout">Timeout</option>
                </select>
              </label>
            </div>
            <div className="p-4 rounded-xl bg-[#1F1711] border border-[#35271C] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#B9A899]">
                <span>Itens:</span>
                <span>{quote?.items?.length || 1}</span>
              </div>
              <div className="flex justify-between text-[#B9A899]">
                <span>Subtotal:</span>
                <span>{formatEth(quote?.subtotalEth || '0.45')} ETH</span>
              </div>
              <div className="flex justify-between text-[#B9A899]">
                <span>Taxa de rede (gas):</span>
                <span>{quote?.networkFeeEth || '0.016'} ETH</span>
              </div>
              <div className="pt-2 border-t border-[#35271C] flex justify-between text-sm font-bold">
                <span className="text-white font-sans">Total a pagar:</span>
                <span className="text-[#E28D38]">{formatEth(quote?.totalEth || '0.466')} ETH</span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 p-2.5 rounded-lg bg-red-950/30 border border-red-500/40">
                {errorMessage}
              </p>
            )}

            <button
              onClick={handleConfirmPurchase}
              disabled={checkout.isPending || !isAuthenticated || !walletConnected}
              className="w-full py-4 rounded-xl bg-[#E28D38] hover:bg-[#F5A047] active:bg-[#C87827] disabled:opacity-50 text-white font-semibold text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(226,141,56,0.35)] transition-all flex items-center justify-center gap-2"
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando na Blockchain...</span>
                </>
              ) : (
                <span>Confirmar Compra</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}















