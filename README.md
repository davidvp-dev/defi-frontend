# CustomDEX — Frontend

React (Vite) frontend for [`CustomDEX.sol`](https://github.com/davidvp-dev/custom-dex-collections)
(Foundry project `UniswapDEX`): swap tokens and add/remove liquidity on Uniswap V2
through the wrapper contract.

Stack: React + Vite + TypeScript + wagmi + viem + RainbowKit + React Query.

## Features

- **Swap** between USDC, ARB and WETH with live quotes (`getAmountsOut`), direct
  pair or routing through WETH, configurable slippage and price impact.
- **Liquidity**: pool info (reserves, your LP tokens and pool share), add
  liquidity (the second amount is computed from the reserves) and remove
  liquidity (25 / 50 / 75 % / MAX).
- **Approvals**: the approve button only appears when the allowance is not
  enough, and it approves the exact amount (never infinite).
- **Wallet**: ETH and token balances, refreshed automatically after every
  confirmed transaction.

## 1. Start the local node (Arbitrum fork)

From the Foundry project:

```bash
cd "../3. Proyectos Intermedios II/UniswapDEX"
./scripts/bootstrap-local.sh   # anvil --chain-id 1337 + deploy + funds TARGET_WALLET (1 ETH, 100 USDC, 50 ARB)
```

The `CustomDEX` address is in
`broadcast/DeployCustomDEX.s.sol/1337/run-latest.json`. With the same deployer
and a freshly started anvil it is usually the same, but if it changes, update
`.env.local`.

## 2. Install and configure

```bash
npm install
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `VITE_WALLETCONNECT_PROJECT_ID` | Free at https://cloud.walletconnect.com |
| `VITE_ENABLE_LOCAL_FORK` | `true` locally; `false` in the public deployment |
| `VITE_LOCAL_RPC_URL` | Local node RPC (default `http://127.0.0.1:8545`) |
| `VITE_LOCAL_CHAIN_ID` | `1337` (what `bootstrap-local.sh` uses) |
| `VITE_CONTRACT_ADDRESS_LOCAL` | CustomDEX address on the fork |
| `VITE_CONTRACT_ADDRESS_ARBITRUM` | CustomDEX address on Arbitrum One (empty until deployed) |

## 3. Run

```bash
npm run dev
```

In MetaMask/Rabby add the **Arbitrum Fork (local)** network: RPC
`http://127.0.0.1:8545`, chain id `1337`, symbol `ETH` (RainbowKit offers to
switch to it when you connect).

> After restarting anvil, MetaMask may keep old nonces:
> Settings → Advanced → *Clear activity tab data*.

## How it works

- `src/abi/CustomDEX.ts` — ABI taken from `out/CustomDEX.sol/CustomDEX.json`,
  exported `as const` so wagmi can type arguments and return values
- `src/abi/uniswapV2.ts` — minimal read-only ABIs: `router.getAmountsOut`,
  `factory.getPair`, `pair.getReserves/token0/totalSupply/balanceOf`
- `src/config/wagmi.ts` — networks (local fork + Arbitrum One) and wallets
- `src/config/contract.ts` — CustomDEX address for each network
- `src/config/tokens.ts` — USDC, ARB and WETH on Arbitrum One (same addresses
  on the fork)
- `src/hooks/useDex.ts` — reads `UNISWAP_V2_ROUTER_ADDRESS` and
  `UNISWAP_V2_FACTORY_ADDRESS` from the contract itself (nothing hardcoded)
- `src/hooks/usePair.ts` — resolves the pair and returns reserves ordered as
  A/B, LP total supply and your LP tokens
- `src/hooks/useTx.ts` — `useWriteContract` + `useWaitForTransactionReceipt`;
  invalidates the cache on confirmation so everything refreshes by itself
- `src/components/ApproveButton.tsx` — CustomDEX calls `transferFrom`, so every
  operation needs an allowance; the button only shows up when it is missing and
  approves the exact amount
- `src/components/SwapPanel.tsx` — quotes with `getAmountsOut`, uses the direct
  pair or routes through WETH, applies slippage to `amountOutMin` and calls
  `swapTokens(amountIn, amountOutMin, path, deadline)`
- `src/components/AddLiquidity.tsx` — computes the second amount from the pool
  reserves and calls `addLiquidity(...)` with slippage-based minimums
- `src/components/RemoveLiquidity.tsx` — approves the LP token to the DEX,
  estimates what you get back (`liquidity * reserve / totalSupply`) and calls
  `removeLiquidity(...)`
- `src/App.tsx` — wallet, contract address per network, bytecode check at that
  address (useful after restarting anvil), tabs and slippage

## Typical flow on the fork

1. Swap 10 USDC → ARB: *Approve USDC* → `swapTokens()`
2. USDC/ARB liquidity: type the USDC amount, the ARB amount is computed →
   approve both → `addLiquidity()`
3. Remove: MAX → *Approve LP* → `removeLiquidity()`

## CI/CD and deployment (GitHub Actions + Vercel)

The workflow in `.github/workflows/ci-cd.yml`:

| Event | What happens |
|---|---|
| Push to any branch / PR to `main` | `npm ci` + type-check + build |
| Push to `main` | Deploy to Vercel **production** |
| Push to any other branch | Deploy a Vercel **preview** (unique URL) |

`vercel.json` disables Vercel's own Git integration so that only GitHub
Actions deploys (no duplicated deployments).

### One-time setup

1. Create a Vercel account (log in with GitHub) and install the CLI:
   `npm i -g vercel`.
2. In this folder run `vercel link` and create a new project. It generates
   `.vercel/project.json` with `orgId` and `projectId` (git-ignored).
3. Create a token at https://vercel.com/account/tokens.
4. In GitHub → *Settings → Secrets and variables → Actions*, add
   `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
5. In Vercel → *Project → Settings → Environment Variables*, add the `VITE_*`
   variables for **Production** and **Preview** (with
   `VITE_ENABLE_LOCAL_FORK=false`).

> ⚠️ A public deployment cannot reach your local anvil: `127.0.0.1` points to
> each visitor's own machine. For other people to use the dApp, CustomDEX has to
> be deployed on a public network (e.g. Arbitrum One) and its address set in
> `VITE_CONTRACT_ADDRESS_ARBITRUM`.

## License

MIT — see [LICENSE](./LICENSE).
