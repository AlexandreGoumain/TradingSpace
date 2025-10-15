const CHART_PADDING = 60;
const PRICE_AXIS_WIDTH = 86;
const BASE_TIMEFRAME_MINUTES = 5;

export const CHART_THEMES = {
  nocturne: {
    label: "Nocturne Néon",
    background: { top: "#080B1C", bottom: "#050111", glare: "rgba(59, 130, 246, 0.25)" },
    grid: { major: "rgba(148, 163, 184, 0.12)", minor: "rgba(148, 163, 184, 0.05)" },
    axis: { panel: "rgba(10, 12, 24, 0.76)", text: "rgba(226, 232, 240, 0.82)", muted: "rgba(148, 163, 184, 0.6)" },
    bullish: {
      body: "rgba(34, 197, 94, 0.85)",
      outline: "rgba(16, 185, 129, 0.9)",
      wick: "rgba(134, 239, 172, 0.95)",
      glow: "rgba(16, 185, 129, 0.4)"
    },
    bearish: {
      body: "rgba(248, 113, 113, 0.75)",
      outline: "rgba(239, 68, 68, 0.9)",
      wick: "rgba(252, 165, 165, 0.9)",
      glow: "rgba(244, 63, 94, 0.4)"
    },
    highlight: "rgba(125, 211, 252, 0.35)",
    baseline: "rgba(148, 163, 184, 0.35)",
    session: "rgba(37, 99, 235, 0.08)",
    volume: {
      bullish: "rgba(16, 185, 129, 0.45)",
      bearish: "rgba(244, 63, 94, 0.45)",
      outline: "rgba(148, 163, 184, 0.22)"
    }
  },
  aurora: {
    label: "Aurore polaire",
    background: { top: "#04111F", bottom: "#0A1F2D", glare: "rgba(16, 185, 129, 0.24)" },
    grid: { major: "rgba(94, 234, 212, 0.16)", minor: "rgba(20, 184, 166, 0.06)" },
    axis: { panel: "rgba(1, 17, 26, 0.82)", text: "rgba(224, 255, 255, 0.85)", muted: "rgba(148, 213, 228, 0.7)" },
    bullish: {
      body: "rgba(45, 212, 191, 0.85)",
      outline: "rgba(13, 148, 136, 0.85)",
      wick: "rgba(94, 234, 212, 0.95)",
      glow: "rgba(45, 212, 191, 0.38)"
    },
    bearish: {
      body: "rgba(96, 165, 250, 0.62)",
      outline: "rgba(59, 130, 246, 0.85)",
      wick: "rgba(147, 197, 253, 0.9)",
      glow: "rgba(59, 130, 246, 0.35)"
    },
    highlight: "rgba(16, 185, 129, 0.35)",
    baseline: "rgba(125, 211, 252, 0.36)",
    session: "rgba(20, 184, 166, 0.08)",
    volume: {
      bullish: "rgba(16, 185, 129, 0.5)",
      bearish: "rgba(59, 130, 246, 0.45)",
      outline: "rgba(125, 211, 252, 0.18)"
    }
  },
  quartz: {
    label: "Quartz Opaline",
    background: { top: "#11060d", bottom: "#220c24", glare: "rgba(244, 114, 182, 0.25)" },
    grid: { major: "rgba(244, 114, 182, 0.16)", minor: "rgba(236, 72, 153, 0.08)" },
    axis: { panel: "rgba(34, 9, 33, 0.82)", text: "rgba(255, 236, 255, 0.85)", muted: "rgba(244, 194, 255, 0.7)" },
    bullish: {
      body: "rgba(236, 72, 153, 0.82)",
      outline: "rgba(217, 70, 239, 0.88)",
      wick: "rgba(244, 114, 182, 0.9)",
      glow: "rgba(217, 70, 239, 0.4)"
    },
    bearish: {
      body: "rgba(249, 115, 22, 0.75)",
      outline: "rgba(251, 146, 60, 0.9)",
      wick: "rgba(253, 186, 116, 0.9)",
      glow: "rgba(251, 146, 60, 0.38)"
    },
    highlight: "rgba(244, 114, 182, 0.28)",
    baseline: "rgba(244, 114, 182, 0.34)",
    session: "rgba(124, 58, 237, 0.08)",
    volume: {
      bullish: "rgba(217, 70, 239, 0.5)",
      bearish: "rgba(251, 146, 60, 0.45)",
      outline: "rgba(244, 114, 182, 0.2)"
    }
  }
};

export const CANDLE_PRESETS = {
  lumina: { label: "Lumina pleines", mode: "solid" },
  aerolight: { label: "Aérolight creuses", mode: "hollow" },
  heikin: {
    label: "Heikin adaptive",
    mode: "solid",
    transform: (series) => {
      if (!Array.isArray(series) || series.length === 0) {
        return [];
      }
      const result = [];
      series.forEach((bar, index) => {
        const previous = result[index - 1];
        const open = index === 0 ? (bar.open + bar.close) / 2 : (previous.open + previous.close) / 2;
        const close = (bar.open + bar.high + bar.low + bar.close) / 4;
        const high = Math.max(bar.high, open, close);
        const low = Math.min(bar.low, open, close);
        result.push({ ...bar, open, close, high, low });
      });
      return result;
    }
  }
};

export const GRID_PRESETS = {
  focus: { label: "Focus", major: 4, minor: 2 },
  balanced: { label: "Balancé", major: 6, minor: 3 },
  dense: { label: "Précision", major: 8, minor: 4 }
};

export const GLOW_PRESETS = {
  soft: { label: "Halo doux", intensity: 0.25 },
  medium: { label: "Aura médiane", intensity: 0.55 },
  intense: { label: "Impulsion", intensity: 0.85 }
};

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

export const CHART_AGGREGATIONS = {
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
    ]
  },
  tick: {
    label: "Ticks",
    aggregationLabel: "Taille des ticks",
    defaultOption: "250t",
    options: [
      { value: "125t", label: "125 t" },
      { value: "250t", label: "250 t" },
      { value: "500t", label: "500 t" }
    ]
  },
  volume: {
    label: "Volume",
    aggregationLabel: "Blocs de volume",
    defaultOption: "3k",
    options: [
      { value: "1k", label: "1k" },
      { value: "3k", label: "3k" },
      { value: "6k", label: "6k" }
    ]
  },
  range: {
    label: "Range",
    aggregationLabel: "Amplitude (points)",
    defaultOption: "4R",
    options: [
      { value: "2R", label: "2R" },
      { value: "4R", label: "4R" },
      { value: "8R", label: "8R" }
    ]
  }
};

export const TEMPLATE_CONFIGS = {
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
  },
  analysis: {
    label: "Analyse Delta",
    modules: { chart: true, depth: true, tape: true, metrics: false, alerts: false }
  },
  panoramic: {
    label: "Vue panoramique",
    modules: { chart: true, depth: false, tape: false, metrics: true, alerts: true }
  }
};

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
    const adjustedVolume = Math.max(25, Math.round((baseVolume / density) * volumeFactor));

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

export function resampleTimeSeries(series, aggregation) {
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
  const desiredBars = Math.max(2, Math.round((BASE_TIMEFRAME_MINUTES * series.length) / minutes));
  const groupSize = Math.max(1, Math.round(series.length / desiredBars));

  return aggregateSeries(series, groupSize, (index) =>
    formatMinutesToTime(startMinutes + index * minutes)
  );
}

export function generateSyntheticSeries(series, aggregation, type) {
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

// Advanced chart rendering helpers and renderer

function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function scaleToRange(value, min, max, top, bottom) {
  if (!Number.isFinite(value)) {
    return bottom;
  }
  if (max === min) {
    return (top + bottom) / 2;
  }
  const ratio = (value - min) / (max - min);
  return bottom - ratio * (bottom - top);
}

function computePriceRange(series, paddingRatio = 0.012) {
  if (!Array.isArray(series) || series.length === 0) {
    return { min: 0, max: 1 };
  }
  const highs = series.map((bar) => bar.high ?? bar.close ?? 0);
  const lows = series.map((bar) => bar.low ?? bar.close ?? 0);
  const rawMax = Math.max(...highs);
  const rawMin = Math.min(...lows);
  if (!Number.isFinite(rawMax) || !Number.isFinite(rawMin)) {
    return { min: 0, max: 1 };
  }
  const span = rawMax - rawMin || Math.max(Math.abs(rawMax), 1) * 0.01;
  const padding = span * paddingRatio;
  return { min: rawMin - padding, max: rawMax + padding };
}

function computeLayout(width, height, { showVolume, includeProfile }) {
  const axisLeft = width - CHART_PADDING - PRICE_AXIS_WIDTH;
  const usableWidth = Math.max(40, axisLeft - CHART_PADDING);
  const profileWidth = includeProfile ? Math.min(120, usableWidth * 0.18) : 0;
  const candleWidth = Math.max(16, usableWidth - profileWidth);
  const priceHeight = showVolume ? height - CHART_PADDING * 2 - 110 : height - CHART_PADDING * 2;
  const priceTop = CHART_PADDING;
  const priceBottom = priceTop + priceHeight;
  const volumeTop = priceBottom + (showVolume ? 26 : 0);
  const volumeBottom = showVolume ? height - CHART_PADDING : priceBottom;
  return {
    price: {
      left: CHART_PADDING,
      right: CHART_PADDING + candleWidth,
      width: candleWidth,
      top: priceTop,
      bottom: priceBottom,
      height: priceHeight
    },
    profile: {
      left: axisLeft - profileWidth - (profileWidth > 0 ? 8 : 0),
      width: profileWidth,
      top: priceTop,
      bottom: priceBottom,
      height: priceHeight
    },
    volume: {
      left: CHART_PADDING,
      right: CHART_PADDING + candleWidth,
      width: candleWidth,
      top: volumeTop,
      bottom: volumeBottom,
      height: Math.max(0, volumeBottom - volumeTop)
    },
    axis: {
      left: axisLeft,
      width: PRICE_AXIS_WIDTH,
      top: priceTop,
      bottom: priceBottom,
      height: priceHeight
    },
    fullWidth: width,
    fullHeight: height
  };
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground(ctx, width, height, theme, glowIntensity) {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.background.top);
  gradient.addColorStop(1, theme.background.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  if (theme.background.glare) {
    const radial = ctx.createRadialGradient(
      width * 0.78,
      height * 0.12,
      0,
      width * 0.78,
      height * 0.12,
      width * 0.9
    );
    radial.addColorStop(0, theme.background.glare);
    radial.addColorStop(1, "transparent");
    ctx.globalAlpha = glowIntensity * 0.85;
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function drawGrid(ctx, layout, theme, densityKey) {
  const preset = GRID_PRESETS[densityKey] ?? GRID_PRESETS.balanced;
  const { left, right, top, bottom, width } = layout.price;
  ctx.save();
  ctx.lineWidth = 1;
  const major = Math.max(2, preset.major);
  ctx.strokeStyle = theme.grid.major;
  ctx.beginPath();
  for (let i = 0; i <= major; i += 1) {
    const x = left + (i / major) * width;
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
  }
  for (let i = 0; i <= major; i += 1) {
    const y = top + ((bottom - top) / major) * i;
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
  }
  ctx.stroke();

  if (preset.minor > 0) {
    const minor = Math.max(1, preset.minor);
    ctx.setLineDash([3, 8]);
    ctx.strokeStyle = theme.grid.minor;
    ctx.beginPath();
    const gapX = width / (major * minor);
    for (let index = 0; index <= major * minor; index += 1) {
      const x = left + index * gapX;
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
    }
    const gapY = (bottom - top) / (major * minor);
    for (let index = 0; index <= major * minor; index += 1) {
      const y = top + index * gapY;
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawSessionBands(ctx, series, layout, theme, enabled) {
  if (!enabled || !Array.isArray(series) || series.length < 2) {
    return;
  }
  const { left, width, top, bottom } = layout.price;
  const totalBars = series.length;
  const cluster = Math.max(1, Math.round(totalBars / 6));
  const bandWidth = (cluster / totalBars) * width;
  ctx.save();
  ctx.fillStyle = theme.session;
  for (let start = 0; start < totalBars; start += cluster * 2) {
    const x = left + (start / totalBars) * width;
    ctx.fillRect(x, top, bandWidth, bottom - top);
  }
  ctx.restore();
}

function drawAxisPanel(ctx, layout, theme) {
  const { left, width, top, height } = layout.axis;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = theme.axis.panel ?? "rgba(12, 13, 20, 0.7)";
  drawRoundedRect(ctx, left, top, width, height, 18);
  ctx.fill();
  ctx.restore();
}

function drawVolumeBars(ctx, series, layout, theme) {
  if (!Array.isArray(series) || series.length === 0 || layout.volume.height <= 0) {
    return;
  }
  const { left, width, top, bottom } = layout.volume;
  const maxVolume = Math.max(...series.map((bar) => bar.volume ?? 0));
  if (!maxVolume) {
    return;
  }
  const step = width / series.length;
  const barWidth = clamp(step * 0.66, 2, 14);
  ctx.save();
  ctx.translate(0.5, 0.5);
  series.forEach((bar, index) => {
    const volume = bar.volume ?? 0;
    const height = (volume / maxVolume) * layout.volume.height;
    const x = left + index * step + (step - barWidth) / 2;
    const y = bottom - height;
    const isUp = (bar.close ?? 0) >= (bar.open ?? 0);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = isUp ? theme.volume.bullish : theme.volume.bearish;
    ctx.fillRect(x, y, barWidth, height);
  });
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = theme.volume.outline;
  ctx.strokeRect(left, top, width, bottom - top);
  ctx.restore();
}

function drawVolumeProfile(ctx, series, layout, theme, range) {
  if (!Array.isArray(series) || series.length === 0 || layout.profile.width <= 0) {
    return;
  }
  const buckets = Math.min(48, Math.max(12, Math.round(layout.price.height / 14)));
  const bucketSize = (range.max - range.min) / buckets || 1;
  const profile = Array.from({ length: buckets }, () => ({ total: 0, up: 0 }));
  series.forEach((bar) => {
    const typical = (bar.open + bar.high + bar.low + bar.close) / 4;
    const index = clamp(Math.floor((typical - range.min) / bucketSize), 0, buckets - 1);
    const bucket = profile[index];
    const volume = bar.volume ?? 0;
    bucket.total += volume;
    if ((bar.close ?? 0) >= (bar.open ?? 0)) {
      bucket.up += volume;
    }
  });
  const maxBucket = profile.reduce((max, bucket) => Math.max(max, bucket.total), 0) || 1;
  const { left, width, top, bottom } = layout.profile;
  ctx.save();
  ctx.translate(0.5, 0.5);
  profile.forEach((bucket, index) => {
    if (!bucket.total) {
      return;
    }
    const bucketTopValue = range.min + (index + 1) * bucketSize;
    const bucketBottomValue = range.min + index * bucketSize;
    const yTop = scaleToRange(bucketTopValue, range.min, range.max, top, bottom);
    const yBottom = scaleToRange(bucketBottomValue, range.min, range.max, top, bottom);
    const segmentHeight = Math.max(2, yBottom - yTop);
    const totalWidth = (bucket.total / maxBucket) * width;
    const bullishWidth = bucket.up ? (bucket.up / bucket.total) * totalWidth : totalWidth * 0.4;
    const bearishWidth = totalWidth - bullishWidth;
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = theme.volume.bullish;
    ctx.fillRect(left + width - bullishWidth, yTop, bullishWidth, segmentHeight);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = theme.volume.bearish;
    ctx.fillRect(left + width - totalWidth, yTop, bearishWidth, segmentHeight);
  });
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = theme.volume.outline;
  ctx.strokeRect(left, top, width, bottom - top);
  ctx.restore();
}

function drawCandles(ctx, series, layout, theme, preset, range, glowIntensity) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  const { left, width, top, bottom } = layout.price;
  const step = width / series.length;
  const bodyWidth = clamp(step * 0.72, 6, 22);
  ctx.save();
  ctx.translate(0.5, 0.5);
  series.forEach((bar, index) => {
    const x = left + index * step + step / 2;
    const yOpen = scaleToRange(bar.open, range.min, range.max, top, bottom);
    const yClose = scaleToRange(bar.close, range.min, range.max, top, bottom);
    const yHigh = scaleToRange(bar.high, range.min, range.max, top, bottom);
    const yLow = scaleToRange(bar.low, range.min, range.max, top, bottom);
    const isUp = (bar.close ?? 0) >= (bar.open ?? 0);
    const palette = isUp ? theme.bullish : theme.bearish;
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 14 * glowIntensity;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1.2, bodyWidth * 0.18);
    ctx.strokeStyle = palette.wick;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    ctx.shadowBlur = 20 * glowIntensity;
    if (preset.mode === "hollow") {
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = palette.body;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = palette.outline;
      ctx.strokeRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    } else {
      const gradient = ctx.createLinearGradient(x, bodyTop, x, bodyTop + bodyHeight);
      gradient.addColorStop(0, palette.body);
      gradient.addColorStop(1, palette.outline);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = palette.outline;
      ctx.strokeRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    }
    ctx.shadowBlur = 0;
  });

  const lastIndex = series.length - 1;
  if (lastIndex >= 0) {
    const bar = series[lastIndex];
    const x = left + lastIndex * step + step / 2;
    const yHigh = scaleToRange(bar.high, range.min, range.max, top, bottom);
    const yLow = scaleToRange(bar.low, range.min, range.max, top, bottom);
    ctx.shadowColor = theme.highlight;
    ctx.shadowBlur = 30 * glowIntensity;
    ctx.lineWidth = Math.max(2, bodyWidth * 0.35);
    ctx.strokeStyle = theme.highlight;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEmaLine(ctx, series, layout, theme, range, period = 9) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  const closes = series.map((bar) => bar.close ?? 0);
  const ema = [];
  const alpha = 2 / (period + 1);
  closes.forEach((price, index) => {
    if (index === 0) {
      ema.push(price);
    } else {
      ema.push(price * alpha + ema[index - 1] * (1 - alpha));
    }
  });
  const { left, width, top, bottom } = layout.price;
  const step = width / series.length;
  ctx.save();
  ctx.strokeStyle = theme.highlight;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.highlight;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ema.forEach((value, index) => {
    const x = left + index * step + step / 2;
    const y = scaleToRange(value, range.min, range.max, top, bottom);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawVwapLine(ctx, series, layout, theme, range) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  let cumulativePv = 0;
  let cumulativeVolume = 0;
  const values = [];
  series.forEach((bar) => {
    const volume = Math.max(1, bar.volume ?? 0);
    const typical = (bar.high + bar.low + bar.close + bar.open) / 4;
    cumulativePv += typical * volume;
    cumulativeVolume += volume;
    values.push(cumulativePv / cumulativeVolume);
  });
  const { left, width, top, bottom } = layout.price;
  const step = width / series.length;
  ctx.save();
  ctx.strokeStyle = theme.axis.text;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = left + index * step + step / 2;
    const y = scaleToRange(value, range.min, range.max, top, bottom);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawBaseline(ctx, layout, theme, range, value) {
  if (!Number.isFinite(value)) {
    return;
  }
  const y = scaleToRange(value, range.min, range.max, layout.price.top, layout.price.bottom);
  ctx.save();
  ctx.strokeStyle = theme.baseline;
  ctx.setLineDash([6, 10]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(layout.price.left, y);
  ctx.lineTo(layout.price.right, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawExtremes(ctx, series, layout, theme, range) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  const highest = series.reduce((acc, bar) => (bar.high > acc.high ? bar : acc), series[0]);
  const lowest = series.reduce((acc, bar) => (bar.low < acc.low ? bar : acc), series[0]);
  const highY = scaleToRange(highest.high, range.min, range.max, layout.price.top, layout.price.bottom);
  const lowY = scaleToRange(lowest.low, range.min, range.max, layout.price.top, layout.price.bottom);
  ctx.save();
  ctx.fillStyle = theme.highlight;
  ctx.globalAlpha = 0.18;
  ctx.fillRect(layout.price.left, highY - 10, layout.price.width, 20);
  ctx.fillRect(layout.price.left, lowY - 10, layout.price.width, 20);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.highlight;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(layout.price.left, highY);
  ctx.lineTo(layout.price.right, highY);
  ctx.moveTo(layout.price.left, lowY);
  ctx.lineTo(layout.price.right, lowY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawPriceScale(ctx, layout, theme, range) {
  const steps = 6;
  ctx.save();
  ctx.fillStyle = theme.axis.muted;
  ctx.font = "12px 'Inter', system-ui";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.strokeStyle = theme.axis.muted;
  for (let index = 0; index <= steps; index += 1) {
    const value = range.min + ((range.max - range.min) / steps) * index;
    const y = scaleToRange(value, range.min, range.max, layout.price.top, layout.price.bottom);
    ctx.beginPath();
    ctx.moveTo(layout.axis.left + 4, y);
    ctx.lineTo(layout.axis.left + 10, y);
    ctx.stroke();
    ctx.fillText(value.toFixed(2), layout.axis.left + 16, y);
  }
  ctx.restore();
}

function drawTimeAxis(ctx, series, layout, theme) {
  if (!Array.isArray(series) || series.length === 0) {
    return;
  }
  const axisY = layout.volume.height > 0 ? layout.volume.bottom + 24 : layout.price.bottom + 20;
  const { left, width } = layout.price;
  const step = Math.max(1, Math.round(series.length / 6));
  const stepWidth = width / series.length;
  ctx.save();
  ctx.fillStyle = theme.axis.muted;
  ctx.font = "12px 'Inter', system-ui";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.strokeStyle = theme.grid.minor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(left, axisY - 14);
  ctx.lineTo(left + width, axisY - 14);
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let index = 0; index < series.length; index += step) {
    const x = left + index * stepWidth + stepWidth / 2;
    ctx.fillText(series[index].time, x, axisY);
  }
  const last = series[series.length - 1];
  const xLast = left + (series.length - 0.5) * stepWidth;
  ctx.fillText(last.time, xLast, axisY);
  ctx.restore();
}

function drawLastPriceLabel(ctx, layout, theme, range, lastBar, referencePrice) {
  if (!lastBar) {
    return;
  }
  const value = lastBar.close ?? lastBar.price ?? 0;
  const reference = referencePrice ?? value;
  const y = scaleToRange(value, range.min, range.max, layout.price.top, layout.price.bottom);
  const isUp = value >= reference;
  const palette = isUp ? theme.bullish : theme.bearish;
  const labelWidth = layout.axis.width - 12;
  const labelHeight = 30;
  const x = layout.axis.left + 6;
  const top = clamp(y - labelHeight / 2, layout.axis.top + 4, layout.axis.bottom - labelHeight - 4);
  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 18;
  ctx.fillStyle = palette.outline;
  drawRoundedRect(ctx, x, top, labelWidth, labelHeight, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.axis.text;
  ctx.font = "13px 'Sora', 'Inter', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(value.toFixed(2), x + 12, top + labelHeight / 2 - 5);
  ctx.fillStyle = theme.axis.muted;
  ctx.font = "10px 'Inter', sans-serif";
  const diff = value - reference;
  const diffPercent = reference ? (diff / reference) * 100 : 0;
  const annotation = `${diff >= 0 ? "+" : "-"}${Math.abs(diff).toFixed(2)} · ${diffPercent >= 0 ? "+" : "-"}${Math.abs(diffPercent).toFixed(2)}%`;
  ctx.fillText(annotation, x + 12, top + labelHeight / 2 + 8);
  ctx.restore();
}

export function renderChart(
  canvas,
  series,
  {
    theme: themeKey = "nocturne",
    candleStyle = "lumina",
    gridDensity = "balanced",
    glowIntensity = 0.55,
    overlays = {},
    extras = {},
    padding = 0.015
  } = {}
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const baseSeries = Array.isArray(series) ? series : [];
  if (baseSeries.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const theme = CHART_THEMES[themeKey] ?? CHART_THEMES.nocturne;
  const preset = CANDLE_PRESETS[candleStyle] ?? CANDLE_PRESETS.lumina;
  const overlayConfig = {
    ema: false,
    vwap: false,
    volumeProfile: false,
    ...overlays
  };
  const extrasConfig = {
    showSessions: true,
    showBaseline: true,
    showVolume: true,
    highlightExtremes: true,
    ...extras
  };
  const haloIntensity = clamp(glowIntensity, 0, 1);

  const transformedSeries = preset.transform
    ? preset.transform(baseSeries).map((bar, index) => ({ ...baseSeries[index], ...bar }))
    : baseSeries.map((bar) => ({ ...bar }));

  const priceRange = computePriceRange(transformedSeries, padding);
  const layout = computeLayout(canvas.width, canvas.height, {
    showVolume: extrasConfig.showVolume,
    includeProfile: overlayConfig.volumeProfile
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, canvas.width, canvas.height, theme, haloIntensity);
  drawSessionBands(ctx, transformedSeries, layout, theme, extrasConfig.showSessions);
  drawGrid(ctx, layout, theme, gridDensity);
  if (overlayConfig.volumeProfile) {
    drawVolumeProfile(ctx, transformedSeries, layout, theme, priceRange);
  }
  drawAxisPanel(ctx, layout, theme);
  if (extrasConfig.showVolume) {
    drawVolumeBars(ctx, transformedSeries, layout, theme);
  }
  drawCandles(ctx, transformedSeries, layout, theme, preset, priceRange, haloIntensity);
  if (extrasConfig.highlightExtremes) {
    drawExtremes(ctx, transformedSeries, layout, theme, priceRange);
  }
  if (overlayConfig.ema) {
    drawEmaLine(ctx, transformedSeries, layout, theme, priceRange);
  }
  if (overlayConfig.vwap) {
    drawVwapLine(ctx, transformedSeries, layout, theme, priceRange);
  }
  if (extrasConfig.showBaseline) {
    const baselineValue =
      transformedSeries.length > 1
        ? transformedSeries[transformedSeries.length - 2].close
        : transformedSeries[0]?.close;
    if (baselineValue) {
      drawBaseline(ctx, layout, theme, priceRange, baselineValue);
    }
  }
  const lastBar = transformedSeries[transformedSeries.length - 1];
  const previous = transformedSeries[transformedSeries.length - 2] ?? lastBar;
  drawLastPriceLabel(ctx, layout, theme, priceRange, lastBar, previous?.close ?? lastBar?.open ?? 0);
  drawPriceScale(ctx, layout, theme, priceRange);
  drawTimeAxis(ctx, transformedSeries, layout, theme);
}

export function buildSeriesForMode(series, mode, aggregation) {
  if (mode === "time") {
    return resampleTimeSeries(series, aggregation);
  }
  return generateSyntheticSeries(series, aggregation, mode);
}
