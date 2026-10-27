import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an ETH string for display with up to `decimals` decimal places.
 * Strips trailing zeros.
 */
export function formatEth(eth: string, decimals = 4): string {
  const num = parseFloat(eth);
  if (isNaN(num)) return '0';
  const formatted = num.toFixed(decimals);
  // Strip trailing zeros but keep at least 2 decimals
  return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '.00');
}

/**
 * Safe ETH arithmetic using integer micro-ETH (6 decimals).
 */
export function ethToMicro(eth: string): number {
  const [whole = '0', frac = ''] = eth.split('.');
  const padded = (frac + '000000').slice(0, 6);
  return parseInt(whole, 10) * 1_000_000 + parseInt(padded, 10);
}

export function microToEth(micro: number): string {
  const sign = micro < 0 ? '-' : '';
  const abs = Math.abs(micro);
  const whole = Math.floor(abs / 1_000_000);
  const frac = String(abs % 1_000_000).padStart(6, '0').replace(/0+$/, '');
  return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

export function addEth(a: string, b: string): string {
  return microToEth(ethToMicro(a) + ethToMicro(b));
}

export function subtractEth(a: string, b: string): string {
  return microToEth(ethToMicro(a) - ethToMicro(b));
}

export function multiplyEth(eth: string, qty: number): string {
  return microToEth(ethToMicro(eth) * qty);
}

/**
 * Generate a unique idempotency key.
 */
export function generateIdempotencyKey(): string {
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Truncate an Ethereum address for display.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Relative time string from an ISO date.
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  const months = Math.floor(days / 30);
  return `${months} meses atrás`;
}
