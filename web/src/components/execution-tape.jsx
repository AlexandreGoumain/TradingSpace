import { ScrollArea } from "./ui/scroll-area.jsx";
import { cn } from "../lib/utils.js";

export function ExecutionTape({ trades }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.16em]">
          Flux d'exécution
        </h4>
        <span className="text-xs text-muted-foreground">Dernières 20 transactions</span>
      </div>
      <ScrollArea className="h-[320px] rounded-2xl border border-border/60 bg-secondary/60 p-2">
        <ul className="space-y-2 text-sm">
          {trades.map((trade) => (
            <li
              key={`${trade.time}-${trade.price}-${trade.size}`}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3 text-xs font-medium",
                trade.aggressor === "Acheteur"
                  ? "bg-emerald-500/10 text-emerald-200"
                  : "bg-rose-500/10 text-rose-200"
              )}
            >
              <span className="w-16 font-mono text-xs text-muted-foreground">{trade.time}</span>
              <span className="w-20 text-right font-semibold">{trade.price.toFixed(2)}</span>
              <span className="w-12 text-right text-muted-foreground">{trade.size}</span>
              <span className="w-20 text-right uppercase tracking-wide">
                {trade.aggressor}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
