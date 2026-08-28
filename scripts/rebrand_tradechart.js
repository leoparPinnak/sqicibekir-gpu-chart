import fs from 'fs';

// 1. Update indikator_sablonu.html
let html = fs.readFileSync('indikator_sablonu.html', 'utf8');

html = html.replace(
    /<title>SqiciBekiRBindikatöR \/\/ Quant Optimizasyon & Strateji Laboratuvarı<\/title>/,
    '<title>TradeChart Pro // Multi-Timeframe GPU Trading Terminal</title>'
);

html = html.replace(
    /<span class="indicator-badge">SQICIBEKIR TERMINAL<\/span>/,
    '<span class="indicator-badge">TRADECHART PRO</span>'
);

html = html.replace(
    /\/\/ SQICIBEKIRBINDIKATÖR: ÇOKLU STRATEJİLİ HESAPLAMA MOTORU/g,
    '// TRADECHART PRO: MULTI-STRATEGY QUANT CALCULATION ENGINE'
);

html = html.replace(
    /calculateSqiciBekiR_MultiStrategy/g,
    'calculateTradeChart_MultiStrategy'
);

fs.writeFileSync('indikator_sablonu.html', html, 'utf8');

// 2. Update package.json
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = 'tradechart-pro';
pkg.description = 'TradeChart Pro - Next-Generation Multi-Timeframe WebGL 2.0 Trading Terminal';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');

// 3. Update README.md
const readmeContent = `# 🚀 TradeChart Pro // Multi-Timeframe GPU Trading Terminal

**TradeChart Pro** is a high-performance, WebGL 2.0 hardware-accelerated financial charting workstation and quantitative strategy testing environment.

---

### ✨ Key Features

* **⚡ GPU-Accelerated 120 FPS Rendering:** Native WebGL 2.0 shaders for instantaneous multi-thousand candle rendering, dynamic Ichimoku cloud plasma fields, and zero-latency interaction.
* **⏱️ Multi-Timeframe Synchronized Engine (MTF):** Seamlessly analyzes live candlestick data across 1m, 3m, 5m, 15m, 1h, and 4h timeframes with higher-timeframe EMA and Ichimoku regime confirmation.
* **🤖 5 Quant & ML Strategy Modes:**
  * \`4. Asimetrik Pro (+14.0%)\` - Dynamic Quant Asymmetric Risk:Reward Model
  * \`3. Trailing BE (78.8% Win)\` - Stepped Trailing Stop & Early Breakeven Protection
  * \`2. Quant MAE (+9.5%)\` - Maximum Adverse Excursion Volatility Optimizer
  * \`1. Yapısal SL\` - Market Structure & Swing Price Action Stop-Loss
  * \`0. Sabit 1:1.67\` - Benchmark Fixed 1:1.67 R:R Strategy
* **🛠️ Complete TradingView-Style Drawing Suite (80+ Tools):**
  * Trend Lines, Rays, Channels, Pitchforks, Gann & Fibonacci Retracements
  * Geometric Shapes (Boxes, Ellipses, Paths, Triangles, Polylines, Brushes)
  * Annotation & Callouts, Formations & Elliott Waves
  * Long/Short Position Risk/Reward Visualizers & Precision Measurement Tools
  * Interactive Draggable Floating Favorite Toolbar & Real-time Property Bar
* **🌸 Organic Logarithmic Bloom Animation:** Smooth startup expansion from a zero-height center laser line upon data loading.
* **🛡️ Viewport Boundary Isolation & Native Magnet Snapping:** Precision OHLC candle snapping with clean viewport clipping.

---

### 🚀 Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start Vite Development Server
npm run dev

# Build Production Bundle
npm run build
\`\`\`

---

### 📄 License
MIT License - Built for high-frequency algorithmic traders and financial analysts.
`;

fs.writeFileSync('README.md', readmeContent, 'utf8');
console.log('Project successfully rebranded to TradeChart Pro!');
