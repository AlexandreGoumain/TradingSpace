import {
  mockPriceSeries,
  mockOrderBook,
  mockTrades,
  mockMetrics,
  mockAlerts
} from "./data/mock-data.js";

const CHART_PADDING = 60;

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
  const closes = series.map((bar) => bar.close);
  const highs = series.map((bar) => bar.high);
  const lows = series.map((bar) => bar.low);
  const maxPrice = Math.max(...highs);
  const minPrice = Math.min(...lows);
  const xStep = (width - CHART_PADDING * 2) / (series.length - 1);

  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
    "--color-accent"
  );
  ctx.beginPath();

  series.forEach((bar, index) => {
    const x = CHART_PADDING + index * xStep;
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
    const x = CHART_PADDING + index * xStep;
    const y = scalePrice(bar.close, minPrice, maxPrice, height);
    if (index === 0) {
      ctx.moveTo(x, height - CHART_PADDING);
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(width - CHART_PADDING, height - CHART_PADDING);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bougies
  ctx.save();
  ctx.lineWidth = 4;
  series.forEach((bar, index) => {
    const x = CHART_PADDING + index * xStep;
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

  const xStep = (width - CHART_PADDING * 2) / (ema.length - 1);
  ctx.save();
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ema.forEach((value, index) => {
    const x = CHART_PADDING + index * xStep;
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

  const timeStep = Math.floor(series.length / 4);
  series.forEach((bar, index) => {
    if (index % timeStep === 0 || index === series.length - 1) {
      const x = CHART_PADDING + index * ((width - CHART_PADDING * 2) / (series.length - 1));
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
  container.innerHTML = "";
  metrics.forEach((metric) => {
    const term = document.createElement("dt");
    term.textContent = metric.label;
    const description = document.createElement("dd");
    description.innerHTML = `<strong>${metric.value}</strong><span>${metric.hint}</span>`;
    container.appendChild(term);
    container.appendChild(description);
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

function setupTimeframeControls(series) {
  const buttons = document.querySelectorAll("[data-timeframe]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("chip--active"));
      button.classList.add("chip--active");
      const timeframe = button.dataset.timeframe;
      const canvas = document.getElementById("price-chart");
      const dataset = generateResampledSeries(series, timeframe);
      renderChart(canvas, dataset);
    });
  });
}

function generateResampledSeries(series, timeframe) {
  if (timeframe === "15m") {
    return series;
  }

  const multiplier =
    timeframe === "1m"
      ? 1
      : timeframe === "5m"
      ? 1
      : timeframe === "1h"
      ? 4
      : timeframe === "1d"
      ? 8
      : 1;

  if (multiplier === 1) {
    return series;
  }

  const result = [];
  for (let i = 0; i < series.length; i += multiplier) {
    const chunk = series.slice(i, i + multiplier);
    if (chunk.length === 0) continue;
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map((bar) => bar.high));
    const low = Math.min(...chunk.map((bar) => bar.low));
    const volume = chunk.reduce((acc, bar) => acc + bar.volume, 0);
    result.push({
      time: chunk[0].time,
      open,
      high,
      low,
      close,
      volume
    });
  }
  return result;
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
  setupTimeframeControls(mockPriceSeries);
  setupTemplateSwitcher();
  setupThemeToggle();
  animateLatency();
  setupRealtimeUpdates();
}

document.addEventListener("DOMContentLoaded", initialiseDashboard);
