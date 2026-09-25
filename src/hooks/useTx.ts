import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

/**
 * Envuelve los dos hooks encadenados de siempre (enviar tx + esperar recibo) y,
 * cuando la tx se confirma, invalida todas las lecturas cacheadas para que
 * balances, allowances y reservas se refresquen solos.
 */
export function useTx() {
  const queryClient = useQueryClient();
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data });

  const isConfirmed = receipt.isSuccess && receipt.data?.status === 'success';
  const isReverted = receipt.isSuccess && receipt.data?.status === 'reverted';

  useEffect(() => {
    if (receipt.isSuccess) queryClient.invalidateQueries();
  }, [receipt.isSuccess, queryClient]);

  return {
    writeContract: write.writeContract,
    reset: write.reset,
    hash: write.data,
    isSending: write.isPending,
    isConfirming: receipt.isLoading,
    isConfirmed,
    isReverted,
    isBusy: write.isPending || receipt.isLoading,
    error: write.error ?? receipt.error,
  };
}

export type Tx = ReturnType<typeof useTx>;
