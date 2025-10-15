import { cn } from "../lib/utils.js";

export function DepthBook({ title, levels, variant }) {
  const maxCumulative = Math.max(...levels.map((level) => level.cumulative));
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.16em]">
        {title}
      </h4>
      <div className="overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Taille</th>
              <th className="px-4 py-3">Cumul</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => {
              const percent = Math.round((level.cumulative / maxCumulative) * 100);
              return (
                <tr key={`${title}-${level.price}`} className="relative">
                  <td className="relative px-4 py-3 font-medium">
                    <span
                      className={cn(
                        "absolute inset-0 -z-10 transition-colors",
                        variant === "bid" ? "bg-emerald-500/10" : "bg-rose-500/10"
                      )}
                      style={{ width: `${percent}%`, opacity: 0.4 }}
                    />
                    {level.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{level.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            variant === "bid" ? "bg-emerald-400/70" : "bg-rose-400/70"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-xs text-muted-foreground">
                        {level.cumulative}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
