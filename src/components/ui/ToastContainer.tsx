import { useUI } from '../../context/UIContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useUI();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notificações"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'warning'
            ? AlertTriangle
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-500/50 bg-[#1E1712]'
            : toast.type === 'warning'
            ? 'border-[#E28D38] bg-[#221810]'
            : toast.type === 'error'
            ? 'border-red-500/50 bg-[#1F1212]'
            : 'border-blue-500/50 bg-[#151922]';

        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-400'
            : toast.type === 'warning'
            ? 'text-[#E28D38]'
            : toast.type === 'error'
            ? 'text-red-400'
            : 'text-blue-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#B9A899] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#7A6C60] hover:text-white transition-colors p-1"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
