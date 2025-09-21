import type { ReactNode } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: "ad56c696e9e352f2d6beb550518a3023",
});

export function ThirdwebProviders(props: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      {props.children}
    </ThirdwebProvider>
  );
}

export { client };