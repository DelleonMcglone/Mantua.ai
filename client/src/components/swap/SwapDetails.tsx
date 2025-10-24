import { useState } from "react";

type Props = {
  priceImpact?: string;
  maxSlippage?: string;
  fee?: string;
  networkCostUsd?: string;
};

// File purpose: Collapsible swap details panel.
export default function SwapDetails({
  priceImpact = "—",
  maxSlippage = "0.50%",
  fee = "—",
  networkCostUsd = "$4.20",
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button className="text-sm underline" onClick={() => setOpen(!open)}>
        Swap details {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border p-3 text-sm">
          <div className="flex justify-between">
            <span>Price impact</span>
            <span>{priceImpact}</span>
          </div>
          <div className="flex justify-between">
            <span>Max slippage</span>
            <span>{maxSlippage}</span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span>{fee}</span>
          </div>
          <div className="flex justify-between">
            <span>Network cost</span>
            <span>{networkCostUsd}</span>
          </div>
        </div>
      )}
    </div>
  );
}
