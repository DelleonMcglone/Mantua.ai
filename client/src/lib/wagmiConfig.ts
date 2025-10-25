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
      projectId: 'demo',
      showQrModal: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
