# CustomDEX — Frontend

Frontend en React (Vite) para interactuar con `CustomDEX.sol` (proyecto Foundry
`UniswapDEX`): swaps de tokens y añadir/retirar liquidez en Uniswap V2 a través
del contrato wrapper.

Stack: React + Vite + wagmi + viem + RainbowKit (mismo que `cryptobank-frontend`).

## 1. Levantar el nodo local (fork de Arbitrum)

Desde el proyecto Foundry:

```bash
cd "../3. Proyectos Intermedios II/UniswapDEX"
./scripts/bootstrap-local.sh   # anvil --chain-id 1337 + deploy + fondea TARGET_WALLET (1 ETH, 100 USDC, 50 ARB)
```

La dirección de `CustomDEX` sale en
`broadcast/DeployCustomDEX.s.sol/1337/run-latest.json`. Con el mismo deployer y
un anvil recién arrancado suele ser la misma, pero si cambia actualiza
`.env.local`.

## 2. Instalar y configurar

```bash
npm install
cp .env.local.example .env.local   # ya viene uno relleno para el fork local
```

- `VITE_CONTRACT_ADDRESS_LOCAL`: dirección de CustomDEX en el fork
- `VITE_LOCAL_CHAIN_ID`: 1337 (lo que usa `bootstrap-local.sh`)
- `VITE_CONTRACT_ADDRESS_ARBITRUM`: vacío hasta que despliegues en mainnet

## 3. Ejecutar

```bash
npm run dev
```

En MetaMask/Rabby añade la red **Arbitrum Fork (local)**: RPC
`http://127.0.0.1:8545`, chain id `1337`, símbolo `ETH` (RainbowKit te ofrece
cambiar a ella al conectar).

> Tras reiniciar anvil, MetaMask puede quedarse con nonces antiguos:
> Ajustes → Avanzado → *Clear activity tab data*.

## Cómo funciona

- `src/abi/CustomDEX.ts` — ABI sacado de `out/CustomDEX.sol/CustomDEX.json`,
  exportado `as const` para que wagmi tipe args y retornos
- `src/abi/uniswapV2.ts` — ABIs mínimos de lectura: `router.getAmountsOut`,
  `factory.getPair`, `pair.getReserves/token0/totalSupply/balanceOf`
- `src/config/tokens.ts` — USDC, ARB y WETH de Arbitrum One (mismas
  direcciones en el fork)
- `src/hooks/useDex.ts` — lee `UNISWAP_V2_ROUTER_ADDRESS` y
  `UNISWAP_V2_FACTORY_ADDRESS` del propio contrato (nada hardcodeado)
- `src/hooks/usePair.ts` — resuelve el par y devuelve reservas ordenadas A/B,
  totalSupply de LP y tus LP tokens
- `src/hooks/useTx.ts` — `useWriteContract` + `useWaitForTransactionReceipt`
  e invalida la caché al confirmar, así todo se refresca solo
- `src/components/ApproveButton.tsx` — CustomDEX hace `transferFrom`, así que
  cada operación necesita allowance; el botón solo aparece si falta y aprueba
  el importe exacto
- `src/components/SwapPanel.tsx` — cotiza con `getAmountsOut`, usa par directo
  o ruta vía WETH si no existe, aplica slippage a `amountOutMin` y llama
  `swapTokens(amountIn, amountOutMin, path, deadline)`
- `src/components/AddLiquidity.tsx` — calcula el segundo importe con las
  reservas del pool y llama `addLiquidity(...)` con mínimos según slippage
- `src/components/RemoveLiquidity.tsx` — aprueba el LP token al DEX, estima lo
  que recibes (`liquidity * reserva / totalSupply`) y llama `removeLiquidity(...)`
- `src/App.tsx` — wallet, resolución de dirección por red, comprobación de que
  hay bytecode en la dirección (útil si reinicias anvil), pestañas y slippage

## Flujo típico en el fork

1. Swap 10 USDC → ARB: *Aprobar USDC* → `swapTokens()`
2. Liquidez USDC/ARB: escribe USDC, el ARB se calcula solo → aprobar ambos →
   `addLiquidity()`
3. Retirar: MAX → *Aprobar LP* → `removeLiquidity()`
