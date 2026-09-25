/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_LOCAL_RPC_URL: string;
  readonly VITE_LOCAL_CHAIN_ID: string;
  readonly VITE_CONTRACT_ADDRESS_LOCAL: string;
  readonly VITE_CONTRACT_ADDRESS_ARBITRUM: string;
  readonly VITE_ENABLE_LOCAL_FORK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
