export interface AnalysisMetric {
  [key: string]: unknown;
}

export interface AnalysisChart {
  type?: "area" | "bar";
  seriesLabel: string;
  points: Array<{ t: string; v: number }>;
}

export interface AnalysisResponsePayload {
  summary: string;
  metrics: AnalysisMetric[];
  chart?: AnalysisChart;
  source?: string;
  topic?: string;
}
