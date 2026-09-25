import { useState } from 'react';
import { formatUnits, type Address } from 'viem';
import { contractAbi } from '../config/contract';
import { findToken } from '../config/tokens';
import type { usePair } from '../hooks/usePair';
import { useAllowance } from '../hooks/useAllowance';
import { useTx } from '../hooks/useTx';
import { ApproveButton } from './ApproveButton';
import { TxStatus } from './TxStatus';
import { applySlippage, deadlineFromNow, fmt, safeParseUnits } from '../lib/format';

type Props = {
  contractAddress: Address;
  tokenA: Address;
  tokenB: Address;
  pool: ReturnType<typeof usePair>;
  slippageBps: number;
};

const LP_DECIMALS = 18; // Los LP tokens de Uniswap V2 siempre tienen 18 decimales

export function RemoveLiquidity({ contractAddress, tokenA, tokenB, pool, slippageBps }: Props) {
  const a = findToken(tokenA);
  const b = findToken(tokenB);
  const [amount, setAmount] = useState('');

  const liquidity = safeParseUnits(amount, LP_DECIMALS);
  const lpBalance = pool.lpBalance ?? 0n;

  // Lo que devolvería el pool: liquidity * reserva / totalSupply
  const outA =
    pool.totalSupply && pool.reserveA !== undefined ? (liquidity * pool.reserveA) / pool.totalSupply : 0n;
  const outB =
    pool.totalSupply && pool.reserveB !== undefined ? (liquidity * pool.reserveB) / pool.totalSupply : 0n;

  const allowance = useAllowance(pool.pair, contractAddress);
  const approved = allowance !== undefined && allowance >= liquidity;
  const insufficient = liquidity > lpBalance;

  const remove = useTx();

  const handleRemove = () => {
    remove.reset();
    remove.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'removeLiquidity',
      args: [
        tokenA,
        tokenB,
        liquidity,
        applySlippage(outA, slippageBps),
        applySlippage(outB, slippageBps),
        deadlineFromNow(),
      ],
    });
  };

  const setPct = (pct: number) => {
    const v = (lpBalance * BigInt(pct)) / 100n;
    setAmount(v > 0n ? formatUnits(v, LP_DECIMALS) : '');
  };

  let label = 'removeLiquidity()';
  if (remove.isSending) label = 'Confirma en la wallet…';
  else if (remove.isConfirming) label = 'Confirmando…';
  else if (lpBalance === 0n) label = 'No tienes LP tokens de este par';
  else if (liquidity === 0n) label = 'Introduce cantidad de LP';
  else if (insufficient) label = 'No tienes tantos LP tokens';
  else if (!approved) label = 'removeLiquidity() — aprueba el LP token primero';

  return (
    <div className="card">
      <h2>Retirar liquidez</h2>
      <div className="token-box">
        <div className="token-box-head">
          <span className="label">LP tokens a quemar</span>
          <span className="label">
            Balance: <span className="value">{fmt(lpBalance, LP_DECIMALS, 8)}</span>
          </span>
        </div>
        <div className="token-box-body">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span className="lp-tag">{a.symbol}/{b.symbol} LP</span>
        </div>
        <div className="pct-row">
          {[25, 50, 75, 100].map((p) => (
            <button key={p} type="button" className="chip" onClick={() => setPct(p)} disabled={lpBalance === 0n}>
              {p === 100 ? 'MAX' : `${p}%`}
            </button>
          ))}
        </div>
      </div>

      {liquidity > 0n && (
        <div className="details">
          <div className="row">
            <span className="label">Recibes aprox.</span>
            <span className="value">
              {fmt(outA, a.decimals)} {a.symbol} + {fmt(outB, b.decimals)} {b.symbol}
            </span>
          </div>
          <div className="row">
            <span className="label">Mínimos ({slippageBps / 100}% slippage)</span>
            <span className="value">
              {fmt(applySlippage(outA, slippageBps), a.decimals)} {a.symbol} +{' '}
              {fmt(applySlippage(outB, slippageBps), b.decimals)} {b.symbol}
            </span>
          </div>
        </div>
      )}

      {pool.pair && (
        <ApproveButton token={pool.pair} symbol="LP" amount={liquidity} spender={contractAddress} />
      )}

      <button
        className="action danger full"
        disabled={remove.isBusy || liquidity === 0n || insufficient || !approved}
        onClick={handleRemove}
      >
        {label}
      </button>
      <TxStatus tx={remove} label="removeLiquidity" />
    </div>
  );
}
