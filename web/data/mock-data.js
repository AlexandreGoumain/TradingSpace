export const mockPriceSeries = [
  { time: "09:30", open: 4520.25, high: 4524.0, low: 4518.75, close: 4523.5, volume: 1320 },
  { time: "09:35", open: 4523.5, high: 4526.75, low: 4521.0, close: 4525.75, volume: 1480 },
  { time: "09:40", open: 4525.75, high: 4528.0, low: 4523.5, close: 4527.25, volume: 1610 },
  { time: "09:45", open: 4527.25, high: 4531.0, low: 4524.0, close: 4529.0, volume: 1840 },
  { time: "09:50", open: 4529.0, high: 4534.5, low: 4527.75, close: 4533.0, volume: 1995 },
  { time: "09:55", open: 4533.0, high: 4536.0, low: 4529.5, close: 4531.25, volume: 1730 },
  { time: "10:00", open: 4531.25, high: 4534.25, low: 4528.0, close: 4529.5, volume: 1650 },
  { time: "10:05", open: 4529.5, high: 4532.75, low: 4525.25, close: 4527.0, volume: 1785 },
  { time: "10:10", open: 4527.0, high: 4529.75, low: 4522.75, close: 4524.25, volume: 1890 },
  { time: "10:15", open: 4524.25, high: 4526.5, low: 4519.5, close: 4521.5, volume: 2105 },
  { time: "10:20", open: 4521.5, high: 4524.75, low: 4517.25, close: 4523.25, volume: 1980 },
  { time: "10:25", open: 4523.25, high: 4527.5, low: 4521.5, close: 4526.75, volume: 1750 },
  { time: "10:30", open: 4526.75, high: 4530.0, low: 4523.5, close: 4528.0, volume: 1690 },
  { time: "10:35", open: 4528.0, high: 4532.25, low: 4524.75, close: 4531.5, volume: 1820 },
  { time: "10:40", open: 4531.5, high: 4535.5, low: 4529.25, close: 4534.75, volume: 2040 },
  { time: "10:45", open: 4534.75, high: 4537.0, low: 4531.5, close: 4536.0, volume: 1985 }
];

export const mockOrderBook = {
  bids: [
    { price: 4535.75, size: 48, cumulative: 48 },
    { price: 4535.5, size: 62, cumulative: 110 },
    { price: 4535.25, size: 75, cumulative: 185 },
    { price: 4535.0, size: 84, cumulative: 269 },
    { price: 4534.75, size: 91, cumulative: 360 },
    { price: 4534.5, size: 104, cumulative: 464 },
    { price: 4534.25, size: 112, cumulative: 576 },
    { price: 4534.0, size: 123, cumulative: 699 },
    { price: 4533.75, size: 118, cumulative: 817 },
    { price: 4533.5, size: 96, cumulative: 913 }
  ],
  asks: [
    { price: 4536.25, size: 88, cumulative: 88 },
    { price: 4536.5, size: 105, cumulative: 193 },
    { price: 4536.75, size: 128, cumulative: 321 },
    { price: 4537.0, size: 142, cumulative: 463 },
    { price: 4537.25, size: 155, cumulative: 618 },
    { price: 4537.5, size: 172, cumulative: 790 },
    { price: 4537.75, size: 168, cumulative: 958 },
    { price: 4538.0, size: 141, cumulative: 1099 },
    { price: 4538.25, size: 124, cumulative: 1223 },
    { price: 4538.5, size: 110, cumulative: 1333 }
  ]
};

export const mockTrades = [
  { time: "10:46:12", price: 4536.25, size: 14, aggressor: "Acheteur" },
  { time: "10:45:58", price: 4536.0, size: 22, aggressor: "Vendeur" },
  { time: "10:45:41", price: 4535.75, size: 7, aggressor: "Acheteur" },
  { time: "10:45:25", price: 4535.5, size: 19, aggressor: "Vendeur" },
  { time: "10:45:14", price: 4535.5, size: 11, aggressor: "Acheteur" },
  { time: "10:45:07", price: 4535.25, size: 17, aggressor: "Acheteur" },
  { time: "10:44:51", price: 4535.0, size: 31, aggressor: "Vendeur" },
  { time: "10:44:36", price: 4534.75, size: 26, aggressor: "Vendeur" }
];

export const mockMetrics = [
  { label: "Volume cumulé", value: "18,6k", hint: "+6% vs moyenne" },
  { label: "Delta net", value: "+425", hint: "Flux agressif acheteur" },
  { label: "Volatilité (15m)", value: "0,82%", hint: "En hausse" },
  { label: "VWAP", value: "4 532,15", hint: "Proche prix" },
  { label: "Liquidité top 5", value: "1 420 contrats", hint: "Stable" }
];

export const mockAlerts = [
  { label: "Breakout range Asia", status: "Prêt", level: "4 538,50" },
  { label: "Delta > +600", status: "Armée", level: "Flux acheteur" },
  { label: "Volume anormal", status: "Surveillance", level: "x1,8" }
];
