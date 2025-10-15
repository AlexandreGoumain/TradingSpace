import {
  mockPriceSeries,
  mockOrderBook,
  mockTrades,
  mockMetrics,
  mockAlerts
} from "./data/mock-data.js";

const CHART_PADDING = 60;
const BASE_TIMEFRAME_MINUTES = 5;

const SYNTHETIC_MULTIPLIERS = {
  tick: {
    "125t": { multiplier: 3.2, labelPrefix: "125T", volatility: 1.4, volumeFactor: 0.45 },
    "250t": { multiplier: 2.2, labelPrefix: "250T", volatility: 1.1, volumeFactor: 0.65 },
    "500t": { multiplier: 1.4, labelPrefix: "500T", volatility: 0.8, volumeFactor: 0.85 }
  },
  volume: {
    "1k": { multiplier: 2.4, labelPrefix: "1kV", volatility: 1.2, volumeFactor: 1.25 },
    "3k": { multiplier: 1.8, labelPrefix: "3kV", volatility: 1, volumeFactor: 1 },
    "6k": { multiplier: 1.2, labelPrefix: "6kV", volatility: 0.7, volumeFactor: 0.75 }
  },
  range: {
    "2R": { multiplier: 2, labelPrefix: "2R", volatility: 1.3, volumeFactor: 0.9 },
    "4R": { multiplier: 1.5, labelPrefix: "4R", volatility: 1, volumeFactor: 0.8 },
    "8R": { multiplier: 1, labelPrefix: "8R", volatility: 0.6, volumeFactor: 0.7 }
  }
};

const CHART_AGGREGATIONS = {
  time: {
    label: "Temps",
    aggregationLabel: "Unités de temps",
    defaultOption: "15m",
    options: [
      { value: "1m", label: "1m" },
      { value: "5m", label: "5m" },
      { value: "15m", label: "15m" },
      { value: "1h", label: "1h" },
      { value: "1d", label: "1j" }
    ],
    generate: (series, aggregation) => resampleTimeSeries(series, aggregation)
  },
  tick: {
    label: "Ticks",
    aggregationLabel: "Taille des ticks",
    defaultOption: "250t",
    options: [
      { value: "125t", label: "125 t" },
      { value: "250t", label: "250 t" },
      { value: "500t", label: "500 t" }
    ],
    generate: (series, aggregation) => generateSyntheticSeries(series, aggregation, "tick")
  },
  volume: {
    label: "Volume",
    aggregationLabel: "Blocs de volume",
    defaultOption: "3k",
    options: [
      { value: "1k", label: "1k" },
      { value: "3k", label: "3k" },
      { value: "6k", label: "6k" }
    ],
    generate: (series, aggregation) => generateSyntheticSeries(series, aggregation, "volume")
  },
  range: {
    label: "Range",
    aggregationLabel: "Amplitude (points)",
    defaultOption: "4R",
    options: [
      { value: "2R", label: "2R" },
      { value: "4R", label: "4R" },
      { value: "8R", label: "8R" }
    ],
    generate: (series, aggregation) => generateSyntheticSeries(series, aggregation, "range")
  }
};

const TEMPLATE_CONFIGS = {
  balanced: {
    label: "Vue équilibrée",
    modules: { chart: true, depth: true, tape: true, metrics: true, alerts: true }
  },
  orderflow: {
    label: "Flux order flow (ATAS)",
    modules: { chart: true, depth: true, tape: true, metrics: false, alerts: true }
  },
  heatmap: {
    label: "Vue heatmap (Bookmap)",
    modules: { chart: true, depth: true, tape: false, metrics: false, alerts: false }
  }
};

function getContext(canvas) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Impossible d'initialiser le contexte du graphique");
  }
  return context;
}

function parseTimeToMinutes(label) {
  if (typeof label !== "string" || !label.includes(":")) {
    return 0;
  }
  const [hours, minutes] = label.split(":").map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseAggregationToMinutes(aggregation) {
  if (typeof aggregation !== "string") {
    return BASE_TIMEFRAME_MINUTES;
  }
  const match = aggregation.match(/(\d+)([mhd])/i);
  if (!match) {
    return BASE_TIMEFRAME_MINUTES;
  }
  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit === "m") {
    return value;
  }
  if (unit === "h") {
    return value * 60;
  }
  if (unit === "d") {
    return value * 60 * 24;
  }
  return BASE_TIMEFRAME_MINUTES;
}

function scaleSeries(series, targetLength, labelFormatter, options = {}) {
  if (!Array.isArray(series) || series.length === 0 || !targetLength || targetLength < 1) {
    return [];
  }
  const { volumeFactor = 1, volatility = 1 } = options;
  const denominator = Math.max(targetLength - 1, 1);
  const density = targetLength / series.length;
  const result = [];

  for (let index = 0; index < targetLength; index += 1) {
    const position = (index / denominator) * (series.length - 1);
    const leftIndex = Math.floor(position);
    const rightIndex = Math.min(series.length - 1, Math.ceil(position));
    const interpolation = position - leftIndex;
    const left = series[leftIndex];
    const right = series[rightIndex];
    const previousClose = index === 0 ? left.open : result[index - 1].close;

    const baseClose = left.close + (right.close - left.close) * interpolation;
    const spread = Math.max(
      Math.abs(left.high - left.low),
      Math.abs(right.high - right.low),
      0.5
    );
    const wave = Math.sin((index / Math.max(denominator, 1)) * Math.PI * volatility) * (spread / 6);
    const close = baseClose + wave;

    const baseHigh = left.high + (right.high - left.high) * interpolation;
    const baseLow = left.low + (right.low - left.low) * interpolation;
    const high = Math.max(previousClose, close, baseHigh) + spread * 0.12;
    const low = Math.min(previousClose, close, baseLow) - spread * 0.12;

    const baseVolume = left.volume + (right.volume - left.volume) * interpolation;
    const adjustedVolume = Math.max(
      25,
      Math.round((baseVolume / density) * volumeFactor)
    );

    result.push({
      time: labelFormatter(index, left, right),
      open: previousClose,
      high,
      low,
      close,
      volume: adjustedVolume
    });
  }

  return result;
}

function aggregateSeries(series, groupSize, labelFormatter) {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }
  const size = Math.max(1, groupSize);
  const aggregated = [];

  for (let index = 0; index < series.length; index += size) {
    const chunk = series.slice(index, index + size);
    if (chunk.length === 0) {
      continue;
    }
    const open = aggregated.length === 0 ? chunk[0].open : aggregated[aggregated.length - 1].close;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map((bar) => bar.high), open, close);
    const low = Math.min(...chunk.map((bar) => bar.low), open, close);
    const volume = chunk.reduce((total, bar) => total + bar.volume, 0);

    aggregated.push({
      time: labelFormatter(aggregated.length, chunk[0], chunk[chunk.length - 1]),
      open,
      high,
      low,
      close,
      volume
    });
  }

  return aggregated;
}

function resampleTimeSeries(series, aggregation) {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }
  const minutes = parseAggregationToMinutes(aggregation);

  if (minutes === BASE_TIMEFRAME_MINUTES) {
    return series.map((bar) => ({ ...bar }));
  }

  if (minutes < BASE_TIMEFRAME_MINUTES) {
    const factor = Math.max(1, Math.round(BASE_TIMEFRAME_MINUTES / minutes));
    const totalBars = series.length * factor;
    const startMinutes = parseTimeToMinutes(series[0].time);
    return scaleSeries(
      series,
      totalBars,
      (index) => formatMinutesToTime(startMinutes + index * minutes),
      { volatility: 0.6, volumeFactor: 0.85 }
    );
  }

  const startMinutes = parseTimeToMinutes(series[0].time);
  const desiredBars = Math.max(
    2,
    Math.round((BASE_TIMEFRAME_MINUTES * series.length) / minutes)
  );
  const groupSize = Math.max(1, Math.round(series.length / desiredBars));

  return aggregateSeries(series, groupSize, (index) =>
    formatMinutesToTime(startMinutes + index * minutes)
  );
}

function generateSyntheticSeries(series, aggregation, type) {
  if (!Array.isArray(series) || series.length === 0) {
    return [];
  }
  const config = SYNTHETIC_MULTIPLIERS[type]?.[aggregation];
  if (!config) {
    return series.map((bar) => ({ ...bar }));
  }
  const targetLength = Math.max(6, Math.round(series.length * config.multiplier));
  return scaleSeries(
    series,
    targetLength,
    (index) => `${config.labelPrefix} ${index + 1}`,
    { volatility: config.volatility ?? 1, volumeFactor: config.volumeFactor ?? 1 }
  );
}

function scalePrice(value, min, max, height) {
  if (max === min) {
    return height / 2;
  }
  const ratio = (value - min) / (max - min);
  return height - CHART_PADDING - ratio * (height - CHART_PADDING * 2);
}

function drawGrid(ctx, width, height, steps = 5) {
  ctx.save();
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-border-soft"
  );
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  const verticalStep = (width - CHART_PADDING * 2) / steps;
  const horizontalStep = (height - CHART_PADDING * 2) / steps;
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const x = CHART_PADDING + i * verticalStep;
    ctx.moveTo(x, CHART_PADDING);
    ctx.lineTo(x, height - CHART_PADDING);
  }
  for (let i = 0; i <= steps; i += 1) {
    const y = CHART_PADDING + i * horizontalStep;
    ctx.moveTo(CHART_PADDING, y);
    ctx.lineTo(width - CHART_PADDING, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPriceLine(ctx, series, width, height) {
  if (!Array.isArray(series) || series.length === 0) {
    return { maxPrice: 0, minPrice: 0, xStep: 0 };
  }
  const closes = series.map((bar) => bar.close);
  const highs = series.map((bar) => bar.high);
  const lows = series.map((bar) => bar.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const hasMultiple = series.length > 1;
  const xStep = hasMultiple ? (width - CHART_PADDING * 2) / (series.length - 1) : 0;

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-accent"
  );
  ctx.beginPath();

  series.forEach((bar, index) => {
    const x = hasMultiple ? CHART_PADDING + index * xStep : width / 2;
    const y = scalePrice(bar.close, minPrice, maxPrice, height);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Ombre sous le prix
  const gradient = ctx.createLinearGradient(0, CHART_PADDING, 0, height);
  gradient.addColorStop(0, "rgba(80, 160, 255, 0.25)");
  gradient.addColorStop(1, "rgba(80, 160, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  series.forEach((bar, index) => {
    const x = hasMultiple ? CHART_PADDING + index * xStep : width / 2;
    const y = scalePrice(bar.close, minPrice, maxPrice, height);
    if (index === 0) {
      if (hasMultiple) {
        ctx.moveTo(x, height - CHART_PADDING);
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(CHART_PADDING, height - CHART_PADDING);
        ctx.lineTo(x, y);
      }
    } else {
      ctx.lineTo(x, y);
    }
  });
  if (hasMultiple) {
    ctx.lineTo(width - CHART_PADDING, height - CHART_PADDING);
  } else {
    ctx.lineTo(width - CHART_PADDING, height - CHART_PADDING);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bougies
  ctx.save();
  ctx.lineWidth = 4;
  series.forEach((bar, index) => {
    const x = hasMultiple ? CHART_PADDING + index * xStep : width / 2;
    const yOpen = scalePrice(bar.open, minPrice, maxPrice, height);
    const yClose = scalePrice(bar.close, minPrice, maxPrice, height);
    const yHigh = scalePrice(bar.high, minPrice, maxPrice, height);
    const yLow = scalePrice(bar.low, minPrice, maxPrice, height);

    ctx.strokeStyle = bar.close >= bar.open ? "#1fbf74" : "#ff5c5c";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x, yOpen);
    ctx.lineTo(x, yClose);
    ctx.stroke();
  });
  ctx.restore();

  return { maxPrice, minPrice, xStep };
}

function drawEma(ctx, series, width, height, minPrice, maxPrice, period = 5) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  const closes = series.map((bar) => bar.close);
  const k = 2 / (period + 1);
  const ema = [];
  closes.forEach((price, index) => {
    if (index === 0) {
      ema.push(price);
    } else {
      const previous = ema[index - 1];
      ema.push(price * k + previous * (1 - k));
    }
  });

  const hasMultiple = ema.length > 1;
  const xStep = hasMultiple ? (width - CHART_PADDING * 2) / (ema.length - 1) : 0;
  ctx.save();
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ema.forEach((value, index) => {
    const x = hasMultiple ? CHART_PADDING + index * xStep : width / 2;
    const y = scalePrice(value, minPrice, maxPrice, height);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function drawAxes(ctx, series, width, height, minPrice, maxPrice) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  ctx.save();
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-text-secondary"
  );
  ctx.font = "14px 'Inter', system-ui";

  const priceSteps = 5;
  for (let i = 0; i <= priceSteps; i += 1) {
    const value = minPrice + ((maxPrice - minPrice) / priceSteps) * i;
    const y = scalePrice(value, minPrice, maxPrice, height);
    ctx.fillText(value.toFixed(2), width - CHART_PADDING + 10, y + 4);
  }

  const timeStep = Math.max(1, Math.floor(series.length / 4));
  series.forEach((bar, index) => {
    if (index % timeStep === 0 || index === series.length - 1) {
      const hasMultiple = series.length > 1;
      const x = hasMultiple
        ? CHART_PADDING + index * ((width - CHART_PADDING * 2) / (series.length - 1))
        : width / 2;
      ctx.fillText(bar.time, x - 20, height - CHART_PADDING + 30);
    }
  });

  ctx.restore();
}

function renderChart(canvas, series) {
  const ctx = getContext(canvas);
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height);
  const { minPrice, maxPrice } = drawPriceLine(ctx, series, width, height);
  drawEma(ctx, series, width, height, minPrice, maxPrice, 6);
  drawAxes(ctx, series, width, height, minPrice, maxPrice);
}

function renderOrderBook(tableElement, levels, direction) {
  const tbody = tableElement.querySelector("tbody");
  tbody.innerHTML = "";
  const maxCumulative = Math.max(...levels.map((level) => level.cumulative));
  levels.forEach((level) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${level.price.toFixed(2)}</td>
      <td>${level.size}</td>
      <td>
        <div class="depth-bar depth-bar--${direction}" style="--depth-percent:${Math.round(
          (level.cumulative / maxCumulative) * 100
        )}%"></div>
        <span>${level.cumulative}</span>
      </td>`;
    tbody.appendChild(row);
  });
}

function renderTape(listElement, trades) {
  listElement.innerHTML = "";
  trades.forEach((trade) => {
    const item = document.createElement("li");
    item.className = `tape__item tape__item--${trade.aggressor === "Acheteur" ? "buy" : "sell"}`;
    item.innerHTML = `
      <span class="tape__time">${trade.time}</span>
      <span class="tape__price">${trade.price.toFixed(2)}</span>
      <span class="tape__size">${trade.size}</span>
      <span class="tape__aggressor">${trade.aggressor}</span>`;
    listElement.appendChild(item);
  });
}

function renderMetrics(container, metrics) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  metrics.forEach((metric) => {
    const item = document.createElement("div");
    item.className = "metrics__item";
    item.setAttribute("role", "listitem");
    item.innerHTML = `
      <span class="metrics__label">${metric.label}</span>
      <strong class="metrics__value">${metric.value}</strong>
      <span class="metrics__hint">${metric.hint}</span>
    `;
    container.appendChild(item);
  });
}

function renderAlerts(listElement, alerts) {
  listElement.innerHTML = "";
  alerts.forEach((alert) => {
    const item = document.createElement("li");
    item.className = "alerts__item";
    item.innerHTML = `
      <div>
        <strong>${alert.label}</strong>
        <span>${alert.level}</span>
      </div>
      <span class="alerts__status">${alert.status}</span>`;
    listElement.appendChild(item);
  });
}

function setupChartControls(series) {
  const typeSelect = document.getElementById("chart-type");
  const buttonsContainer = document.getElementById("chart-aggregation-buttons");
  const label = document.getElementById("chart-aggregation-label");
  const canvas = document.getElementById("price-chart");

  if (!typeSelect || !buttonsContainer || !canvas) {
    return;
  }

  const updateActiveButton = (value) => {
    buttonsContainer.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("chip--active", button.dataset.aggregation === value);
    });
  };

  const setAggregationLabel = (config) => {
    if (label) {
      label.textContent = config.aggregationLabel;
    }
    buttonsContainer.setAttribute(
      "aria-label",
      `Sélection ${config.aggregationLabel.toLowerCase()}`
    );
  };

  const applyAggregation = (value, config) => {
    const targetConfig = config ?? CHART_AGGREGATIONS[typeSelect.value] ?? CHART_AGGREGATIONS.time;
    const dataset = targetConfig.generate(series, value);
    renderChart(canvas, dataset);
    updateActiveButton(value);
  };

  const renderButtons = (type) => {
    const config = CHART_AGGREGATIONS[type] ?? CHART_AGGREGATIONS.time;
    buttonsContainer.innerHTML = "";

    config.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.dataset.aggregation = option.value;
      button.textContent = option.label;
      button.addEventListener("click", () => applyAggregation(option.value, config));
      buttonsContainer.appendChild(button);
    });

    setAggregationLabel(config);
    applyAggregation(config.defaultOption, config);
  };

  typeSelect.addEventListener("change", (event) => {
    renderButtons(event.target.value);
  });

  renderButtons(typeSelect.value || "time");
}

function setupTemplateSwitcher() {
  const select = document.getElementById("template-select");
  const layout = document.querySelector(".layout");
  const aside = document.querySelector(".layout__secondary");
  const modules = {};

  document.querySelectorAll("[data-module]").forEach((node) => {
    modules[node.dataset.module] = node;
  });

  if (!layout || !select) {
    return;
  }

  const fallbackVisibility = TEMPLATE_CONFIGS.balanced.modules;

  const apply = (templateName) => {
    const template = TEMPLATE_CONFIGS[templateName] ?? TEMPLATE_CONFIGS.balanced;
    layout.dataset.template = templateName;

    Object.entries(modules).forEach(([key, element]) => {
      const desired = template.modules?.[key];
      const fallback = fallbackVisibility[key];
      const shouldDisplay = typeof desired === "boolean" ? desired : fallback ?? true;
      element.toggleAttribute("hidden", !shouldDisplay);
    });

    if (aside) {
      const hasVisibleModule = Array.from(aside.children).some((child) => !child.hasAttribute("hidden"));
      aside.toggleAttribute("hidden", !hasVisibleModule);
    }
  };

  select.addEventListener("change", (event) => {
    apply(event.target.value);
  });

  apply(select.value || "balanced");
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  toggle.addEventListener("click", () => {
    const isDark = document.body.dataset.theme === "dark";
    document.body.dataset.theme = isDark ? "light" : "dark";
    toggle.textContent = isDark ? "Mode sombre" : "Mode clair";
  });
}

function animateLatency() {
  const indicator = document.getElementById("latency-indicator");
  const connectivity = document.getElementById("connectivity");
  setInterval(() => {
    const latency = 1.4 + Math.random() * 2;
    indicator.textContent = `${latency.toFixed(2)} ms`;
    connectivity.value = Math.max(75, Math.min(100, 90 + (Math.random() - 0.5) * 12));
  }, 3000);
}

function setupRealtimeUpdates() {
  const bids = [...mockOrderBook.bids];
  const asks = [...mockOrderBook.asks];
  const tape = [...mockTrades];

  setInterval(() => {
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

    let cumulativeBid = 0;
    bids.forEach((level) => {
      cumulativeBid += level.size;
      level.cumulative = cumulativeBid;
    });

    let cumulativeAsk = 0;
    asks.forEach((level) => {
      cumulativeAsk += level.size;
      level.cumulative = cumulativeAsk;
    });

    renderOrderBook(document.getElementById("orderbook-bids"), bids, "bid");
    renderOrderBook(document.getElementById("orderbook-asks"), asks, "ask");

    const nextPrice = (asks[0].price + bids[0].price) / 2;
    const trade = {
      time: new Date().toLocaleTimeString("fr-FR", { hour12: false }),
      price: nextPrice,
      size: Math.round(5 + Math.random() * 30),
      aggressor: Math.random() > 0.5 ? "Acheteur" : "Vendeur"
    };
    tape.unshift(trade);
    if (tape.length > 20) {
      tape.pop();
    }
    renderTape(document.getElementById("trade-tape"), tape);
  }, 5000);
}

function initialiseDashboard() {
  document.body.dataset.theme = "dark";
  renderChart(document.getElementById("price-chart"), mockPriceSeries);
  renderOrderBook(document.getElementById("orderbook-bids"), mockOrderBook.bids, "bid");
  renderOrderBook(document.getElementById("orderbook-asks"), mockOrderBook.asks, "ask");
  renderTape(document.getElementById("trade-tape"), mockTrades);
  renderMetrics(document.getElementById("metrics"), mockMetrics);
  renderAlerts(document.getElementById("alerts-list"), mockAlerts);
  setupChartControls(mockPriceSeries);
  setupTemplateSwitcher();
  setupThemeToggle();
  animateLatency();
  setupRealtimeUpdates();
}

document.addEventListener("DOMContentLoaded", initialiseDashboard);
