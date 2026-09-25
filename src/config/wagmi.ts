import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { http } from 'wagmi';
import { defineChain } from 'viem';
import { arbitrum } from 'wagmi/chains';

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '';
const localRpcUrl = import.meta.env.VITE_LOCAL_RPC_URL || 'http://127.0.0.1:8545';

// Anvil forkeado de Arbitrum One. scripts/bootstrap-local.sh lo arranca con --chain-id 1337.
export const arbitrumFork = defineChain({
  id: Number(import.meta.env.VITE_LOCAL_CHAIN_ID || 1337),
  name: 'Arbitrum Fork (local)',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [localRpcUrl] },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'CustomDEX',
  projectId: walletConnectProjectId,
  // El fork local va primero: es la red por defecto mientras no haya despliegue en mainnet
  chains: [arbitrumFork, arbitrum],
  transports: {
    [arbitrumFork.id]: http(localRpcUrl),
    [arbitrum.id]: http(),
  },
  wallets: [
    {
      groupName: 'Recomendadas',
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
        injectedWallet, // fallback: cualquier otra extension inyectada
      ],
    },
  ],
});
