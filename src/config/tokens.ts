import type { Address } from 'viem';

export type Token = {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
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

export const TOKENS: Token[] = [USDC, ARB, WETH];

export function findToken(address: Address): Token {
  return TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase())!;
}
