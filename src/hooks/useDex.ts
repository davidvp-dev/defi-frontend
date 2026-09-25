import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { contractAbi } from '../config/contract';

/** Lee del propio CustomDEX las direcciones inmutables del router y la factory de Uniswap V2. */
export function useDex(contractAddress: Address) {
  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: contractAbi, functionName: 'UNISWAP_V2_ROUTER_ADDRESS' },
      { address: contractAddress, abi: contractAbi, functionName: 'UNISWAP_V2_FACTORY_ADDRESS' },
    ],
  });

  return {
    router: data?.[0]?.result as Address | undefined,
    factory: data?.[1]?.result as Address | undefined,
    isLoading,
  };
}
