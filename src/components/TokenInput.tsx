import { erc20Abi, type Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { TOKENS, findToken } from '../config/tokens';
import { fmt } from '../lib/format';
import { formatUnits } from 'viem';

type Props = {
  label: string;
  token: Address;
  onTokenChange?: (token: Address) => void;
  amount: string;
  onAmountChange?: (value: string) => void;
  readOnly?: boolean;
  /** Oculta este token del selector (p. ej. el otro lado del par). */
  exclude?: Address;
};

export function useTokenBalance(token: Address) {
  const { address } = useAccount();
  const { data } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: Boolean(address) },
  });
  return data;
}

/** Caja de importe + selector de token + balance del usuario con botón MAX. */
export function TokenInput({ label, token, onTokenChange, amount, onAmountChange, readOnly, exclude }: Props) {
  const info = findToken(token);
  const balance = useTokenBalance(token);

  return (
    <div className="token-box">
      <div className="token-box-head">
        <span className="label">{label}</span>
        <span className="label">
          Balance: <span className="value">{fmt(balance, info.decimals)}</span>
          {!readOnly && onAmountChange && balance !== undefined && balance > 0n && (
            <button
              type="button"
              className="link"
              onClick={() => onAmountChange(formatUnits(balance, info.decimals))}
            >
              MAX
            </button>
          )}
        </span>
      </div>
      <div className="token-box-body">
        <input
          type="number"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmountChange?.(e.target.value)}
        />
        <select
          value={token}
          disabled={!onTokenChange}
          onChange={(e) => onTokenChange?.(e.target.value as Address)}
        >
          {TOKENS.filter((t) => t.address !== exclude).map((t) => (
            <option key={t.address} value={t.address}>
              {t.symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
