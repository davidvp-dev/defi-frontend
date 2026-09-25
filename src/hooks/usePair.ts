import { zeroAddress, type Address } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { uniswapV2FactoryAbi, uniswapV2PairAbi } from '../abi/uniswapV2';

/**
 * Busca el par A/B en la factory y lee sus reservas (ya ordenadas como A/B, no token0/token1),
 * el totalSupply de LP y el balance de LP del usuario.
 */
export function usePair(factory: Address | undefined, tokenA: Address, tokenB: Address) {
  const { address } = useAccount();

  const { data: pairAddress } = useReadContract({
    address: factory,
    abi: uniswapV2FactoryAbi,
    functionName: 'getPair',
    args: [tokenA, tokenB],
    query: { enabled: Boolean(factory) && tokenA !== tokenB },
  });

  const pair = pairAddress && pairAddress !== zeroAddress ? pairAddress : undefined;

  const { data } = useReadContracts({
    contracts: [
      { address: pair, abi: uniswapV2PairAbi, functionName: 'token0' },
      { address: pair, abi: uniswapV2PairAbi, functionName: 'getReserves' },
      { address: pair, abi: uniswapV2PairAbi, functionName: 'totalSupply' },
      { address: pair, abi: uniswapV2PairAbi, functionName: 'balanceOf', args: [address ?? zeroAddress] },
    ],
    query: { enabled: Boolean(pair) },
  });

  const token0 = data?.[0]?.result as Address | undefined;
  const reserves = data?.[1]?.result as readonly [bigint, bigint, number] | undefined;
  const totalSupply = data?.[2]?.result as bigint | undefined;
  const lpBalance = data?.[3]?.result as bigint | undefined;

  let reserveA: bigint | undefined;
  let reserveB: bigint | undefined;
  if (token0 && reserves) {
    const aIsToken0 = token0.toLowerCase() === tokenA.toLowerCase();
    reserveA = aIsToken0 ? reserves[0] : reserves[1];
    reserveB = aIsToken0 ? reserves[1] : reserves[0];
  }

  return {
    pair,
    exists: Boolean(pair),
    isChecked: pairAddress !== undefined,
    reserveA,
    reserveB,
    totalSupply,
    lpBalance,
  };
}
