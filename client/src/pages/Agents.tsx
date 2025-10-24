import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Agent } from "@shared/schema";
import { ApiError, fetchAgents, createAgent, updateAgent } from "@/lib/api";

type AgentFormState = {
  id?: string;
  name: string;
  type: Agent["type"];
  memory: string;
  permissions: {
    canSwap: boolean;
    canAddLiquidity: boolean;
    canBridge: boolean;
    requiresManualReview: boolean;
    maxSwapUsd: string;
    maxDailyVolumeUsd: string;
  };
};

function agentToForm(agent: Agent): AgentFormState {
  return {
    id: agent.id,
    name: agent.name,
    type: agent.type,
    memory: agent.memory ?? "",
    permissions: {
      canSwap: Boolean(agent.permissions?.canSwap),
      canAddLiquidity: Boolean(agent.permissions?.canAddLiquidity),
      canBridge: Boolean(agent.permissions?.canBridge),
      requiresManualReview: agent.permissions?.requiresManualReview ?? true,
      maxSwapUsd:
        agent.permissions?.maxSwapUsd !== undefined && agent.permissions?.maxSwapUsd !== null
          ? String(agent.permissions.maxSwapUsd)
          : "",
      maxDailyVolumeUsd:
        agent.permissions?.maxDailyVolumeUsd !== undefined &&
        agent.permissions?.maxDailyVolumeUsd !== null
          ? String(agent.permissions.maxDailyVolumeUsd)
          : "",
    },
  };
}

function formToPayload(form: AgentFormState): Omit<Agent, "id" | "createdAt" | "updatedAt"> {
  const parseNumeric = (value: string) => {
    if (!value.trim()) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  return {
    name: form.name.trim(),
    type: form.type,
    memory: form.memory,
    permissions: {
      canSwap: form.permissions.canSwap,
      canAddLiquidity: form.permissions.canAddLiquidity,
      canBridge: form.permissions.canBridge,
      requiresManualReview: form.permissions.requiresManualReview,
      maxSwapUsd: parseNumeric(form.permissions.maxSwapUsd),
      maxDailyVolumeUsd: parseNumeric(form.permissions.maxDailyVolumeUsd),
    },
  };
}

function describePermissions(agent: Agent): string {
  const actions: string[] = [];
  if (agent.permissions?.canSwap) actions.push("Swaps");
  if (agent.permissions?.canAddLiquidity) actions.push("Liquidity");
  if (agent.permissions?.canBridge) actions.push("Bridge");
  if (actions.length === 0) return "Read only";
  return `${actions.join(" · ")} ${agent.permissions?.requiresManualReview ? "(review)" : "(auto)"}`;
}

export default function AgentsPage() {
  const [, navigate] = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [formState, setFormState] = useState<AgentFormState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  async function loadAgents() {
    setIsLoading(true);
    setError(null);
    try {
      const list = await fetchAgents();
      setAgents(list);
      if (list.length > 0) {
        const defaultAgent = list[0];
        setSelectedAgentId(defaultAgent.id);
        setFormState(agentToForm(defaultAgent));
      } else {
        setSelectedAgentId(null);
        setFormState(null);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load agents.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    setFormState(agentToForm(agent));
    setToast(null);
  };

  const handleCreateAgent = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const basePayload = {
        name: "New Agent",
        type: "research" as Agent["type"],
        memory: "",
        permissions: {
          canSwap: false,
          canAddLiquidity: false,
          canBridge: false,
          requiresManualReview: true,
          maxSwapUsd: null,
          maxDailyVolumeUsd: null,
        },
      };
      const created = await createAgent(basePayload);
      setAgents((prev) => [created, ...prev]);
      setSelectedAgentId(created.id);
      setFormState(agentToForm(created));
      setToast("Agent created");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create agent.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formState?.id) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = formToPayload(formState);
      const updated = await updateAgent(formState.id, payload);
      setAgents((prev) => prev.map((agent) => (agent.id === updated.id ? updated : agent)));
      setFormState(agentToForm(updated));
      setToast("Agent saved");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save agent.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateForm = <K extends keyof AgentFormState>(key: K, value: AgentFormState[K]) => {
    setFormState((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updatePermission = <K extends keyof AgentFormState["permissions"]>(
    key: K,
    value: AgentFormState["permissions"][K],
  ) => {
    setFormState((prev) =>
      prev
        ? {
            ...prev,
            permissions: {
              ...prev.permissions,
              [key]: value,
            },
          }
        : prev,
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Agents</h1>
              <p className="text-sm text-muted-foreground">
                Configure autonomous DeFi and research agents for Mantua.AI.
              </p>
            </div>
          </div>
          <Button onClick={handleCreateAgent} disabled={isSaving}>
            <Plus className="h-4 w-4 mr-2" />
            New agent
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {toast && (
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
            {toast}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading agents…</div>
              ) : agents.length === 0 ? (
                <div className="text-sm text-muted-foreground">Create your first agent to get started.</div>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent) => {
                    const isActive = agent.id === selectedAgentId;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                          isActive
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="text-sm font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {agent.type === 'defi' ? 'Autonomous DeFi' : 'Research'} · {describePermissions(agent)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Agent details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!formState ? (
                <div className="text-sm text-muted-foreground">Select or create an agent to edit its configuration.</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agent-name">Agent name</Label>
                      <Input
                        id="agent-name"
                        value={formState.name}
                        onChange={(event) => updateForm('name', event.target.value)}
                        placeholder="Base liquidity scout"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agent type</Label>
                      <Select value={formState.type} onValueChange={(value) => updateForm('type', value as Agent['type'])}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="defi">Autonomous DeFi agent</SelectItem>
                          <SelectItem value="research">Research & communication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-sm font-semibold">Permissions</h2>
                      <p className="text-xs text-muted-foreground">
                        Define what this agent can automate on Base Sepolia. Spending controls apply across hooks and routings.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Execute swaps</p>
                          <p className="text-xs text-muted-foreground">Allows the agent to route swaps through Mantua hooks.</p>
                        </div>
                        <Switch
                          checked={formState.permissions.canSwap}
                          onCheckedChange={(checked) => updatePermission('canSwap', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Provide liquidity</p>
                          <p className="text-xs text-muted-foreground">Enables automated LP provisioning within approved pools.</p>
                        </div>
                        <Switch
                          checked={formState.permissions.canAddLiquidity}
                          onCheckedChange={(checked) => updatePermission('canAddLiquidity', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Bridge assets</p>
                          <p className="text-xs text-muted-foreground">Allow cross-domain transfers when conditions are met.</p>
                        </div>
                        <Switch
                          checked={formState.permissions.canBridge}
                          onCheckedChange={(checked) => updatePermission('canBridge', checked)}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="max-swap-usd">Max swap size (USD)</Label>
                          <Input
                            id="max-swap-usd"
                            inputMode="decimal"
                            value={formState.permissions.maxSwapUsd}
                            onChange={(event) => updatePermission('maxSwapUsd', event.target.value)}
                            placeholder="e.g. 500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="daily-volume">Daily volume (USD)</Label>
                          <Input
                            id="daily-volume"
                            inputMode="decimal"
                            value={formState.permissions.maxDailyVolumeUsd}
                            onChange={(event) => updatePermission('maxDailyVolumeUsd', event.target.value)}
                            placeholder="e.g. 1500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">Require manual review</p>
                          <p className="text-xs text-muted-foreground">Mantua will request approval before dispatching actions.</p>
                        </div>
                        <Switch
                          checked={formState.permissions.requiresManualReview}
                          onCheckedChange={(checked) => updatePermission('requiresManualReview', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-memory">Memory & notes</Label>
                    <Textarea
                      id="agent-memory"
                      value={formState.memory}
                      onChange={(event) => updateForm('memory', event.target.value)}
                      rows={6}
                      placeholder="Capture goals, risk tolerance, preferred hooks, or reporting cadence."
                    />
                  </div>

                  <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-2">
                    <h3 className="text-sm font-semibold">Execution Engine: AgentKit (Coinbase CDP Wallet)</h3>
                    <p className="text-xs text-muted-foreground">
                      This agent will delegate on-chain execution to AgentKit using a Coinbase CDP wallet once its permissions are approved. Review the integration guide to connect hooks, swap routes, and risk controls.
                    </p>
                    <a
                      href="https://replit.com/t/coinbase-developer-platform/repls/AgentKitjs-Quickstart-020-EVM-CDP-Wallet/view#README.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline"
                    >
                      AgentKit integration reference
                    </a>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
