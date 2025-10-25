import { injected } from "wagmi/connectors";

type WindowWithKinet = Window &
  typeof globalThis & {
    kinet?: {
      provider?: unknown;
    };
  };

const resolveKinetTarget = () => ({
  id: "kinet",
  name: "Kinet",
  icon: undefined,
  provider(window?: any) {
    if (!window && typeof globalThis !== "undefined") {
      window = globalThis.window;
    }
    if (!window) return undefined;
    const scopedWindow = window as WindowWithKinet;
    return scopedWindow.kinet?.provider ?? scopedWindow.ethereum;
  },
});

export const kinetConnector = () =>
  injected({
    shimDisconnect: true,
    target: resolveKinetTarget,
  });
