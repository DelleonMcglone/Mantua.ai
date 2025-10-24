import { type AnalysisResponsePayload } from "@/types/analysis";
import type { Agent } from "@shared/schema";

export type IntentType = "swap" | "add_liquidity" | "analyze" | "agent_action" | "unknown";

export interface ParseIntentResponse {
  intent: IntentType;
  params: Record<string, unknown>;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const payload = await safeParseJson(response);
    throw new ApiError(payload?.message ?? "Request failed", response.status, payload);
  }

  return (await response.json()) as T;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  return requestJson<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  return requestJson<T>(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function getJson<T>(url: string): Promise<T> {
  return requestJson<T>(url);
}

async function safeParseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestParseIntent(message: string): Promise<ParseIntentResponse> {
  return postJson<ParseIntentResponse>("/api/ai/parse_intent", { message });
}

export async function requestAnalyze(question: string): Promise<AnalysisResponsePayload> {
  return postJson<AnalysisResponsePayload>("/api/ai/analyze", { question });
}

type AgentWritePayload = {
  name: Agent["name"];
  type: Agent["type"];
  memory: Agent["memory"];
  permissions: Agent["permissions"];
};

export async function fetchAgents(): Promise<Agent[]> {
  const data = await getJson<{ agents: Agent[] }>("/api/agents");
  return data.agents;
}

export async function createAgent(payload: AgentWritePayload): Promise<Agent> {
  return postJson<Agent>("/api/agents", payload);
}

export async function updateAgent(id: string, payload: AgentWritePayload): Promise<Agent> {
  return putJson<Agent>(`/api/agents/${id}`, payload);
}
