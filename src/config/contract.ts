import { arbitrum } from 'wagmi/chains';
import type { Address } from 'viem';
import { customDexAbi } from '../abi/CustomDEX';
import { arbitrumFork } from './wagmi';

export const contractAbi = customDexAbi;

export const contractAddresses: Record<number, Address | undefined> = {
  [arbitrumFork.id]: (import.meta.env.VITE_CONTRACT_ADDRESS_LOCAL || undefined) as Address | undefined,
  [arbitrum.id]: (import.meta.env.VITE_CONTRACT_ADDRESS_ARBITRUM || undefined) as Address | undefined,
};

export function getContractAddress(chainId: number | undefined): Address | undefined {
  if (!chainId) return undefined;
  return contractAddresses[chainId] || undefined;
}
