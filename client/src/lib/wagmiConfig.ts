import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { kinetConnector } from '@/lib/kinetConnector';

const chains = [baseSepolia] as const;

export const config = createConfig({
  chains,
  connectors: [
    kinetConnector(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      metadata: {
        name: 'Mantua.AI',
        description: 'DeFi personal assistant for programmable liquidity',
        url: 'https://mantua.ai',
        icons: ['https://mantua.ai/icon.png'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
