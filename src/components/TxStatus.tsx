import type { BaseError } from 'viem';
import type { Tx } from '../hooks/useTx';

/** Muestra el hash de la tx (pendiente / confirmada / revertida) y el error si lo hay. */
export function TxStatus({ tx, label }: { tx: Tx; label?: string }) {
  const prefix = label ? `${label} · ` : '';
  const err = tx.error as BaseError | null;

  return (
    <>
      {tx.hash && (
        <p className={`status ${tx.isConfirmed ? 'success' : tx.isReverted ? 'error' : 'pending'}`}>
          {prefix}
          {tx.isConfirmed ? 'Confirmado: ' : tx.isReverted ? 'Revertida: ' : 'Pendiente: '}
          {tx.hash}
        </p>
      )}
      {err && <p className="status error">{prefix}{err.shortMessage ?? err.message.split('\n')[0]}</p>}
    </>
  );
}
