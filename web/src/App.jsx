import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  MonitorPlay,
  PanelsTopLeft,
  Sparkles,
  SquareArrowOutUpRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card.jsx";
import { Badge } from "./components/ui/badge.jsx";
import { Button } from "./components/ui/button.jsx";
import { ChartWorkspace } from "./pages/chart-workspace.jsx";
import { CHART_BLUEPRINTS } from "./data/chart-blueprints.js";

const DEFAULT_BLUEPRINT = CHART_BLUEPRINTS[0];

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

function formatRelativeTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "—";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 5) {
    return "à l'instant";
  }
  if (diffSeconds < 60) {
    return `il y a ${diffSeconds}s`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `il y a ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays} j`;
}

function useInitialView() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return { view: "menu", chartId: DEFAULT_BLUEPRINT.id };
    }
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view") === "workspace" ? "workspace" : "menu";
    const requestedChartId = params.get("chart");
    const chart = CHART_BLUEPRINTS.find((item) => item.id === requestedChartId) ?? DEFAULT_BLUEPRINT;
    return { view: requestedView, chartId: chart.id };
  }, []);
}

export default function App() {
  const initial = useInitialView();
  const [appView, setAppView] = useState(initial.view);
  const [activeBlueprintId, setActiveBlueprintId] = useState(initial.chartId);
  const [detachedSessions, setDetachedSessions] = useState([]);
  const detachedWindowRefs = useRef(new Map());

  const activeBlueprint = CHART_BLUEPRINTS.find((item) => item.id === activeBlueprintId) ?? DEFAULT_BLUEPRINT;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams();
    if (appView === "workspace") {
      params.set("view", "workspace");
      params.set("chart", activeBlueprintId);
    } else {
      params.set("view", "menu");
    }
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);
  }, [appView, activeBlueprintId]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (appView === "menu") {
      document.title = "TradingSpace Atelier";
    }
  }, [appView]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleMessage = (event) => {
      if (!event?.data || typeof event.data !== "object") {
        return;
      }
      if (event.origin && event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === "workspace-status" && event.data.sessionId) {
        setDetachedSessions((prev) => {
          const next = prev.map((session) => {
            if (session.id !== event.data.sessionId) {
              return session;
            }
            const lastUpdated = event.data.lastUpdated ? new Date(event.data.lastUpdated) : session.lastUpdated;
            return {
              ...session,
              symbol: event.data.symbol ?? session.symbol,
              aggregation: event.data.aggregation ?? session.aggregation,
              displayAggregation: event.data.displayAggregation ?? session.displayAggregation,
              chartMode: event.data.chartMode ?? session.chartMode,
              template: event.data.template ?? session.template,
              priceSource: event.data.priceSource ?? session.priceSource,
              isLoading: Boolean(event.data.isLoading),
              error: event.data.error ?? null,
              lastUpdated,
              lastPing: new Date(event.data.timestamp ?? Date.now())
            };
          });
          return next;
        });
      }

      if (event.data.type === "workspace-closed" && event.data.sessionId) {
        const sessionId = event.data.sessionId;
        setDetachedSessions((prev) => prev.filter((session) => session.id !== sessionId));
        detachedWindowRefs.current.delete(sessionId);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setDetachedSessions((prev) => {
        const next = prev.filter((session) => {
          const ref = detachedWindowRefs.current.get(session.id);
          if (!ref || ref.closed) {
            detachedWindowRefs.current.delete(session.id);
            return false;
          }
          return true;
        });
        return next.length === prev.length ? prev : next;
      });
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      detachedWindowRefs.current.forEach((ref) => {
        if (ref && !ref.closed) {
          try {
            ref.close();
          } catch (error) {
            console.warn("Impossible de fermer la fenêtre détachée", error);
          }
        }
      });
      detachedWindowRefs.current.clear();
    };
  }, []);

  const focusDetachedSession = useCallback((sessionId) => {
    const ref = detachedWindowRefs.current.get(sessionId);
    if (ref && !ref.closed) {
      ref.focus();
    }
  }, []);

  const closeDetachedSession = useCallback((sessionId) => {
    const ref = detachedWindowRefs.current.get(sessionId);
    if (ref && !ref.closed) {
      ref.close();
    }
    detachedWindowRefs.current.delete(sessionId);
    setDetachedSessions((prev) => prev.filter((session) => session.id !== sessionId));
  }, []);

  const openWorkspaceHere = (blueprint) => {
    setActiveBlueprintId(blueprint.id);
    setAppView("workspace");
  };

  const openWorkspaceWindow = (blueprint) => {
    if (typeof window === "undefined") {
      return;
    }
    const sessionId = createSessionId();
    const url = new URL(window.location.href);
    url.searchParams.set("view", "workspace");
    url.searchParams.set("chart", blueprint.id);
    url.searchParams.set("session", sessionId);
    const child = window.open(
      url.toString(),
      "_blank",
      "noopener,noreferrer,width=1440,height=900"
    );

    if (child) {
      const defaultAggregation = blueprint?.config?.aggregation ?? null;
      const defaultMode = blueprint?.config?.chartMode ?? "time";
      const formattedAggregation = defaultAggregation
        ? defaultMode === "time"
          ? defaultAggregation
          : `${defaultAggregation} · ${defaultMode}`
        : null;
      const initialSession = {
        id: sessionId,
        blueprintId: blueprint.id,
        blueprintName: blueprint.name,
        symbol: blueprint?.config?.symbol ?? blueprint.symbol ?? "—",
        aggregation: defaultAggregation,
        displayAggregation: formattedAggregation,
        chartMode: defaultMode,
        template: blueprint?.config?.template ?? "balanced",
        openedAt: new Date(),
        lastPing: null,
        lastUpdated: null,
        priceSource: "Initialisation",
        isLoading: true,
        error: null
      };
      detachedWindowRefs.current.set(sessionId, child);
      setDetachedSessions((prev) => [...prev, initialSession]);
    }
  };

  if (appView === "workspace") {
    return <ChartWorkspace blueprint={activeBlueprint} onBackToMenu={() => setAppView("menu")} />;
  }

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050509] via-[#080714] to-[#070512] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,120,255,0.12),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-16 px-8 py-16">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="soft" className="text-xs uppercase tracking-[0.4em] text-white/80">
                TradingSpace Atelier
              </Badge>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight">
                Choisissez votre environnement graphique
              </h1>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Inspiré par ATAS & Sierra Chart</span>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-white/70">
            Sélectionnez une salle de marché, ouvrez-la dans une nouvelle fenêtre dédiée ou remplacez l'espace courant.
            Chaque configuration conserve les réglages premium du moteur de charting TradingSpace.
          </p>
        </header>

        {detachedSessions.length > 0 ? (
          <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_30px_60px_rgba(10,8,35,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Fenêtres détachées</h2>
                <p className="text-sm text-white/60">
                  Pilotez les workspaces ouverts dans des fenêtres Windows dédiées et gardez un œil sur leur synchronisation.
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-400/30 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                Multi-fenêtres
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {detachedSessions.map((session) => {
                const statusConfig = (() => {
                  if (session.error) {
                    return {
                      label: session.error,
                      tone: "text-rose-200",
                      border: "border-rose-500/30",
                      icon: AlertTriangle
                    };
                  }
                  if (session.isLoading) {
                    return {
                      label: "Initialisation du flux",
                      tone: "text-amber-200",
                      border: "border-amber-400/30",
                      icon: Loader2
                    };
                  }
                  return {
                    label: session.priceSource ?? "Flux synchronisé",
                    tone: "text-emerald-200",
                    border: "border-emerald-400/30",
                    icon: CheckCircle2
                  };
                })();

                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={session.id}
                    className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_40px_rgba(8,7,20,0.45)] transition hover:border-white/20 hover:bg-black/50"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">{session.blueprintName}</p>
                          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                            {session.symbol}
                            {session.displayAggregation ? (
                              <span className="ml-2 text-sm text-white/50">{session.displayAggregation}</span>
                            ) : null}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => closeDetachedSession(session.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60 transition hover:border-white/30 hover:text-white"
                        >
                          Fermer
                        </button>
                      </div>
                      <div
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${statusConfig.border} ${statusConfig.tone}`}
                      >
                        <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.icon === Loader2 ? "animate-spin" : ""}`} />
                        <span className="truncate">{statusConfig.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-white/30" /> Ouverte à {timeFormatter.format(session.openedAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <MonitorPlay className="h-4 w-4 text-white/30" /> Dernière synchro {formatRelativeTime(session.lastPing ?? session.lastUpdated)}
                        </span>
                        {session.lastUpdated ? (
                          <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-white/30" /> Prix mis à jour {formatRelativeTime(session.lastUpdated)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2 border border-white/10 bg-transparent text-white hover:bg-white/10"
                        onClick={() => focusDetachedSession(session.id)}
                      >
                        <SquareArrowOutUpRight className="h-4 w-4" />
                        Afficher
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="grid gap-10 lg:grid-cols-3">
          {CHART_BLUEPRINTS.map((blueprint) => (
            <Card
              key={blueprint.id}
              className="group relative overflow-hidden border-white/10 bg-white/[0.06] backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-indigo-500/10 opacity-0 transition group-hover:opacity-100" />
              <CardHeader className="relative space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl font-semibold text-white">{blueprint.name}</CardTitle>
                  <Badge variant="outline" className="border-white/20 text-[11px] uppercase tracking-[0.3em] text-white/60">
                    {blueprint.tagline}
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed text-white/60">
                  {blueprint.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
                  {(blueprint.metrics ?? []).map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
                <div className="grid gap-3">
                  <Button
                    className="flex items-center justify-center gap-2"
                    onClick={() => openWorkspaceHere(blueprint)}
                  >
                    <PanelsTopLeft className="h-4 w-4" />
                    Lancer dans l'espace courant
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex items-center justify-center gap-2 border border-white/10 bg-transparent text-white hover:bg-white/10"
                    onClick={() => openWorkspaceWindow(blueprint)}
                  >
                    <SquareArrowOutUpRight className="h-4 w-4" />
                    Ouvrir en fenêtre dédiée
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="h-4 w-4" />
                    <span>Workspace immersif</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
