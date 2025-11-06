import type { ReactNode } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';

// Initialize the thirdweb client with your client ID
const client = createThirdwebClient({
  clientId: 'ad56c696e9e352f2d6beb550518a3023',
});

// Instantiate the MetaMask wallet connector
const metamask = createWallet('io.metamask');

// Wrap your app with ThirdwebProvider, passing the client and active chain
export function ThirdwebProviders({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider client={client} activeChain={baseSepolia} wallets={[metamask]}>
      {children}
    </ThirdwebProvider>
  );
}

export { client, metamask, baseSepolia };
