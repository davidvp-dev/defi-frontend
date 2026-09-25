import React from 'react';
import ReactDOM from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import App from './App';
import './index.css';

// Motor de React Query para cachear y refrescar datos de lectura de contratos.
// useTx() invalida esta caché cuando se confirma una tx, así balances y reservas se actualizan solos.
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. wagmi: conexión con wallets y red */}
    <WagmiProvider config={config}>
      {/* 2. React Query: caché de lecturas on-chain */}
      <QueryClientProvider client={queryClient}>
        {/* 3. RainbowKit: UI de conexión de wallets */}
        <RainbowKitProvider theme={darkTheme({ accentColor: '#c084fc', borderRadius: 'medium' })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
