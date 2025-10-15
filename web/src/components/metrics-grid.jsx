export function MetricsGrid({ metrics }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-border/60 bg-secondary/50 p-5 transition-colors hover:border-foreground/40"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {metric.label}
          </span>
          <div className="mt-3 text-2xl font-semibold">{metric.value}</div>
          <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
        </div>
      ))}
    </div>
  );
}
