export type HookConfig = {
  id: string;
  label: string;
};

// File purpose: Central registry for supported hooks with normalized lookup.
export const HOOKS: Record<string, HookConfig> = {
  "dynamic fee": { id: "dynamic-fee", label: "Dynamic Fee Hook" },
  "mev protection": { id: "mev-protection", label: "MEV Protection Hook" },
  twamm: { id: "twamm", label: "TWAMM Hook" },
};

// Allow common synonyms/abbreviations
export const HOOK_SYNONYMS: Record<string, string> = {
  "dynamic-fee": "dynamic fee",
  dynamicfee: "dynamic fee",
  mev: "mev protection",
  "mev-protect": "mev protection",
  "mev protection": "mev protection",
  "twamm hook": "twamm",
};

export function normalizeHook(input?: string): HookConfig | undefined {
  if (!input) return undefined;
  const key = input.trim().toLowerCase();
  if (HOOKS[key]) {
    return HOOKS[key];
  }
  const canonicalKey = HOOK_SYNONYMS[key];
  if (canonicalKey && HOOKS[canonicalKey]) {
    return HOOKS[canonicalKey];
  }
  return undefined;
}
