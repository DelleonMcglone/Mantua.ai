export type AgentType = "defi" | "research";

export interface AgentPermissions {
  canSwap: boolean;
  canAddLiquidity: boolean;
  canBridge: boolean;
  maxSwapUsd: number | null;
  maxDailyVolumeUsd: number | null;
  requiresManualReview: boolean;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  memory: string;
  permissions: AgentPermissions;
  createdAt?: string;
  updatedAt?: string;
}
