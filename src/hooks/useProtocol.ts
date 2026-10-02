import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { contractAbi } from '../config/contract';

/** Lee la configuración de comisiones y propiedad de CustomDEX en una sola llamada. */
export function useProtocol(contractAddress: Address) {
  const c = { address: contractAddress, abi: contractAbi } as const;
  const { data } = useReadContracts({
    contracts: [
      { ...c, functionName: 'feeBps' },
      { ...c, functionName: 'MAX_FEE_BPS' },
      { ...c, functionName: 'feeRecipient' },
      { ...c, functionName: 'owner' },
      { ...c, functionName: 'pendingOwner' },
    ],
  });

  return {
    feeBps: data?.[0]?.result as bigint | undefined,
    maxFeeBps: data?.[1]?.result as bigint | undefined,
    feeRecipient: data?.[2]?.result as Address | undefined,
    owner: data?.[3]?.result as Address | undefined,
    pendingOwner: data?.[4]?.result as Address | undefined,
  };
}
