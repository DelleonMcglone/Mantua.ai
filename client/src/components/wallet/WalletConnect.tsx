import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";

console.log("WalletConnect loaded");

export function WalletConnect() {
  const { address, status, isConnecting, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();

  const kinetConnector = useMemo(
    () =>
      connectors.find((connector) =>
        connector.name.toLowerCase().includes("kinet"),
      ),
    [connectors],
  );

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        onClick={() => disconnect()}
        data-testid="button-wallet-connected"
        className="flex flex-col items-center gap-0 h-auto py-2 px-3"
      >
        <span className="text-sm font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <span className="text-xs text-muted-foreground">Connected</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        data-testid="button-connect-wallet"
        disabled={isConnecting}
        onClick={() => {
          console.log("Connect clicked", {
            kinet: kinetConnector?.name,
            status,
          });
          const targetConnector = kinetConnector ?? connectors[0];
          if (!targetConnector) {
            console.error("No wallet connectors available");
            return;
          }
          connect({ connector: targetConnector });
        }}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="status">
          {error.message}
        </span>
      )}
    </div>
  );
}

export default WalletConnect;
