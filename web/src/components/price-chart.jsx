import { useEffect, useRef } from "react";
import { renderChart } from "../lib/charting.js";

export function PriceChart({ series, indicators }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !Array.isArray(series)) {
      return;
    }
    renderChart(canvas, series, { showEma: indicators?.ema });
  }, [series, indicators]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Évolution des prix"
      width={1600}
      height={600}
      className="h-[360px] w-full rounded-2xl bg-secondary/50"
    />
  );
}
