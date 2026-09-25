import { useState } from 'react';
import { formatUnits, type Address } from 'viem';
import { contractAbi } from '../config/contract';
import { findToken } from '../config/tokens';
import type { usePair } from '../hooks/usePair';
import { useAllowance } from '../hooks/useAllowance';
import { useTx } from '../hooks/useTx';
import { TokenInput, useTokenBalance } from './TokenInput';
import { ApproveButton } from './ApproveButton';
import { TxStatus } from './TxStatus';
import { applySlippage, deadlineFromNow, safeParseUnits } from '../lib/format';

type Props = {
  contractAddress: Address;
  tokenA: Address;
  tokenB: Address;
  pool: ReturnType<typeof usePair>;
  slippageBps: number;
};

export function AddLiquidity({ contractAddress, tokenA, tokenB, pool, slippageBps }: Props) {
  const a = findToken(tokenA);
  const b = findToken(tokenB);

  // Guardamos el lado que escribió el usuario; el otro se calcula con las reservas del pool
  const [input, setInput] = useState<{ side: 'A' | 'B'; value: string }>({ side: 'A', value: '' });

  const hasReserves = pool.exists && !!pool.reserveA && !!pool.reserveB;
  // Si el par no existe, se permiten ambos importes libres (fijan el precio inicial)
  const [freeB, setFreeB] = useState('');

  let amountA: bigint;
  let amountB: bigint;
  let textA: string;
  let textB: string;

  if (hasReserves) {
    if (input.side === 'A') {
      amountA = safeParseUnits(input.value, a.decimals);
      amountB = (amountA * pool.reserveB!) / pool.reserveA!; // router.quote()
      textA = input.value;
      textB = amountA > 0n ? formatUnits(amountB, b.decimals) : '';
    } else {
      amountB = safeParseUnits(input.value, b.decimals);
      amountA = (amountB * pool.reserveA!) / pool.reserveB!;
      textB = input.value;
      textA = amountB > 0n ? formatUnits(amountA, a.decimals) : '';
    }
  } else {
    textA = input.value;
    textB = freeB;
    amountA = safeParseUnits(textA, a.decimals);
    amountB = safeParseUnits(textB, b.decimals);
  }

  const allowanceA = useAllowance(tokenA, contractAddress);
  const allowanceB = useAllowance(tokenB, contractAddress);
  const balanceA = useTokenBalance(tokenA);
  const balanceB = useTokenBalance(tokenB);

  const ready = amountA > 0n && amountB > 0n;
  const approved =
    allowanceA !== undefined && allowanceB !== undefined && allowanceA >= amountA && allowanceB >= amountB;
  const insufficient =
    (balanceA !== undefined && amountA > balanceA) || (balanceB !== undefined && amountB > balanceB);

  const add = useTx();

  const handleAdd = () => {
    add.reset();
    add.writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'addLiquidity',
      args: [
        tokenA,
        tokenB,
        amountA,
        amountB,
        applySlippage(amountA, slippageBps),
        applySlippage(amountB, slippageBps),
        deadlineFromNow(),
      ],
    });
  };

  let label = 'addLiquidity()';
  if (add.isSending) label = 'Confirma en la wallet…';
  else if (add.isConfirming) label = 'Confirmando…';
  else if (!ready) label = 'Introduce importes';
  else if (insufficient) label = 'Saldo insuficiente';
  else if (!approved) label = 'addLiquidity() — aprueba ambos tokens primero';

  return (
    <div className="card">
      <h2>Añadir liquidez</h2>
      <TokenInput
        label={`Depositas ${a.symbol}`}
        token={tokenA}
        amount={textA}
        onAmountChange={(v) => setInput({ side: 'A', value: v })}
      />
      <div className="plus">+</div>
      <TokenInput
        label={`Depositas ${b.symbol}`}
        token={tokenB}
        amount={textB}
        onAmountChange={(v) => (hasReserves ? setInput({ side: 'B', value: v }) : setFreeB(v))}
      />

      <p className="hint" style={{ marginTop: 12 }}>
        {hasReserves
          ? 'El otro importe se calcula con las reservas actuales del pool. Los tokens que el router no use se te devuelven.'
          : 'Par nuevo: la proporción que elijas fija el precio inicial.'}{' '}
        Mínimos con {slippageBps / 100}% de slippage.
      </p>

      <ApproveButton token={tokenA} symbol={a.symbol} amount={amountA} spender={contractAddress} />
      <ApproveButton token={tokenB} symbol={b.symbol} amount={amountB} spender={contractAddress} />

      <button
        className="action full"
        disabled={add.isBusy || !ready || insufficient || !approved}
        onClick={handleAdd}
      >
        {label}
      </button>
      <TxStatus tx={add} label="addLiquidity" />
    </div>
  );
}
