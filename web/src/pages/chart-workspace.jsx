import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, LayoutDashboard, Zap } from "lucide-react";
import {
  CHART_AGGREGATIONS,
  TEMPLATE_CONFIGS,
  generateSyntheticSeries,
  CHART_THEMES,
  CANDLE_PRESETS,
  GRID_PRESETS,
  GLOW_PRESETS
} from "../lib/charting.js";
import { fetchTimeSeries } from "../lib/market-data.js";
import {
  mockPriceSeries,
  mockOrderBook,
  mockTrades,
  mockMetrics,
  mockAlerts
} from "../data/mock-data.js";
import { cn } from "../lib/utils.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import { Toggle } from "../components/ui/toggle.jsx";
import { Switch } from "../components/ui/switch.jsx";
import { PriceChart } from "../components/price-chart.jsx";
import { DepthBook } from "../components/depth-book.jsx";
import { ExecutionTape } from "../components/execution-tape.jsx";
import { MetricsGrid } from "../components/metrics-grid.jsx";
import { AlertsPanel } from "../components/alerts-panel.jsx";

const INDICATORS = [
  { key: "ema", label: "EMA", default: true },
  { key: "vwaps", label: "VWAP", default: false },
  { key: "volumeProfile", label: "Profil volume", default: true }
];

function createInitialOrderBook() {
  return {
    bids: mockOrderBook.bids.map((level) => ({ ...level })),
    asks: mockOrderBook.asks.map((level) => ({ ...level }))
  };
}

function recalcCumulative(levels) {
  let cumulative = 0;
  return levels.map((level) => {
    cumulative += level.size;
    return { ...level, cumulative };
  });
}

export function ChartWorkspace({ blueprint, onBackToMenu }) {
  const defaultStyling = blueprint?.config?.styling ?? {};
  const defaultIndicators = blueprint?.config?.indicators ?? {};
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("session");
  }, []);

  const [chartMode, setChartMode] = useState(blueprint?.config?.chartMode ?? "time");
  const [aggregation, setAggregation] = useState(
    blueprint?.config?.aggregation ?? CHART_AGGREGATIONS[chartMode]?.defaultOption ?? CHART_AGGREGATIONS.time.defaultOption
  );
  const [timeAggregation, setTimeAggregation] = useState(CHART_AGGREGATIONS.time.defaultOption);
  const [indicators, setIndicators] = useState(() =>
    INDICATORS.reduce(
      (acc, item) => ({
        ...acc,
        [item.key]: defaultIndicators[item.key] ?? item.default
      }),
      {}
    )
  );
  const [template, setTemplate] = useState(blueprint?.config?.template ?? "balanced");
  const [symbolDraft, setSymbolDraft] = useState(blueprint?.config?.symbol ?? "MSFT");
  const [symbol, setSymbol] = useState(blueprint?.config?.symbol ?? "MSFT");
  const [orderBook, setOrderBook] = useState(() => createInitialOrderBook());
  const [tradeTape, setTradeTape] = useState(() => [...mockTrades]);
  const [latency, setLatency] = useState(1.6);
  const [connectivity, setConnectivity] = useState(96);
  const [priceSeries, setPriceSeries] = useState(mockPriceSeries);
  const [priceSource, setPriceSource] = useState("Flux simulé");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [chartStyling, setChartStyling] = useState({
    theme: defaultStyling.theme ?? "nocturne",
    candle: defaultStyling.candle ?? "lumina",
    grid: defaultStyling.grid ?? "balanced",
    glow: defaultStyling.glow ?? "medium",
    showSessions: defaultStyling.showSessions ?? true,
    showBaseline: defaultStyling.showBaseline ?? true,
    showVolume: defaultStyling.showVolume ?? true,
    highlightExtremes: defaultStyling.highlightExtremes ?? true
  });

  useEffect(() => {
    const nextMode = blueprint?.config?.chartMode ?? "time";
    const nextAggregation = blueprint?.config?.aggregation;
    const nextTemplate = blueprint?.config?.template ?? "balanced";
    const nextSymbol = blueprint?.config?.symbol ?? "MSFT";
    const nextIndicators = blueprint?.config?.indicators ?? {};
    const nextStyling = blueprint?.config?.styling ?? {};

    const nextModeConfig = CHART_AGGREGATIONS[nextMode] ?? CHART_AGGREGATIONS.time;
    const nextModeValues = (nextModeConfig.options ?? []).map((option) =>
      typeof option === "string" ? option : option.value
    );
    const fallbackAggregation = (() => {
      if (nextAggregation && nextModeValues.includes(nextAggregation)) {
        return nextAggregation;
      }
      if (nextModeConfig.defaultOption && nextModeValues.includes(nextModeConfig.defaultOption)) {
        return nextModeConfig.defaultOption;
      }
      return nextModeValues[0] ?? nextAggregation ?? aggregation;
    })();

    const timeConfig = CHART_AGGREGATIONS.time;
    const timeValues = (timeConfig.options ?? []).map((option) =>
      typeof option === "string" ? option : option.value
    );
    const fallbackTimeAggregation = timeValues.includes(timeConfig.defaultOption)
      ? timeConfig.defaultOption
      : timeValues[0] ?? timeAggregation;

    setChartMode(nextMode);
    setAggregation(fallbackAggregation);
    setTimeAggregation(nextMode === "time" ? fallbackAggregation : fallbackTimeAggregation);
    setTemplate(nextTemplate);
    setSymbolDraft(nextSymbol);
    setSymbol(nextSymbol);
    setIndicators(
      INDICATORS.reduce(
        (acc, item) => ({
          ...acc,
          [item.key]: nextIndicators[item.key] ?? item.default
        }),
        {}
      )
    );
    setChartStyling({
      theme: nextStyling.theme ?? "nocturne",
      candle: nextStyling.candle ?? "lumina",
      grid: nextStyling.grid ?? "balanced",
      glow: nextStyling.glow ?? "medium",
      showSessions: nextStyling.showSessions ?? true,
      showBaseline: nextStyling.showBaseline ?? true,
      showVolume: nextStyling.showVolume ?? true,
      highlightExtremes: nextStyling.highlightExtremes ?? true
    });
  }, [blueprint]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((prev) => {
        const next = 1.4 + Math.random() * 2;
        return Number.parseFloat(next.toFixed(2));
      });
      setConnectivity(() => Math.max(75, Math.min(100, 90 + (Math.random() - 0.5) * 12)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBook((prev) => {
        const bids = [...prev.bids];
        const asks = [...prev.asks];
        const bidShift = bids.shift();
        const askShift = asks.shift();
        if (bidShift) {
          bids.push({
            price: bidShift.price - 0.25,
            size: Math.max(20, Math.round(bidShift.size * (0.8 + Math.random() * 0.4))),
            cumulative: 0
          });
        }
        if (askShift) {
          asks.push({
            price: askShift.price + 0.25,
            size: Math.max(20, Math.round(askShift.size * (0.8 + Math.random() * 0.4))),
            cumulative: 0
          });
        }
        const updated = {
          bids: recalcCumulative(bids),
          asks: recalcCumulative(asks)
        };
        setTradeTape((prevTape) => {
          const bestBid = updated.bids[0];
          const bestAsk = updated.asks[0];
          const midPrice =
            bestBid && bestAsk ? (bestAsk.price + bestBid.price) / 2 : prevTape[0]?.price ?? 0;
          const trade = {
            time: new Date().toLocaleTimeString("fr-FR", { hour12: false }),
            price: midPrice,
            size: Math.round(5 + Math.random() * 30),
            aggressor: Math.random() > 0.5 ? "Acheteur" : "Vendeur"
          };
          return [trade, ...prevTape].slice(0, 20);
        });
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const config = CHART_AGGREGATIONS[chartMode] ?? CHART_AGGREGATIONS.time;
    const availableValues = (config.options ?? []).map((option) =>
      typeof option === "string" ? option : option.value
    );
    setAggregation((prev) => {
      if (availableValues.includes(prev)) {
        return prev;
      }
      if (config.defaultOption && availableValues.includes(config.defaultOption)) {
        return config.defaultOption;
      }
      return availableValues[0] ?? prev;
    });
  }, [chartMode]);

  useEffect(() => {
    if (chartMode === "time") {
      setTimeAggregation(aggregation);
    }
  }, [chartMode, aggregation]);

  useEffect(() => {
    let cancelled = false;
    async function loadSeries() {
      try {
        setIsLoadingPrices(true);
        const targetAggregation = chartMode === "time" ? aggregation : timeAggregation;
        const result = await fetchTimeSeries(symbol, targetAggregation);
        if (cancelled) {
          return;
        }
        setPriceSeries(result.series);
        setPriceSource(result.sourceLabel);
        setLastUpdated(result.updatedAt);
        setPriceError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setPriceError(error instanceof Error ? error.message : "Chargement indisponible");
        setPriceSeries(mockPriceSeries);
        setPriceSource("Flux simulé");
        setLastUpdated(null);
      } finally {
        if (!cancelled) {
          setIsLoadingPrices(false);
        }
      }
    }

    loadSeries();

    return () => {
      cancelled = true;
    };
  }, [symbol, chartMode, aggregation, timeAggregation]);

  const aggregationConfig = CHART_AGGREGATIONS[chartMode] ?? CHART_AGGREGATIONS.time;

  const chartSeries = useMemo(() => {
    if (!Array.isArray(priceSeries)) {
      return [];
    }
    if (chartMode === "time") {
      return priceSeries;
    }
    return generateSyntheticSeries(priceSeries, aggregation, chartMode);
  }, [priceSeries, chartMode, aggregation]);

  const chartRendering = useMemo(() => {
    const glowPreset = GLOW_PRESETS[chartStyling.glow] ?? GLOW_PRESETS.medium;
    return {
      theme: chartStyling.theme,
      candleStyle: chartStyling.candle,
      gridDensity: chartStyling.grid,
      glowIntensity: glowPreset.intensity,
      overlays: {
        ema: indicators.ema,
        vwap: indicators.vwaps,
        volumeProfile: indicators.volumeProfile
      },
      extras: {
        showSessions: chartStyling.showSessions,
        showBaseline: chartStyling.showBaseline,
        showVolume: chartStyling.showVolume,
        highlightExtremes: chartStyling.highlightExtremes
      }
    };
  }, [chartStyling, indicators]);

  const latestBar = chartSeries.length > 0 ? chartSeries[chartSeries.length - 1] : null;
  const previousBar = chartSeries.length > 1 ? chartSeries[chartSeries.length - 2] : latestBar;
  const lastClose = latestBar?.close ?? 0;
  const previousClose = previousBar?.close ?? lastClose;
  const priceChange = lastClose - previousClose;
  const priceChangePercent = previousClose ? (priceChange / previousClose) * 100 : 0;
  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    []
  );
  const formattedPrice = formatCurrency.format(lastClose);
  const formattedDelta = formatCurrency.format(Math.abs(priceChange));
  const formattedDeltaPercent = formatCurrency.format(Math.abs(priceChangePercent));
  const changeSign = priceChange >= 0 ? "+" : "-";
  const isPriceUp = priceChange >= 0;
  const updatedAtLabel = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(lastUpdated);
  }, [lastUpdated]);

  const templateConfig = TEMPLATE_CONFIGS[template] ?? TEMPLATE_CONFIGS.balanced;

  const updateChartStyling = (key, value) => {
    setChartStyling((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIndicator = (key) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const modulesVisibility = templateConfig.modules;

  const commitSymbol = () => {
    if (!symbolDraft) {
      return;
    }
    setSymbol(symbolDraft.replace(/\s+/g, "").toUpperCase());
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }
    const previous = document.title;
    document.title = `${symbol} · ${blueprint?.name ?? "Workspace"} | TradingSpace`;
    return () => {
      document.title = previous;
    };
  }, [symbol, blueprint?.name]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || !window.opener) {
      return undefined;
    }

    const notifyParent = () => {
      const payload = {
        type: "workspace-status",
        sessionId,
        symbol,
        aggregation,
        displayAggregation: chartMode === "time" ? aggregation : `${aggregation} · ${chartMode}`,
        chartMode,
        template,
        priceSource,
        isLoading: isLoadingPrices,
        error: priceError ?? null,
        lastUpdated: lastUpdated instanceof Date ? lastUpdated.getTime() : null,
        timestamp: Date.now()
      };
      try {
        window.opener.postMessage(payload, window.location.origin);
      } catch (error) {
        window.opener.postMessage(payload, "*");
      }
    };

    notifyParent();

    const interval = window.setInterval(() => {
      notifyParent();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId, symbol, aggregation, chartMode, template, priceSource, isLoadingPrices, priceError, lastUpdated]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || !window.opener) {
      return undefined;
    }

    const handleBeforeUnload = () => {
      const payload = { type: "workspace-closed", sessionId };
      try {
        window.opener.postMessage(payload, window.location.origin);
      } catch (error) {
        window.opener.postMessage(payload, "*");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex max-w-[1600px] gap-6 px-8 py-10">
        <aside className="flex w-[320px] flex-col gap-6">
          <Card className="card-surface">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="soft" className="text-xs uppercase tracking-[0.3em]">
                    TradingSpace
                  </Badge>
                  <CardTitle className="mt-3 text-2xl">{blueprint?.name ?? "Studio"}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {blueprint?.description ?? "Infrastructure de trading intraday pour desks pros."}
                  </CardDescription>
                </div>
                {onBackToMenu ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-white/10 bg-white/5"
                    onClick={onBackToMenu}
                    title="Retour au menu des workspaces"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-3 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4 text-emerald-300" /> Marché ouvert
                </span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" /> {latency.toFixed(2)} ms
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LayoutDashboard className="h-4 w-4" /> {Math.round(connectivity)}% sync
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Symbole</span>
                <Input
                  value={symbolDraft}
                  onChange={(event) => setSymbolDraft(event.target.value.toUpperCase())}
                  onBlur={commitSymbol}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitSymbol();
                    }
                  }}
                  className="mt-2"
                  placeholder="Ex: MSFT, AAPL"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Marché</p>
                  <p className="mt-1 font-medium">Actions US</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fuseau</p>
                  <p className="mt-1 font-medium">Europe / Paris</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rythme</p>
                  <p className="mt-1 font-medium">Intraday {timeAggregation}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Connectivité</p>
                  <p className="mt-1 font-medium">Streaming direct</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1">Passer un ordre</Button>
                <Button variant="ghost" className="flex-1 border border-border/60">
                  Mode clair
                </Button>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 text-xs text-muted-foreground">
                <p className="uppercase tracking-[0.22em] text-white/70">Focus</p>
                <p className="mt-3 text-sm font-semibold text-white">{blueprint?.tagline ?? "Workspace"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(blueprint?.metrics ?? ["VWAP", "Volume", "Sessions"]).map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em]"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Atelier charting</CardTitle>
                <CardDescription>Composez votre esthétique graphique</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Palette</span>
                <Select value={chartStyling.theme} onChange={(event) => updateChartStyling("theme", event.target.value)}>
                  {Object.entries(CHART_THEMES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Chandeliers</span>
                  <Select value={chartStyling.candle} onChange={(event) => updateChartStyling("candle", event.target.value)}>
                    {Object.entries(CANDLE_PRESETS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Grille</span>
                  <Select value={chartStyling.grid} onChange={(event) => updateChartStyling("grid", event.target.value)}>
                    {Object.entries(GRID_PRESETS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Halo</span>
                <Select value={chartStyling.glow} onChange={(event) => updateChartStyling("glow", event.target.value)}>
                  {Object.entries(GLOW_PRESETS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                  <span>Sessions</span>
                  <Switch checked={chartStyling.showSessions} onCheckedChange={(value) => updateChartStyling("showSessions", value)} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                  <span>Baseline</span>
                  <Switch checked={chartStyling.showBaseline} onCheckedChange={(value) => updateChartStyling("showBaseline", value)} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                  <span>Volume</span>
                  <Switch checked={chartStyling.showVolume} onCheckedChange={(value) => updateChartStyling("showVolume", value)} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                  <span>Extrêmes</span>
                  <Switch
                    checked={chartStyling.highlightExtremes}
                    onCheckedChange={(value) => updateChartStyling("highlightExtremes", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indicateurs</CardTitle>
              <CardDescription>Activer / désactiver les overlays</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {INDICATORS.map((indicator) => (
                <div
                  key={indicator.key}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm font-medium text-white/80">{indicator.label}</span>
                  <Toggle pressed={Boolean(indicators[indicator.key])} onClick={() => toggleIndicator(indicator.key)}>
                    {indicators[indicator.key] ? "ON" : "OFF"}
                  </Toggle>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 space-y-6">
          <Card className="relative overflow-hidden border-white/5 bg-black/40 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-semibold tracking-tight text-white">
                  {symbol} <span className="text-sm text-white/50">{aggregation}</span>
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-white/60">
                  Source : {priceSource}
                  {updatedAtLabel ? ` · maj ${updatedAtLabel}` : ""}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end text-right text-white">
                <span className={cn("text-4xl font-semibold", isPriceUp ? "text-emerald-300" : "text-rose-300")}>
                  {formattedPrice}
                </span>
                <span className={cn("mt-1 text-sm", isPriceUp ? "text-emerald-200" : "text-rose-200")}>
                  {changeSign}
                  {formattedDelta} ({changeSign}
                  {formattedDeltaPercent}%)
                </span>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <PriceChart
                series={chartSeries}
                isLoading={isLoadingPrices}
                error={priceError}
                rendering={chartRendering}
                className="h-[520px]"
              />
            </CardContent>
          </Card>

          <Tabs value={chartMode} onValueChange={setChartMode} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/30">
              {Object.entries(CHART_AGGREGATIONS).map(([key, config]) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-white/10">
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Card className="border-white/5 bg-black/40">
            <CardContent className="flex items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="uppercase tracking-[0.2em] text-white/40">
                  {aggregationConfig.aggregationLabel ?? "Agrégation"}
                </span>
                <Select value={aggregation} onChange={(event) => setAggregation(event.target.value)}>
                  {aggregationConfig.options?.map((option) => {
                    const value = typeof option === "string" ? option : option.value;
                    const label = typeof option === "string" ? option : option.label;
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="uppercase tracking-[0.2em] text-white/40">Template</span>
                <Select value={template} onChange={(event) => setTemplate(event.target.value)}>
                  {Object.entries(TEMPLATE_CONFIGS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="uppercase tracking-[0.2em] text-white/40">Mode</span>
                <Select value={chartMode} onChange={(event) => setChartMode(event.target.value)}>
                  {Object.entries(CHART_AGGREGATIONS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-12 gap-6">
            {modulesVisibility.metrics ? (
              <div className="col-span-12 xl:col-span-4">
                <MetricsGrid data={mockMetrics} />
              </div>
            ) : null}
            {modulesVisibility.depth ? (
              <div className="col-span-12 xl:col-span-4">
                <DepthBook book={orderBook} />
              </div>
            ) : null}
            {modulesVisibility.tape ? (
              <div className="col-span-12 xl:col-span-4">
                <ExecutionTape trades={tradeTape} />
              </div>
            ) : null}
          </div>

          {modulesVisibility.alerts ? <AlertsPanel alerts={mockAlerts} /> : null}
        </div>
      </div>
    </div>
  );
}
