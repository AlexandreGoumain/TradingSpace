export const CHART_BLUEPRINTS = [
  {
    id: "institutional-flow",
    name: "Flux institutionnel",
    tagline: "Carnet + empreinte",
    description:
      "Vue intraday complète avec carnet, bande d'exécution et profil volume optimisés pour les desks professionnels.",
    metrics: ["Orderflow", "Volume profile", "VWAP"],
    config: {
      symbol: "MSFT",
      template: "balanced",
      chartMode: "time",
      aggregation: "5m",
      styling: {
        theme: "nocturne",
        candle: "lumina",
        grid: "balanced",
        glow: "medium",
        showSessions: true,
        showBaseline: true,
        showVolume: true,
        highlightExtremes: true
      },
      indicators: {
        ema: true,
        vwaps: true,
        volumeProfile: true
      }
    }
  },
  {
    id: "delta-precision",
    name: "Précision Delta",
    tagline: "Footprint bid/ask",
    description:
      "Configuration orientée Delta et imbalance pour suivre les flux agressifs avec un halo lumineux minimal.",
    metrics: ["Imbalance", "Delta", "Footprint"],
    config: {
      symbol: "AAPL",
      template: "analysis",
      chartMode: "tick",
      aggregation: "250t",
      styling: {
        theme: "aero",
        candle: "hollow",
        grid: "dense",
        glow: "low",
        showSessions: false,
        showBaseline: false,
        showVolume: true,
        highlightExtremes: true
      },
      indicators: {
        ema: false,
        vwaps: true,
        volumeProfile: false
      }
    }
  },
  {
    id: "macro-panorama",
    name: "Macro Panorama",
    tagline: "Multi-timeframe",
    description:
      "Template panoramique pour les swings macro, calibré sur des agrégations longues avec un thème clair et épuré.",
    metrics: ["Sessions", "Trendline", "VWAP"],
    config: {
      symbol: "^GSPC",
      template: "panoramic",
      chartMode: "time",
      aggregation: "1h",
      styling: {
        theme: "linen",
        candle: "classic",
        grid: "airy",
        glow: "medium",
        showSessions: true,
        showBaseline: true,
        showVolume: false,
        highlightExtremes: false
      },
      indicators: {
        ema: true,
        vwaps: false,
        volumeProfile: true
      }
    }
  }
];
