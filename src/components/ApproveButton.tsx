import { erc20Abi, type Address } from 'viem';
import { useAllowance } from '../hooks/useAllowance';
import { useTx } from '../hooks/useTx';
import { TxStatus } from './TxStatus';

type Props = {
  token: Address;
  symbol: string;
  amount: bigint;
  spender: Address;
};

/**
 * CustomDEX hace transferFrom desde tu wallet, así que antes de cada operación
 * necesita allowance. Este botón solo aparece si el allowance actual no alcanza.
 * Se aprueba el importe exacto (no infinito).
 */
export function ApproveButton({ token, symbol, amount, spender }: Props) {
  const allowance = useAllowance(token, spender);
  const tx = useTx();

  const needsApproval = amount > 0n && allowance !== undefined && allowance < amount;
  if (!needsApproval && !tx.hash) return null;

  return (
    <div className="approve">
      {needsApproval && (
        <button
          className="action secondary full"
          disabled={tx.isBusy}
          onClick={() => {
            tx.reset();
            tx.writeContract({
              address: token,
              abi: erc20Abi,
              functionName: 'approve',
              args: [spender, amount],
            });
          }}
        >
          {tx.isSending ? 'Confirma en la wallet…' : tx.isConfirming ? 'Aprobando…' : `1. Aprobar ${symbol}`}
        </button>
      )}
      <TxStatus tx={tx} label={`approve ${symbol}`} />
    </div>
  );
}
