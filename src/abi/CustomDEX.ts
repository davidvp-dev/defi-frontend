// ABI generado por Foundry: UniswapDEX/out/CustomDEX.sol/CustomDEX.json
// Se exporta "as const" para que wagmi/viem infieran los tipos de args y retornos.
export const customDexAbi = 
[
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "uniswapV2RouterAddress_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "uniswapV2FactoryAddress_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "UNISWAP_V2_FACTORY_ADDRESS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "UNISWAP_V2_ROUTER_ADDRESS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addLiquidity",
    "inputs": [
      {
        "name": "tokenA_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenB_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amountADesired_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountBDesired_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountAMin_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountBMin_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "deadline_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "lpTokensAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeLiquidity",
    "inputs": [
      {
        "name": "tokenA_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "tokenB_",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "liquidity_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountAMin_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountBMin_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "deadline_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "amountA_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountB_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swapTokens",
    "inputs": [
      {
        "name": "amountIn_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "amountOutMin_",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "path_",
        "type": "address[]",
        "internalType": "address[]"
      },
      {
        "name": "deadline_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "amountsOut",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AddLPTokens",
    "inputs": [
      {
        "name": "tokenA_",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenB_",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "lpTokensAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RemoveLPTokens",
    "inputs": [
      {
        "name": "tokenA",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenB",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "liquidity",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountA",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountB",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SwapTokens",
    "inputs": [
      {
        "name": "tokenIn",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenOut",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amountIn",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountOut",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "SafeERC20FailedOperation",
    "inputs": [
      {
        "name": "token",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
] as const;
