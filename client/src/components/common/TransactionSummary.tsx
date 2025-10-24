type SummaryRow = { label: string; value: string; emphasis?: boolean };
type Props = {
  title: string;
  subtitle?: string;
  rows: SummaryRow[];
  cta?: { label: string; onClick: () => void };
};

// File purpose: Success summary panel for tx results.
export default function TransactionSummary({ title, subtitle, rows, cta }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">✅ {title}</div>
      {subtitle && <div className="mb-3 text-sm text-muted-foreground dark:text-slate-200">{subtitle}</div>}
      <div className="rounded-xl border border-border/50 bg-background/70 p-3 dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground dark:text-slate-300">Transaction summary</div>
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground dark:text-slate-300">{r.label}</span>
              <span
                className={
                  r.emphasis
                    ? "font-semibold text-emerald-600 dark:text-emerald-300"
                    : "text-foreground dark:text-slate-100"
                }
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      {cta && (
        <button
          className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={cta.onClick}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}
