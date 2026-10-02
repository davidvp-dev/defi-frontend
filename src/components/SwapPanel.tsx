import { useState } from 'react';
import type { Address } from 'viem';
import { useReadContract } from 'wagmi';
import { contractAbi } from '../config/contract';
import { ETH, USDC, WETH, SWAP_TOKENS, findToken, isNative, toRouterAddress } from '../config/tokens';
import { uniswapV2RouterAbi } from '../abi/uniswapV2';
import { usePair } from '../hooks/usePair';
import { useAllowance } from '../hooks/useAllowance';
import { useProtocol } from '../hooks/useProtocol';
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

/**
 * Tipo de swap según los tokens elegidos. Cada uno usa una función distinta de CustomDEX:
 *  - erc20:  ERC20 → ERC20   swapTokens(amountIn, amountOutMin, path, deadline)
 *  - ethIn:  ETH   → ERC20   swapEthForERC20Tokens(amountOutMin, path, deadline) + value
 *  - ethOut: ERC20 → ETH     swapERC20TokensForEth(amountIn, amountOutMin, path, deadline)
 *  - wrap:   ETH  ↔ WETH     no es un swap (sería wrap/unwrap), no se permite
 */
type SwapMode = 'erc20' | 'ethIn' | 'ethOut' | 'wrap';

export function SwapPanel({ contractAddress, router, factory, slippageBps }: Props) {
  const [tokenIn, setTokenIn] = useState<Address>(ETH.address);
  const [tokenOut, setTokenOut] = useState<Address>(USDC.address);
  const [amount, setAmount] = useState('');

  const inInfo = findToken(tokenIn);
  const outInfo = findToken(tokenOut);
  const amountIn = safeParseUnits(amount, inInfo.decimals);

  // --- Para el router, ETH nativo es WETH ---
  const routerIn = toRouterAddress(tokenIn);
  const routerOut = toRouterAddress(tokenOut);

  let mode: SwapMode = 'erc20';
  if (routerIn === routerOut) mode = 'wrap';
  else if (isNative(tokenIn)) mode = 'ethIn';
  else if (isNative(tokenOut)) mode = 'ethOut';

  // --- Ruta: par directo si existe; si no, salto intermedio por WETH ---
  const direct = usePair(factory, routerIn, routerOut);
  const viaWeth = routerIn !== WETH.address && routerOut !== WETH.address;
  const path: Address[] =
    direct.exists || !viaWeth ? [routerIn, routerOut] : [routerIn, WETH.address, routerOut];

  // --- Cotización bruta del router (antes de la comisión de CustomDEX) ---
  const { data: amountsOut, error: quoteError, isFetching: isQuoting } = useReadContract({
    address: router,
    abi: uniswapV2RouterAbi,
    functionName: 'getAmountsOut',
    args: [amountIn, path],
    query: { enabled: amountIn > 0n && direct.isChecked && mode !== 'wrap' },
  });
  const grossOut = amountsOut?.[amountsOut.length - 1];

  // --- Comisión del protocolo: CustomDEX se queda feeBps del importe de salida ---
  const { feeBps } = useProtocol(contractAddress);
  const fee = feeBps ?? 0n;
  const protocolFee = grossOut !== undefined ? (grossOut * fee) / 10_000n : undefined;
  const netOut = grossOut !== undefined && protocolFee !== undefined ? grossOut - protocolFee : undefined;

  // El contrato aplica amountOutMin ANTES de la comisión (lo comprueba el router),
  // así que el mínimo se calcula sobre el bruto. Lo que tú recibes como mínimo es ese valor menos la comisión.
  const minOutGross = grossOut !== undefined ? applySlippage(grossOut, slippageBps) : undefined;
  const minOutNet = minOutGross !== undefined ? minOutGross - (minOutGross * fee) / 10_000n : undefined;

  // Impacto en precio (solo para par directo): compara precio ejecutado vs precio spot del pool
  let priceImpact: number | undefined;
  if (path.length === 2 && grossOut && direct.reserveA && direct.reserveB && amountIn > 0n) {
    const spot = Number(direct.reserveB) / Number(direct.reserveA);
    const exec = Number(grossOut) / Number(amountIn);
    priceImpact = Math.max(0, (1 - exec / spot) * 100);
  }

  // --- Allowance (no aplica a ETH nativo: se envía como value) + balance ---
  const needsApproval = mode !== 'ethIn';
  const allowance = useAllowance(needsApproval ? tokenIn : undefined, contractAddress);
  const balanceIn = useTokenBalance(tokenIn);
  const hasAllowance = !needsApproval || (allowance !== undefined && allowance >= amountIn);
  const insufficient = balanceIn !== undefined && amountIn > balanceIn;

  const swap = useTx();
  const deadline = () => deadlineFromNow();

  const handleSwap = () => {
    if (minOutGross === undefined) return;
    swap.reset();
    const base = { address: contractAddress, abi: contractAbi } as const;

    if (mode === 'ethIn') {
      swap.writeContract({
        ...base,
        functionName: 'swapEthForERC20Tokens',
        args: [minOutGross, path, deadline()],
        value: amountIn,
      });
    } else if (mode === 'ethOut') {
      swap.writeContract({
        ...base,
        functionName: 'swapERC20TokensForEth',
        args: [amountIn, minOutGross, path, deadline()],
      });
    } else {
      swap.writeContract({
        ...base,
        functionName: 'swapTokens',
        args: [amountIn, minOutGross, path, deadline()],
      });
    }
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

  const fnName =
    mode === 'ethIn' ? 'swapEthForERC20Tokens()' : mode === 'ethOut' ? 'swapERC20TokensForEth()' : 'swapTokens()';

  let buttonLabel = fnName;
  if (swap.isSending) buttonLabel = 'Confirma en la wallet…';
  else if (swap.isConfirming) buttonLabel = 'Confirmando…';
  else if (mode === 'wrap') buttonLabel = 'ETH ↔ WETH no se puede intercambiar aquí';
  else if (amountIn === 0n) buttonLabel = 'Introduce un importe';
  else if (insufficient) buttonLabel = `Saldo de ${inInfo.symbol} insuficiente`;
  else if (!hasAllowance) buttonLabel = `2. ${fnName} — aprueba ${inInfo.symbol} primero`;

  // Para mostrar la ruta, el primer/último salto se enseña como ETH si es nativo
  const routeLabel = path
    .map((p, i) => {
      if (i === 0 && mode === 'ethIn') return ETH.symbol;
      if (i === path.length - 1 && mode === 'ethOut') return ETH.symbol;
      return findToken(p).symbol;
    })
    .join(' → ');

  return (
    <div className="card">
      <h2>Swap</h2>

      <TokenInput
        label="Pagas"
        token={tokenIn}
        tokens={SWAP_TOKENS}
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
        label="Recibes (estimado, ya descontada la comisión)"
        token={tokenOut}
        tokens={SWAP_TOKENS}
        onTokenChange={selectOut}
        amount={netOut !== undefined ? fmt(netOut, outInfo.decimals, 8).replace(/,/g, '') : ''}
        readOnly
      />

      {mode === 'wrap' && (
        <p className="status error">
          ETH y WETH valen lo mismo: pasar de uno a otro es wrap/unwrap (contrato WETH), no un swap
          de CustomDEX. Elige otro token.
        </p>
      )}

      {amountIn > 0n && mode !== 'wrap' && (
        <div className="details">
          <div className="row">
            <span className="label">Ruta</span>
            <span className="value">{routeLabel}</span>
          </div>
          <div className="row">
            <span className="label">Precio</span>
            <span className="value">
              {netOut !== undefined
                ? `1 ${inInfo.symbol} ≈ ${(
                    Number(netOut) / 10 ** outInfo.decimals /
                    (Number(amountIn) / 10 ** inInfo.decimals)
                  ).toPrecision(6)} ${outInfo.symbol}`
                : isQuoting
                  ? 'Cotizando…'
                  : '—'}
            </span>
          </div>
          <div className="row">
            <span className="label">
              Comisión CustomDEX ({feeBps !== undefined ? `${Number(feeBps) / 100}%` : '…'})
            </span>
            <span className="value">
              {fmt(protocolFee, outInfo.decimals)} {outInfo.symbol}
            </span>
          </div>
          <div className="row">
            <span className="label">Mínimo recibido ({slippageBps / 100}% slippage)</span>
            <span className="value">
              {fmt(minOutNet, outInfo.decimals)} {outInfo.symbol}
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

      {quoteError && amountIn > 0n && mode !== 'wrap' && (
        <p className="status error">No hay liquidez para esta ruta en Uniswap V2.</p>
      )}

      {needsApproval && mode !== 'wrap' && (
        <ApproveButton token={tokenIn} symbol={inInfo.symbol} amount={amountIn} spender={contractAddress} />
      )}

      <button
        className="action full"
        disabled={
          swap.isBusy || mode === 'wrap' || amountIn === 0n || minOutGross === undefined || insufficient || !hasAllowance
        }
        onClick={handleSwap}
      >
        {buttonLabel}
      </button>

      <TxStatus tx={swap} label="swap" />
    </div>
  );
}
