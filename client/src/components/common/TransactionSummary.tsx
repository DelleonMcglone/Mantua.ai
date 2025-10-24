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
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="mb-2 text-green-600 font-medium">✅ {title}</div>
      {subtitle && <div className="mb-3 text-sm text-green-700">{subtitle}</div>}
      <div className="rounded-xl border p-3">
        <div className="mb-2 text-sm text-neutral-500">Transaction summary</div>
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-neutral-600">{r.label}</span>
              <span className={r.emphasis ? "font-semibold text-green-600" : "text-neutral-900"}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      {cta && (
        <button className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-white" onClick={cta.onClick}>
          {cta.label}
        </button>
      )}
    </div>
  );
}
