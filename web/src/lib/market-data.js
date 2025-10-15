const ALPHA_VANTAGE_ENDPOINT = "https://www.alphavantage.co/query";
const YAHOO_CHART_ENDPOINT = "https://query1.finance.yahoo.com/v8/finance/chart";
const DEFAULT_API_KEY = "demo";

const INTRADAY_INTERVALS = {
  "1m": { func: "TIME_SERIES_INTRADAY", interval: "1min", display: "time" },
  "5m": { func: "TIME_SERIES_INTRADAY", interval: "5min", display: "time" },
  "15m": { func: "TIME_SERIES_INTRADAY", interval: "15min", display: "time" },
  "1h": { func: "TIME_SERIES_INTRADAY", interval: "60min", display: "time" }
};

const DAILY_CONFIG = { func: "TIME_SERIES_DAILY", display: "date" };

const YAHOO_INTERVALS = {
  "1m": { range: "1d", interval: "1m", display: "time" },
  "5m": { range: "5d", interval: "5m", display: "time" },
  "15m": { range: "1mo", interval: "15m", display: "time" },
  "1h": { range: "3mo", interval: "60m", display: "time" },
  "1d": { range: "1y", interval: "1d", display: "date" },
  default: { range: "6mo", interval: "1d", display: "date" }
};

function resolveApiKey(explicitKey) {
  if (explicitKey && typeof explicitKey === "string") {
    return explicitKey.trim();
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_ALPHAVANTAGE_API_KEY) {
    return import.meta.env.VITE_ALPHAVANTAGE_API_KEY.trim();
  }
  return DEFAULT_API_KEY;
}

function parseAlphaNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return Number.NaN;
  }
  return Number.parseFloat(value);
}

function formatLabelFromDate(date, display) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  if (display === "date") {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

async function fetchFromAlphaVantage(symbol, aggregation, options = {}) {
  const trimmedSymbol = symbol?.toString().trim();
  if (!trimmedSymbol) {
    throw new Error("Merci d'indiquer un symbole coté");
  }

  const normalizedSymbol = trimmedSymbol.replace(/\s+/g, "").toUpperCase();
  const apiKey = resolveApiKey(options.apiKey);

  const intervalConfig = INTRADAY_INTERVALS[aggregation];
  const query = new URLSearchParams({
    symbol: normalizedSymbol,
    apikey: apiKey
  });

  if (intervalConfig) {
    query.set("function", intervalConfig.func);
    query.set("interval", intervalConfig.interval);
    query.set("outputsize", options.outputsize ?? "compact");
  } else {
    query.set("function", DAILY_CONFIG.func);
    query.set("outputsize", options.outputsize ?? "compact");
  }

  const response = await fetch(`${ALPHA_VANTAGE_ENDPOINT}?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Erreur réseau lors de la récupération des données Alpha Vantage");
  }
  const payload = await response.json();

  if (payload["Error Message"]) {
    throw new Error("Symbole inconnu pour la source Alpha Vantage");
  }
  if (payload.Note) {
    throw new Error("Limite de requêtes Alpha Vantage atteinte. Réessayez dans une minute");
  }

  const seriesKey = Object.keys(payload).find((key) =>
    key.toLowerCase().includes("time series") || key.toLowerCase().includes("daily")
  );
  const metaKey = Object.keys(payload).find((key) => key.toLowerCase().includes("meta"));

  if (!seriesKey || !payload[seriesKey]) {
    throw new Error("Réponse inattendue de l'API Alpha Vantage");
  }

  const displayMode = intervalConfig?.display ?? DAILY_CONFIG.display;

  const seriesEntries = Object.entries(payload[seriesKey])
    .map(([timestamp, values]) => {
      const open = parseAlphaNumber(values["1. open"] ?? values.open);
      const high = parseAlphaNumber(values["2. high"] ?? values.high);
      const low = parseAlphaNumber(values["3. low"] ?? values.low);
      const close = parseAlphaNumber(values["4. close"] ?? values.close);
      const volume = parseAlphaNumber(values["5. volume"] ?? values.volume);

      if ([open, high, low, close].some((value) => !Number.isFinite(value))) {
        return null;
      }

      const date = new Date(`${timestamp}Z`);

      return {
        timestamp,
        time: formatLabelFromDate(date, displayMode),
        open,
        high,
        low,
        close,
        volume: Number.isFinite(volume) ? volume : 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

  if (seriesEntries.length === 0) {
    throw new Error("Aucune donnée exploitable retournée par Alpha Vantage");
  }

  const lastPoint = seriesEntries[seriesEntries.length - 1];
  const meta = metaKey ? payload[metaKey] : undefined;
  const lastRefreshed = meta?.["3. Last Refreshed"] ?? lastPoint?.timestamp;
  const updatedAt = lastRefreshed ? new Date(`${lastRefreshed}Z`) : new Date();

  return {
    series: seriesEntries,
    sourceLabel: "Alpha Vantage (free tier)",
    updatedAt,
    symbol: normalizedSymbol
  };
}

async function fetchFromYahoo(symbol, aggregation) {
  const trimmedSymbol = symbol?.toString().trim();
  if (!trimmedSymbol) {
    throw new Error("Merci d'indiquer un symbole coté");
  }

  const normalizedSymbol = trimmedSymbol.replace(/\s+/g, "").toUpperCase();
  const intervalConfig = YAHOO_INTERVALS[aggregation] ?? YAHOO_INTERVALS.default;
  const query = new URLSearchParams({
    range: intervalConfig.range,
    interval: intervalConfig.interval,
    events: "history",
    includeAdjustedClose: "true"
  });

  const response = await fetch(`${YAHOO_CHART_ENDPOINT}/${encodeURIComponent(normalizedSymbol)}?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Erreur réseau lors de la récupération des données Yahoo Finance");
  }

  const payload = await response.json();
  const chartResult = payload?.chart?.result?.[0];
  const chartError = payload?.chart?.error;

  if (chartError) {
    throw new Error(chartError.description || "Source Yahoo Finance indisponible");
  }
  if (!chartResult) {
    throw new Error("Réponse inattendue de Yahoo Finance");
  }

  const displayMode = intervalConfig.display;
  const timestamps = Array.isArray(chartResult.timestamp) ? chartResult.timestamp : [];
  const quote = chartResult.indicators?.quote?.[0];

  if (!quote) {
    throw new Error("Données de prix Yahoo Finance incomplètes");
  }

  const seriesEntries = timestamps
    .map((epoch, index) => {
      const open = quote.open?.[index];
      const high = quote.high?.[index];
      const low = quote.low?.[index];
      const close = quote.close?.[index];
      const volume = quote.volume?.[index];

      if ([open, high, low, close].some((value) => !Number.isFinite(value))) {
        return null;
      }

      const date = new Date(epoch * 1000);

      return {
        timestamp: date.toISOString(),
        time: formatLabelFromDate(date, displayMode),
        open,
        high,
        low,
        close,
        volume: Number.isFinite(volume) ? volume : 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

  if (seriesEntries.length === 0) {
    throw new Error("Aucune donnée exploitable retournée par Yahoo Finance");
  }

  const marketTime = chartResult.meta?.regularMarketTime ?? chartResult.meta?.currentTradingPeriod?.regular?.end;
  const updatedAt = marketTime ? new Date(marketTime * 1000) : new Date();

  return {
    series: seriesEntries,
    sourceLabel: "Yahoo Finance (free)",
    updatedAt,
    symbol: normalizedSymbol
  };
}

export async function fetchTimeSeries(symbol, aggregation, options = {}) {
  const providers = [
    async () => fetchFromAlphaVantage(symbol, aggregation, options),
    async () => fetchFromYahoo(symbol, aggregation)
  ];
  const errors = [];

  for (const provider of providers) {
    try {
      return await provider();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const aggregatedMessage = errors.length
    ? `Sources indisponibles (${errors.join(" · ")})`
    : "Sources de marché indisponibles";

  throw new Error(aggregatedMessage);
}
