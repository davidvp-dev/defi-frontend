import type { Address } from 'viem';

export type Token = {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  /** true solo para ETH nativo (no es un contrato ERC20). */
  isNative?: boolean;
};

/**
 * ETH nativo no tiene dirección de contrato. Se usa esta dirección "ficticia" (convención de
 * muchos DEX) solo como identificador dentro del frontend; nunca se envía a un contrato.
 * Para el router, ETH se representa con WETH en el `path`.
 */
export const NATIVE_ADDRESS: Address = '0xEeeeeEeeeEeEeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const ETH: Token = {
  symbol: 'ETH',
  name: 'Ether',
  address: NATIVE_ADDRESS,
  decimals: 18,
  isNative: true,
};

// Tokens de Arbitrum One. Como el nodo local es un fork, las direcciones son las mismas.
export const WETH: Token = {
  symbol: 'WETH',
  name: 'Wrapped Ether',
  address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  decimals: 18,
};

export const USDC: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  decimals: 6,
};

export const ARB: Token = {
  symbol: 'ARB',
  name: 'Arbitrum',
  address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  decimals: 18,
};

/** Tokens ERC20 (liquidez, balances, aprobaciones). */
export const TOKENS: Token[] = [USDC, ARB, WETH];

/** Tokens disponibles en el swap: ETH nativo + ERC20. */
export const SWAP_TOKENS: Token[] = [ETH, ...TOKENS];

export function isNative(address: Address): boolean {
  return address.toLowerCase() === NATIVE_ADDRESS.toLowerCase();
}

/** Dirección que entiende el router: ETH nativo → WETH. */
export function toRouterAddress(address: Address): Address {
  return isNative(address) ? WETH.address : address;
}

export function findToken(address: Address): Token {
  return SWAP_TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())!;
}
