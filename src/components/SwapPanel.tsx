import { useState } from 'react';
import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { contractAbi } from '../config/contract';
import { USDC, ARB, WETH, findToken } from '../config/tokens';
import { uniswapV2RouterAbi } from '../abi/uniswapV2';
import { usePair } from '../hooks/usePair';
import { useAllowance } from '../hooks/useAllowance';
import { useTx } from '../hooks/useTx';
import { useTokenBalance, TokenInput } from './TokenInput';
import { ApproveButton } from './ApproveButton';
import { TxStatus } from './TxStatus';
import { applySlippage, deadlineFromNow, fmt, safeParseUnits } from '../lib/format';

type Props = {
  contractAddress: Address;
  router: Address;
  factory: Address;
  slippageBps: number;
};

export function SwapPanel({ contractAddress, router, factory, slippageBps }: Props) {
  const [tokenIn, setTokenIn] = useState<Address>(USDC.address);
  const [tokenOut, setTokenOut] = useState<Address>(ARB.address);
  const [amount, setAmount] = useState('');

  const inInfo = findToken(tokenIn);
  const outInfo = findToken(tokenOut);
  const amountIn = safeParseUnits(amount, inInfo.decimals);

  // --- Ruta: par directo si existe; si no, salto intermedio por WETH ---
  const direct = usePair(factory, tokenIn, tokenOut);
  const viaWeth = tokenIn !== WETH.address && tokenOut !== WETH.address;
  const path: Address[] =
    direct.exists || !viaWeth ? [tokenIn, tokenOut] : [tokenIn, WETH.address, tokenOut];

  // --- Cotización: router.getAmountsOut (view, sin gas) ---
  const { data: amountsOut, error: quoteError, isFetching: isQuoting } = useReadContract({
    address: router,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [amountIn, path],
    query: { enabled: amountIn > 0n && direct.isChecked },
  });

  const expectedOut = amountsOut?.[amountsOut.length - 1];
  const minOut = expectedOut !== undefined ? applySlippage(expectedOut, slippageBps) : undefined;

  // Impacto en precio (solo para par directo): compara precio ejecutado vs precio spot del pool
  let priceImpact: number | undefined;
  if (path.length === 2 && expectedOut && direct.reserveA && direct.reserveB && amountIn > 0n) {
    const spot = Number(direct.reserveB) / Number(direct.reserveA);
    const exec = Number(expectedOut) / Number(amountIn);
    priceImpact = Math.max(0, (1 - exec / spot) * 100);
  }

  // --- Allowance + balance para habilitar el botón ---
  const allowance = useAllowance(tokenIn, contractAddress);
  const balanceIn = useTokenBalance(tokenIn);
  const hasAllowance = allowance !== undefined && allowance >= amountIn;
  const insufficient = balanceIn !== undefined && amountIn > balanceIn;

  const swap = useTx();

  const handleSwap = () => {
    if (!minOut) return;
    swap.reset();
    swap.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'swapTokens',
      args: [amountIn, minOut, path, deadlineFromNow()],
    });
  };

  const flip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmount('');
  };

  const selectIn = (t: Address) => {
    if (t === tokenOut) setTokenOut(tokenIn);
    setTokenIn(t);
  };
  const selectOut = (t: Address) => {
    if (t === tokenIn) setTokenIn(tokenOut);
    setTokenOut(t);
  };

  let buttonLabel = 'swapTokens()';
  if (swap.isSending) buttonLabel = 'Confirma en la wallet…';
  else if (swap.isConfirming) buttonLabel = 'Confirmando…';
  else if (amountIn === 0n) buttonLabel = 'Introduce un importe';
  else if (insufficient) buttonLabel = `Saldo de ${inInfo.symbol} insuficiente`;
  else if (!hasAllowance) buttonLabel = `2. swapTokens() — aprueba ${inInfo.symbol} primero`;

  return (
    <div className="card">
      <h2>Swap</h2>

      <TokenInput
        label="Pagas"
        token={tokenIn}
        onTokenChange={selectIn}
        amount={amount}
        onAmountChange={setAmount}
      />

      <div className="flip-row">
        <button className="flip" onClick={flip} aria-label="Invertir tokens">
          ↓↑
        </button>
      </div>

      <TokenInput
        label="Recibes (estimado)"
        token={tokenOut}
        onTokenChange={selectOut}
        amount={expectedOut !== undefined ? fmt(expectedOut, outInfo.decimals, 8).replace(/,/g, '') : ''}
        readOnly
      />

      {amountIn > 0n && (
        <div className="details">
          <div className="row">
            <span className="label">Ruta</span>
            <span className="value">{path.map((p) => findToken(p).symbol).join(' → ')}</span>
          </div>
          <div className="row">
            <span className="label">Precio</span>
            <span className="value">
              {expectedOut !== undefined
                ? `1 ${inInfo.symbol} ≈ ${(
                    Number(expectedOut) / 10 ** outInfo.decimals /
                    (Number(amountIn) / 10 ** inInfo.decimals)
                  ).toPrecision(6)} ${outInfo.symbol}`
                : isQuoting
                  ? 'Cotizando…'
                  : '—'}
            </span>
          </div>
          <div className="row">
            <span className="label">Mínimo recibido ({slippageBps / 100}% slippage)</span>
            <span className="value">
              {fmt(minOut, outInfo.decimals)} {outInfo.symbol}
            </span>
          </div>
          {priceImpact !== undefined && (
            <div className="row">
              <span className="label">Impacto en precio</span>
              <span className={`value ${priceImpact > 3 ? 'warn' : ''}`}>{priceImpact.toFixed(2)}%</span>
            </div>
          )}
        </div>
      )}

      {quoteError && amountIn > 0n && (
        <p className="status error">No hay liquidez para esta ruta en Uniswap V2.</p>
      )}

      <ApproveButton token={tokenIn} symbol={inInfo.symbol} amount={amountIn} spender={contractAddress} />

      <button
        className="action full"
        disabled={swap.isBusy || amountIn === 0n || !minOut || insufficient || !hasAllowance}
        onClick={handleSwap}
      >
        {buttonLabel}
      </button>

      <TxStatus tx={swap} label="swap" />
    </div>
  );
}
