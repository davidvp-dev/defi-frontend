import { formatUnits, parseUnits } from 'viem';

/** Convierte el texto del input a unidades del token. Devuelve 0n si no es un número válido. */
export function safeParseUnits(value: string, decimals: number): bigint {
  if (!value) return 0n;
  try {
    return parseUnits(value, decimals);
  } catch {
    return 0n;
  }
}

/** Formatea un bigint con un máximo de decimales visibles, sin notación científica. */
export function fmt(value: bigint | undefined, decimals: number, maxFractionDigits = 6): string {
  if (value === undefined) return '—';
  const [int, frac = ''] = formatUnits(value, decimals).split('.');
  const trimmed = frac.slice(0, maxFractionDigits).replace(/0+$/, '');
  const intWithSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return trimmed ? `${intWithSep}.${trimmed}` : intWithSep;
}

/** Aplica slippage (en basis points) a un importe: amount * (1 - bps/10000). */
export function applySlippage(amount: bigint, slippageBps: number): bigint {
  return (amount * BigInt(10_000 - slippageBps)) / 10_000n;
}

/** Deadline para las txs: ahora + N minutos, en segundos Unix. */
export function deadlineFromNow(minutes = 20): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + minutes * 60);
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
