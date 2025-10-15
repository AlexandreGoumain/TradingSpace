import { useEffect, useMemo, useState } from "react";
import { Activity, LayoutDashboard, Zap } from "lucide-react";
import {
  CHART_AGGREGATIONS,
  TEMPLATE_CONFIGS,
  buildSeriesForMode
} from "./lib/charting.js";
import { mockPriceSeries, mockOrderBook, mockTrades, mockMetrics, mockAlerts } from "./data/mock-data.js";
import { cn } from "./lib/utils.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card.jsx";
import { Button } from "./components/ui/button.jsx";
import { Badge } from "./components/ui/badge.jsx";
import { Input } from "./components/ui/input.jsx";
import { Select } from "./components/ui/select.jsx";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs.jsx";
import { Toggle } from "./components/ui/toggle.jsx";
import { Switch } from "./components/ui/switch.jsx";
import { PriceChart } from "./components/price-chart.jsx";
import { DepthBook } from "./components/depth-book.jsx";
import { ExecutionTape } from "./components/execution-tape.jsx";
import { MetricsGrid } from "./components/metrics-grid.jsx";
import { AlertsPanel } from "./components/alerts-panel.jsx";

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

export default function App() {
  const [chartMode, setChartMode] = useState("time");
  const [aggregation, setAggregation] = useState(CHART_AGGREGATIONS.time.defaultOption);
  const [indicators, setIndicators] = useState(() =>
    INDICATORS.reduce((acc, item) => ({ ...acc, [item.key]: item.default }), {})
  );
  const [template, setTemplate] = useState("balanced");
  const [orderBook, setOrderBook] = useState(() => createInitialOrderBook());
  const [tradeTape, setTradeTape] = useState(() => [...mockTrades]);
  const [latency, setLatency] = useState(1.6);
  const [connectivity, setConnectivity] = useState(96);
  const [symbol, setSymbol] = useState("ES 03-24");

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
    setAggregation(config.defaultOption);
  }, [chartMode]);

  const aggregationConfig = CHART_AGGREGATIONS[chartMode] ?? CHART_AGGREGATIONS.time;

  const chartSeries = useMemo(
    () => buildSeriesForMode(mockPriceSeries, chartMode, aggregation),
    [chartMode, aggregation]
  );

  const templateConfig = TEMPLATE_CONFIGS[template] ?? TEMPLATE_CONFIGS.balanced;

  const toggleIndicator = (key) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const modulesVisibility = templateConfig.modules;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex max-w-[1600px] gap-6 px-8 py-10">
        <aside className="flex w-[320px] flex-col gap-6">
          <Card className="card-surface">
            <CardHeader>
              <div>
                <Badge variant="soft" className="text-xs uppercase tracking-[0.3em]">
                  TradingSpace
                </Badge>
                <CardTitle className="mt-3 text-2xl">Studio institutionnel</CardTitle>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                  Infrastructure de trading intraday pour desks pros.
                </CardDescription>
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
                  value={symbol}
                  onChange={(event) => setSymbol(event.target.value)}
                  className="mt-2"
                  placeholder="Rechercher un actif"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Marché</p>
                  <p className="mt-1 font-medium">CME Futures</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Fuseau</p>
                  <p className="mt-1 font-medium">Europe / Paris</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rythme</p>
                  <p className="mt-1 font-medium">Intraday 15'</p>
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
            </CardContent>
          </Card>

          {modulesVisibility.metrics ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Métriques clés</CardTitle>
                  <CardDescription>Lecture instantanée des flux</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <MetricsGrid metrics={mockMetrics} />
              </CardContent>
            </Card>
          ) : null}

          {modulesVisibility.alerts ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Alerting tactique</CardTitle>
                  <CardDescription>Signaux prêts à déclenchement</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <AlertsPanel alerts={mockAlerts} />
              </CardContent>
            </Card>
          ) : null}
        </aside>

        <div className="flex-1 space-y-6">
          <header className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Workspace</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">{symbol}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Futures S&P 500 · CME Globex</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-secondary/60 px-6 py-4 text-right">
              <p className="text-3xl font-semibold text-white">4 527,75</p>
              <p className="text-sm text-emerald-300">+12,5 (+0,28%)</p>
              <div className="mt-3 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                <span>Latence</span>
                <span>{latency.toFixed(2)} ms</span>
                <span className="h-1 w-1 rounded-full bg-emerald-300" />
                <span>Sync {Math.round(connectivity)}%</span>
              </div>
            </div>
          </header>

          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Courbe de prix</CardTitle>
                <CardDescription>{aggregationConfig.aggregationLabel}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={chartMode}
                  onChange={(event) => setChartMode(event.target.value)}
                  className="w-[170px]"
                >
                  {Object.entries(CHART_AGGREGATIONS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </Select>
                <Tabs value={aggregation} onValueChange={setAggregation}>
                  <TabsList>
                    {aggregationConfig.options.map((option) => (
                      <TabsTrigger key={option.value} value={option.value}>
                        {option.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <PriceChart series={chartSeries} indicators={indicators} />
              <div className="flex flex-wrap items-center gap-3">
                {INDICATORS.map((indicator) => (
                  <Toggle
                    key={indicator.key}
                    pressed={indicators[indicator.key]}
                    onClick={() => toggleIndicator(indicator.key)}
                  >
                    {indicator.label}
                  </Toggle>
                ))}
                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Auto refresh</span>
                  <Switch checked onCheckedChange={() => {}} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {modulesVisibility.depth ? (
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profondeur de marché</CardTitle>
                    <CardDescription>Carnet x10 mis à jour en continu</CardDescription>
                  </div>
                  <Badge variant="outline">Consolidé</Badge>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <DepthBook title="Bids" levels={orderBook.bids} variant="bid" />
                  <DepthBook title="Asks" levels={orderBook.asks} variant="ask" />
                </CardContent>
              </Card>
            ) : null}

            {modulesVisibility.tape ? (
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle>Flux d'exécution</CardTitle>
                    <CardDescription>Transactions agressées en temps réel</CardDescription>
                  </div>
                  <Badge variant="soft">Realtime</Badge>
                </CardHeader>
                <CardContent>
                  <ExecutionTape trades={tradeTape} />
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Template de poste</CardTitle>
                <CardDescription>Moduler l'espace selon vos rituels</CardDescription>
              </div>
              <Select value={template} onChange={(event) => setTemplate(event.target.value)} className="w-[220px]">
                {Object.entries(TEMPLATE_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {Object.entries(TEMPLATE_CONFIGS).map(([key, config]) => {
                const isActive = template === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTemplate(key)}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-dashed border-border/60 bg-secondary/50 p-5 text-left transition-all hover:border-foreground/40",
                      isActive && "border-primary bg-primary/10"
                    )}
                  >
                    <span className="text-sm font-semibold">{config.label}</span>
                    <span className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(config.modules)
                        .filter(([, visible]) => visible)
                        .map(([module]) => module)
                        .join(" · ")}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
