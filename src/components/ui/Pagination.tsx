import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Página atual (começa em 1) */
  page: number;
  /** Total de páginas (ex.: Math.ceil(totalItens / itensPorPagina)) */
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Quantas páginas mostrar de cada lado da atual. Padrão: 1 */
  siblingCount?: number;
  /** Volta ao topo da página ao trocar de página. Padrão: true */
  scrollToTop?: boolean;
  className?: string;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/**
 * Gera a lista de itens a exibir, sempre com no máximo (siblingCount * 2 + 5) números:
 *  1 2 3 4 5 … 20   |   1 … 9 10 11 … 20   |   1 … 16 17 18 19 20
 * Assim a barra tem tamanho constante, não importa quantas páginas existam.
 */
function getPageItems(page: number, totalPages: number, siblingCount: number): PageItem[] {
  const maxNumbers = siblingCount * 2 + 5;
  if (totalPages <= maxNumbers) return range(1, totalPages);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, totalPages);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;
  const edgeCount = 3 + siblingCount * 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), 'ellipsis-right', totalPages];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis-left', ...range(totalPages - edgeCount + 1, totalPages)];
  }
  return [1, 'ellipsis-left', ...range(left, right), 'ellipsis-right', totalPages];
}

const BTN_BASE =
  'min-w-7 h-7 px-1.5 inline-flex items-center justify-center rounded border text-[11px] font-mono transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E28D38]';
const BTN_IDLE = 'border-[#35271C] text-[#B9A899] hover:border-[#E28D38]/60 hover:text-white';
const BTN_ACTIVE = 'border-[#E28D38] bg-[#E28D38] text-[#120E0B] font-bold';
const BTN_DISABLED = 'opacity-30 pointer-events-none';

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  scrollToTop = true,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const items = getPageItems(current, totalPages, siblingCount);

  const goTo = (next: number) => {
    const target = Math.min(Math.max(1, next), totalPages);
    if (target === current) return;
    onPageChange(target);
    if (scrollToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Paginação"
      className={`flex flex-wrap items-center justify-end gap-1.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => goTo(current - 1)}
        aria-label="Página anterior"
        disabled={current === 1}
        className={`${BTN_BASE} ${BTN_IDLE} ${current === 1 ? BTN_DISABLED : ''}`}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {items.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => goTo(item)}
            aria-label={`Página ${item}`}
            aria-current={item === current ? 'page' : undefined}
            className={`${BTN_BASE} ${item === current ? BTN_ACTIVE : BTN_IDLE}`}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="min-w-5 h-7 inline-flex items-center justify-center text-[11px] text-[#7A6C60] select-none"
          >
            …
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(current + 1)}
        aria-label="Próxima página"
        disabled={current === totalPages}
        className={`${BTN_BASE} ${BTN_IDLE} ${current === totalPages ? BTN_DISABLED : ''}`}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}