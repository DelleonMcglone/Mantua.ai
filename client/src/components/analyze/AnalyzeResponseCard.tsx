import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { type AnalysisMetric, type AnalysisChart } from "@/types/analysis";

interface AnalyzeResponseCardProps {
  summary: string;
  metrics: AnalysisMetric[];
  chart?: AnalysisChart;
  source?: string;
}

function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return value.toFixed(2);
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function resolveMetricTitle(metric: AnalysisMetric): string {
  const title =
    (typeof metric.chain === "string" && metric.chain) ||
    (typeof metric.token === "string" && metric.token) ||
    (typeof metric.name === "string" && metric.name) ||
    (typeof metric.label === "string" && metric.label) ||
    "";
  return title || "Metric";
}

function buildMetricDetails(metric: AnalysisMetric): Array<{ label: string; value: string }> {
  const ignoredKeys = new Set(["chain", "token", "name", "label", "image"]);
  const entries = Object.entries(metric).filter(([key]) => !ignoredKeys.has(key));

  return entries.map(([label, value]) => ({
    label,
    value: formatMetricValue(value),
  }));
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function AnalyzeResponseCard({
  summary,
  metrics,
  chart,
  source,
}: AnalyzeResponseCardProps) {
  const chartData =
    chart?.points?.map((point) => ({
      t: formatTimestamp(point.t),
      v: Number(point.v),
    })) ?? [];
  const chartType = chart?.type ?? "area";

  return (
    <Card className="bg-muted/30 border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Analysis Result</CardTitle>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{summary}</p>
        {source && (
          <p className="text-xs text-muted-foreground">
            Data source: {source}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric, index) => {
              const title = resolveMetricTitle(metric);
              const details = buildMetricDetails(metric);
              return (
                <div
                  key={`${title}-${index}`}
                  className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-2"
                >
                  <div className="text-sm font-medium text-foreground">{title}</div>
                  <dl className="space-y-1 text-xs text-muted-foreground">
                    {details.map((detail) => (
                      <div key={detail.label} className="flex justify-between gap-4">
                        <dt className="capitalize">{detail.label.replace(/([A-Z])/g, " $1")}</dt>
                        <dd className="font-semibold text-right">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>
        )}

        {chartData.length > 0 && chart && (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="t"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name={chart.seriesLabel} />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="analysisChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="t"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--primary))"
                    fill="url(#analysisChartGradient)"
                    name={chart.seriesLabel}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
