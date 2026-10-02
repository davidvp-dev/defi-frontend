// ABI generado por Foundry: UniswapDEX/out/CustomDEX.sol/CustomDEX.json
// Se exporta "as const" para que wagmi/viem infieran los tipos de args y retornos.
// Tras cambiar el contrato: `forge build` y vuelve a copiar el array "abi" aquí.
export const customDexAbi = [
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
      },
      {
        "name": "feeRecipient_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "MAX_FEE_BPS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
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
    "name": "acceptOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
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
    "name": "feeBps",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "feeRecipient",
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
    "name": "owner",
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
    "name": "pendingOwner",
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
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFeeBps",
    "inputs": [
      {
        "name": "newFeeBps_",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setFeeRecipient",
    "inputs": [
      {
        "name": "newRecipient_",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swapERC20TokensForEth",
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
        "name": "amounts",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "swapEthForERC20Tokens",
    "inputs": [
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
        "name": "amounts",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "payable"
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
        "name": "amounts",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
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
        "name": "lpTokensAmount_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeeBpsUpdated",
    "inputs": [
      {
        "name": "oldFeeBps",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newFeeBps",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FeeRecipientUpdated",
    "inputs": [
      {
        "name": "oldRecipient",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newRecipient",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferStarted",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RemoveLPTokens",
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
        "name": "liquidity_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountA_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountB_",
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
        "name": "tokenIn_",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "tokenOut_",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amountIn_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "amountOut_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolFee_",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
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
