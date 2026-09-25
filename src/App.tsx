import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBytecode } from 'wagmi';
import { getContractAddress } from './config/contract';
import { useDex } from './hooks/useDex';
import { SwapPanel } from './components/SwapPanel';
import { LiquidityPanel } from './components/LiquidityPanel';
import { WalletPanel } from './components/WalletPanel';
import type { Address } from 'viem';

type Tab = 'swap' | 'liquidity';
const SLIPPAGE_OPTIONS = [10, 50, 100, 300]; // en basis points: 0.1%, 0.5%, 1%, 3%

export default function App() {
  const { isConnected, chainId } = useAccount();
  const contractAddress = getContractAddress(chainId);

  return (
    <main className="container">
      <div className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          CustomDEX
        </div>
        <ConnectButton showBalance={false} />
      </div>

      {!isConnected && (
        <div className="card">
          <h2>Bienvenido</h2>
          <p className="hint">
            Conecta tu wallet para hacer swaps y gestionar liquidez en Uniswap V2 a través de
            CustomDEX.
          </p>
        </div>
      )}

      {isConnected && !contractAddress && (
        <div className="card">
          <h2>Red no configurada</h2>
          <p className="hint">
            No hay una dirección de CustomDEX para la red actual (chain id {chainId}). Cambia a
            «Arbitrum Fork (local)» o configúrala en <code>.env.local</code>.
          </p>
        </div>
      )}

      {isConnected && contractAddress && <Dex contractAddress={contractAddress} />}
    </main>
  );
}

function Dex({ contractAddress }: { contractAddress: Address }) {
  const [tab, setTab] = useState<Tab>('swap');
  const [slippageBps, setSlippageBps] = useState(50);

  // Comprueba que en esa dirección hay código (típico tras reiniciar anvil sin redesplegar)
  const { data: bytecode, isFetched } = useBytecode({ address: contractAddress });
  const { router, factory } = useDex(contractAddress);

  if (isFetched && !bytecode) {
    return (
      <div className="card">
        <h2>Contrato no encontrado</h2>
        <p className="hint">
          No hay código en <code>{contractAddress}</code>. Si reiniciaste anvil, vuelve a ejecutar{' '}
          <code>./scripts/bootstrap-local.sh</code> y actualiza <code>VITE_CONTRACT_ADDRESS_LOCAL</code>.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* <WalletPanel contractAddress={contractAddress} router={router} factory={factory} /> */}

      <div className="toolbar">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'swap'} className={tab === 'swap' ? 'active' : ''} onClick={() => setTab('swap')}>
            Swap
          </button>
          <button role="tab" aria-selected={tab === 'liquidity'} className={tab === 'liquidity' ? 'active' : ''} onClick={() => setTab('liquidity')}>
            Liquidez
          </button>
        </div>
        <div className="slippage">
          <span className="label">Slippage</span>
          {SLIPPAGE_OPTIONS.map((bps) => (
            <button key={bps} className={`chip ${slippageBps === bps ? 'active' : ''}`} onClick={() => setSlippageBps(bps)}>
              {bps / 100}%
            </button>
          ))}
        </div>
      </div>

      {!router || !factory ? (
        <div className="card">
          <p className="hint">Leyendo router y factory del contrato…</p>
        </div>
      ) : tab === 'swap' ? (
        <SwapPanel contractAddress={contractAddress} router={router} factory={factory} slippageBps={slippageBps} />
      ) : (
        <LiquidityPanel contractAddress={contractAddress} factory={factory} slippageBps={slippageBps} />
      )}
    </>
  );
}
