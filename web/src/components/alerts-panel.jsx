export function AlertsPanel({ alerts }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.16em]">
          Alertes de marché
        </h4>
        <span className="text-xs text-muted-foreground">Synthèse quotidienne</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.label}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/60 px-4 py-3"
          >
            <div>
              <h5 className="text-sm font-semibold text-foreground">{alert.label}</h5>
              <p className="text-xs text-muted-foreground">{alert.level}</p>
            </div>
            <span className="rounded-full bg-primary/20 px-4 py-1 text-xs font-medium text-primary-foreground">
              {alert.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
