import type { ReactNode } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { createWallet } from 'thirdweb/wallets';
import { baseSepolia } from 'thirdweb/chains';
import { defineChain } from 'thirdweb/chains';

const client = createThirdwebClient({
  clientId: "ad56c696e9e352f2d6beb550518a3023",
});

const metamask = createWallet("io.metamask");

const unichainSepolia = defineChain({
  id: 1301,
  name: 'Unichain Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorers: [{
    name: 'Uniscan',
    url: 'https://sepolia.uniscan.xyz',
  }],
  testnet: true,
});

export function ThirdwebProviders(props: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {props.children}
    </ThirdwebProvider>
  );
}

export { client, metamask, baseSepolia };