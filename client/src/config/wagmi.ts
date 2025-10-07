import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, walletConnect } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const unichainSepolia = defineChain({
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.unichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Uniscan',
      url: 'https://sepolia.uniscan.xyz',
    },
  },
  testnet: true,
})

export const wagmiConfig = createConfig({
  chains: [baseSepolia, unichainSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Mantua.AI',
    }),
    walletConnect({
      projectId: 'demo', // Using demo project ID for now
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [unichainSepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}