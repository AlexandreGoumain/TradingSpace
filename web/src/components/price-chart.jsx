import { useEffect, useRef } from "react";
import { renderChart } from "../lib/charting.js";

export function PriceChart({ series, appearance = {}, isLoading, error, lastUpdated }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    if (!Array.isArray(series) || series.length === 0 || isLoading || error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    renderChart(canvas, series, appearance);
  }, [series, appearance, isLoading, error]);

  const statusLabel = lastUpdated
    ? `Mise à jour ${lastUpdated.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      })}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_40px_80px_rgba(8,10,32,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_70%)]" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Évolution des prix"
        width={1600}
        height={600}
        className="relative z-10 h-[420px] w-full"
      />
      {isLoading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm">
          <span className="animate-pulse text-sm font-semibold tracking-wide text-white/90">
            Chargement des cotations…
          </span>
          {statusLabel ? <span className="text-xs text-slate-200/80">{statusLabel}</span> : null}
        </div>
      ) : null}
      {!isLoading && error ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 border border-red-500/30 bg-red-950/60 px-6 text-center text-sm text-red-100">
          <span className="text-base font-semibold tracking-wide">Impossible de charger les données temps réel</span>
          <span className="text-xs leading-relaxed text-red-100/80">{error}</span>
        </div>
      ) : null}
    </div>
  );
}
