import { erc20Abi, formatUnits, parseEther, type Address } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { TOKENS, findToken, isNative, type Token } from '../config/tokens';
import { fmt } from '../lib/format';

type Props = {
  label: string;
  token: Address;
  onTokenChange?: (token: Address) => void;
  amount: string;
  onAmountChange?: (value: string) => void;
  readOnly?: boolean;
  /** Oculta este token del selector (p. ej. el otro lado del par). */
  exclude?: Address;
  /** Tokens que ofrece el selector (por defecto solo ERC20). */
  tokens?: Token[];
};

// Al pulsar MAX con ETH nativo se deja algo para pagar el gas de la transacción.
const GAS_RESERVE = parseEther('0.0005');

/**
 * Balance del usuario: ETH nativo con useBalance, ERC20 con balanceOf.
 * Los dos hooks se llaman siempre (regla de los hooks) y se activa solo el que toca.
 */
export function useTokenBalance(token: Address) {
  const { address } = useAccount();
  const native = isNative(token);

  const { data: ethBalance } = useBalance({
    address,
    query: { enabled: Boolean(address) && native },
  });

  const { data: erc20Balance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: { enabled: Boolean(address) && !native },
  });

  return native ? ethBalance?.value : erc20Balance;
}

/** Caja de importe + selector de token + balance del usuario con botón MAX. */
export function TokenInput({
  label,
  token,
  onTokenChange,
  amount,
  onAmountChange,
  readOnly,
  exclude,
  tokens = TOKENS,
}: Props) {
  const info = findToken(token);
  const balance = useTokenBalance(token);

  const setMax = () => {
    if (balance === undefined || !onAmountChange) return;
    const max = info.isNative ? (balance > GAS_RESERVE ? balance - GAS_RESERVE : 0n) : balance;
    onAmountChange(formatUnits(max, info.decimals));
  };

  return (
    <div className="token-box">
      <div className="token-box-head">
        <span className="label">{label}</span>
        <span className="label">
          Balance: <span className="value">{fmt(balance, info.decimals)}</span>
          {!readOnly && onAmountChange && balance !== undefined && balance > 0n && (
            <button type="button" className="link" onClick={setMax}>
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
          {tokens.filter((t) => t.address !== exclude).map((t) => (
            <option key={t.address} value={t.address}>
              {t.symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
