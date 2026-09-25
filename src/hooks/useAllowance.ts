import { erc20Abi, type Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

/** Allowance que el usuario ha dado a `spender` (el CustomDEX) sobre `token`. */
export function useAllowance(token: Address | undefined, spender: Address) {
  const { address } = useAccount();
  const { data } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, spender],
    query: { enabled: Boolean(address && token) },
  });
  return data;
}

/*
!contractAddress    // prefijo → NOT lógico de JavaScript (true ↔ false)
address!            // sufijo  → aserción de TypeScript (quita undefined del tipo)
*/
