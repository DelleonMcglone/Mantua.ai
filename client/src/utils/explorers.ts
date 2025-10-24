export function txUrl(chainId: number, txHash: string) {
  if (!txHash) return "#";
  switch (chainId) {
    case 84532:
      return `https://sepolia-explorer.base.org/tx/${txHash}`;
    default:
      return `https://sepolia-explorer.base.org/tx/${txHash}`;
  }
}
