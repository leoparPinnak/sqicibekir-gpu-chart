import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Clean Top Navbar: Remove hardcoded strategy selector and replace with "fx İndikatörler" button
const oldNavbarMiddle = `                <!--  5 GELİŞMİŞ QUANT STRATEJİ SEÇİCİ -->
                <div class="strategy-selector-group">
                    <span class="strat-label">STRATEJİ:</span>
                    <button class="strat-btn active highlight-btc" id="strat-btn-4" onclick="setStrategy(4)" title=" Quant Optimizasyon Şampiyonu: BUY1 (2.2/2.2x), BUY2 Trend (1.4/4.0x R:R 1:2.85), SELL (1.2/2.5x)">
                        4. Asimetrik Pro (+14.0%)
                    </button>
                    <button class="strat-btn" id="strat-btn-2" onclick="setStrategy(2)" title="Quant MAE: Volatilite Sıkışmada 2.5x SL / Patlamada 3.2x TP">
                        2. Quant MAE (+9.5%)
                    </button>
                    <button class="strat-btn" id="strat-btn-3" onclick="setStrategy(3)" title="Trailing Stop: +0.8 ATR Erken Breakeven & %78.8 Kazanma Oranı">
                        3. Trailing BE (78.8% Win)
                    </button>
                    <button class="strat-btn" id="strat-btn-1" onclick="setStrategy(1)" title="Piyasa Yapısı: Son 10 mum Swing Low + Kijun + Bulut Tabanı + 0.4 ATR Tampon">
                        1. Yapısal SL
                    </button>
                    <button class="strat-btn" id="strat-btn-0" onclick="setStrategy(0)" title="Klasik Sabit 1:1.67 R:R (1.5x ATR SL, 2.5x ATR TP)">
                        0. Sabit 1:1.67
                    </button>
                </div>`;

const newNavbarMiddle = `                <!-- 📊 İNDİKATÖRLER VE GÖSTERGELER BUTONU (TradingView Standard fx) -->
                <div class="fx-indicator-btn-group">
                    <button class="ind-btn active-fx" id="btn-open-indicators" onclick="openIndicatorModal()" title="İndikatör Ekle / Yönet (RSI, MACD, Bollinger, EMA, vb.)" style="background: rgba(56, 189, 248, 0.15); border-color: #38bdf8; color: #38bdf8; font-weight: 700; gap: 6px;">
                        <svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor"><path d="M11 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2h-9v3.1a6.5 6.5 0 0 1 2.37 1.83l.07.07h6.56a1 1 0 1 1 0 2h-5.26a6.5 6.5 0 0 1-.74 4H21a1 1 0 1 1 0 2h-6.2a6.5 6.5 0 0 1-5.8 4H5a1 1 0 1 1 0-2h3.1a6.5 6.5 0 0 1 2.37-1.83l.07-.07H4a1 1 0 1 1 0-2h5.26a6.5 6.5 0 0 1 .74-4H4a1 1 0 1 1 0-2h6.2a6.5 6.5 0 0 1 5.8-4H11V6Z"></path></svg>
                        <b>Göstergeler (fx)</b>
                    </button>
                </div>`;

content = content.replace(oldNavbarMiddle, newNavbarMiddle);

// 2. Remove old indicator-nav layer buttons from top-right
const oldIndicatorNav = `            <!-- İndikatör Katmanları & Backtest & OttOnline Butonu -->
            <div class="indicator-nav">
                <button class="ind-btn active" id="btn-cloud" onclick="toggleLayer('cloud')">
                    <span class="ind-dot" style="background: #10b981;"></span> Bulut
                </button>
                <button class="ind-btn active" id="btn-ema" onclick="toggleLayer('ema')">
                    <span class="ind-dot" style="background: #f97316;"></span> EMA
                </button>
                <button class="ind-btn active" id="btn-signals" onclick="toggleLayer('signals')">
                    <span class="ind-dot" style="background: #fbbf24;"></span> Sinyaller
                </button>

                <!-- Backtest Butonu -->
                <button class="backtest-btn" id="btn-backtest" onclick="toggleBacktestMode()" title="Backtest Modunu Aç / Kapat">
                    Backtest
                </button>

                <button class="ind-btn active" id="btn-bg" onclick="toggleLayer('bg')">
                    <span class="ind-dot" style="background: #a855f7;"></span> Rejim
                </button>
            </div>`;

const newIndicatorNav = `            <div class="indicator-nav">
                <!-- Temiz Sade Araç Çubuğu -->
            </div>`;

content = content.replace(oldIndicatorNav, newIndicatorNav);

// 3. Remove hardcoded HUD regime/ema/trend badges from chart overlay
const oldHudOverlay = `                            <div class="hud-badge-row">
                                <span>1D HTF REJİM: <span id="hud-regime" class="hud-tag tag-bull">BOĞA (YEŞİL)</span></span>
                                <span>CANLI 4H EMA26: <span id="hud-ema" class="hud-tag tag-bull">ÜSTÜNDE</span></span>
                                <span>ANA YÖN (Pine v6): <span id="hud-trend" class="hud-tag tag-bull">GÜÇLÜ BOĞA</span></span>
                                <span>MUM BİLGİSİ: <span id="hud-candle-info" class="hud-tag" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-weight: 700;">Görünen: 150 / Toplam: 3.000</span></span>
                            </div>`;

const newHudOverlay = `                            <div class="hud-badge-row">
                                <span>MUM BİLGİSİ: <span id="hud-candle-info" class="hud-tag" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-weight: 700;">Görünen: 150 / Toplam: 3.000</span></span>
                            </div>`;

content = content.replace(oldHudOverlay, newHudOverlay);

// 4. Remove active-strat-footer text
content = content.replace(
    /<span id="active-strat-footer">[\s\S]*?<\/span>/,
    `<span id="active-strat-footer" style="color: #64748b;">TradeChart Pro Engine // v2.0 Modular</span>`
);

// 5. Expand Velocity Threshold Slider Range up to 15.00 px/ms with presets
content = content.replace(
    /<input type="range" id="velocity-threshold-slider" min="0\.10" max="3\.50" step="0\.05" value="0\.80"/,
    `<input type="range" id="velocity-threshold-slider" min="0.10" max="15.00" step="0.10" value="1.50"`
);

content = content.replace(
    /<div class="preset-row">[\s\S]*?<\/div>/,
    `<div class="preset-row">
                            <button class="preset-btn" onclick="setThresholdPreset(0.40)">Hassas (0.4)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(1.50)">Dengeli (1.5)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(4.00)">Hızlı (4.0)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(8.00)">Çok Katı (8.0)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(99.00)">Kapalı</button>
                        </div>`
);

// 6. Set default layers to clean candlestick mode (cloud: 0, ema: 0, bg: 0, signals: 0)
content = content.replace(
    /const layers = \{ cloud: 1, ema: 1, signals: 1, bg: 1 \};/,
    `const layers = { cloud: 0, ema: 0, signals: 0, bg: 0 };`
);

// 7. Update initial velocity threshold to 1.50 px/ms default
content = content.replace(
    /let velocityThreshold = parseFloat\(localStorage\.getItem\('tradechart_velocity_threshold'\)\) \|\| 0\.80;/,
    `let velocityThreshold = parseFloat(localStorage.getItem('tradechart_velocity_threshold')) || 1.50;`
);

// 8. Add placeholder openIndicatorModal function
const modalFunc = `
        window.openIndicatorModal = function() {
            alert('📊 İndikatör ve Göstergeler Modülü hazırlanıyor! Çok yakında RSI, MACD, Bollinger, EMA ve Özel Kod Editörü eklenecek.');
        };
`;
content = content.replace('window.toggleVelocitySettings = function', modalFunc + '\n        window.toggleVelocitySettings = function');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cleaned up hardcoded indicators & strategies, expanded velocity threshold up to 15.00 px/ms, and added fx Indicators button!');
