import { erc20Abi, formatEther, type Address } from 'viem';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { TOKENS } from '../config/tokens';
import { fmt, shortAddress } from '../lib/format';

type Props = {
  contractAddress: Address;
  router?: Address;
  factory?: Address;
};

/** Resumen de la wallet (ETH + tokens) y de las direcciones que usa CustomDEX. */
export function WalletPanel({ contractAddress, router, factory }: Props) {
  const { address } = useAccount();
  const { data: eth } = useBalance({ address });

  const { data: balances } = useReadContracts({
    contracts: TOKENS.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [address!] as const,
    })),
    query: { enabled: Boolean(address) },
  });

  return (
    <div className="card">
      <h2>Tu wallet</h2>
      <div className="balances">
        <div className="balance">
          <span className="label">ETH</span>
          <span className="value">{eth ? Number(formatEther(eth.value)).toFixed(4) : '—'}</span>
        </div>
        {TOKENS.map((t, i) => (
          <div className="balance" key={t.address}>
            <span className="label">{t.symbol}</span>
            <span className="value">{fmt(balances?.[i]?.result as bigint | undefined, t.decimals, 4)}</span>
          </div>
        ))}
      </div>
      <div className="details" style={{ marginTop: 16 }}>
        <div className="row">
          <span className="label">CustomDEX</span>
          <span className="value mono-sm" title={contractAddress}>{shortAddress(contractAddress)}</span>
        </div>
        <div className="row">
          <span className="label">Router V2</span>
          <span className="value mono-sm" title={router}>{router ? shortAddress(router) : '—'}</span>
        </div>
        <div className="row">
          <span className="label">Factory V2</span>
          <span className="value mono-sm" title={factory}>{factory ? shortAddress(factory) : '—'}</span>
        </div>
      </div>
    </div>
  );
}
