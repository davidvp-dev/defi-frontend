import { useState } from 'react';
import type { Address } from 'viem';
import { USDC, ARB, TOKENS, findToken } from '../config/tokens';
import { usePair } from '../hooks/usePair';
import { fmt } from '../lib/format';
import { AddLiquidity } from './AddLiquidity';
import { RemoveLiquidity } from './RemoveLiquidity';

type Props = {
  contractAddress: Address;
  factory: Address;
  slippageBps: number;
};

/** Selector de par + info del pool + formularios de añadir y retirar liquidez. */
export function LiquidityPanel({ contractAddress, factory, slippageBps }: Props) {
  const [tokenA, setTokenA] = useState<Address>(USDC.address);
  const [tokenB, setTokenB] = useState<Address>(ARB.address);

  const a = findToken(tokenA);
  const b = findToken(tokenB);
  const pool = usePair(factory, tokenA, tokenB);

  const share =
    pool.lpBalance !== undefined && pool.totalSupply
      ? (Number(pool.lpBalance) / Number(pool.totalSupply)) * 100
      : undefined;

  const selectA = (t: Address) => {
    if (t === tokenB) setTokenB(tokenA);
    setTokenA(t);
  };
  const selectB = (t: Address) => {
    if (t === tokenA) setTokenA(tokenB);
    setTokenB(t);
  };

  return (
    <>
      <div className="card">
        <h2>Pool</h2>
        <div className="pair-select">
          <select value={tokenA} onChange={(e) => selectA(e.target.value as Address)}>
            {TOKENS.map((t) => (
              <option key={t.address} value={t.address}>{t.symbol}</option>
            ))}
          </select>
          <span className="label">/</span>
          <select value={tokenB} onChange={(e) => selectB(e.target.value as Address)}>
            {TOKENS.map((t) => (
              <option key={t.address} value={t.address}>{t.symbol}</option>
            ))}
          </select>
        </div>

        {!pool.isChecked && <p className="hint">Buscando par en la factory…</p>}
        {pool.isChecked && !pool.exists && (
          <p className="hint">
            No existe el par {a.symbol}/{b.symbol} en Uniswap V2. Si añades liquidez, el router
            lo creará y tú fijarás el precio inicial.
          </p>
        )}
        {pool.exists && (
          <div className="details">
            <div className="row">
              <span className="label">Par (LP token)</span>
              <span className="value mono-sm">{pool.pair}</span>
            </div>
            <div className="row">
              <span className="label">Reservas</span>
              <span className="value">
                {fmt(pool.reserveA, a.decimals, 2)} {a.symbol} · {fmt(pool.reserveB, b.decimals, 2)} {b.symbol}
              </span>
            </div>
            <div className="row">
              <span className="label">Tus LP tokens</span>
              <span className="value">{fmt(pool.lpBalance, 18, 8)}</span>
            </div>
            <div className="row">
              <span className="label">Tu participación</span>
              <span className="value">{share !== undefined ? `${share.toPrecision(3)}%` : '—'}</span>
            </div>
          </div>
        )}
      </div>

      <AddLiquidity
        contractAddress={contractAddress}
        tokenA={tokenA}
        tokenB={tokenB}
        pool={pool}
        slippageBps={slippageBps}
      />

      {pool.exists && (
        <RemoveLiquidity
          contractAddress={contractAddress}
          tokenA={tokenA}
          tokenB={tokenB}
          pool={pool}
          slippageBps={slippageBps}
        />
      )}
    </>
  );
}
