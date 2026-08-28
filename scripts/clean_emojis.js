import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Replace Top Navbar HTML
content = content.replace(
    /<span class="indicator-badge">⚡ SqiciBekiR<\/span>/g,
    '<span class="indicator-badge">SQICIBEKIR TERMINAL</span>'
);

content = content.replace(/title="⚡ 1-Dakika Scalping: 1m Mumlar \+ 5m EMA26 \+ 1H Rejim">⚡ 1m<\/button>/g, 'title="1-Dakika Scalping: 1m Mumlar + 5m EMA26 + 1H Rejim">1m</button>');
content = content.replace(/title="🔥 3-Dakika Turbo Day Trade: 3m Mumlar \+ 15m EMA26 \+ 1H Rejim">🔥 3m<\/button>/g, 'title="3-Dakika Day Trade: 3m Mumlar + 15m EMA26 + 1H Rejim">3m</button>');
content = content.replace(/title="🚀 5-Dakika Hızlı Trade: 5m Mumlar \+ 15m EMA26 \+ 4H Rejim">🚀 5m<\/button>/g, 'title="5-Dakika Trade: 5m Mumlar + 15m EMA26 + 4H Rejim">5m</button>');
content = content.replace(/title="🎯 15-Dakika Swing Day Trade: 15m Mumlar \+ 1H EMA26 \+ 1D Rejim">🎯 15m<\/button>/g, 'title="15-Dakika Swing Trade: 15m Mumlar + 1H EMA26 + 1D Rejim">15m</button>');
content = content.replace(/title="📊 1-Saat Orijinal Pine v6 Swing: 1H Mumlar \+ 4H EMA26 \+ 1D Rejim">📊 1h<\/button>/g, 'title="1-Saat Orijinal Pine v6 Swing: 1H Mumlar + 4H EMA26 + 1D Rejim">1h</button>');
content = content.replace(/title="🏛️ 4-Saat Trend Takibi: 4H Mumlar \+ 1D EMA26 \+ 1W Rejim">🏛️ 4h<\/button>/g, 'title="4-Saat Trend Takibi: 4H Mumlar + 1D EMA26 + 1W Rejim">4h</button>');

// Strategy group label and buttons
content = content.replace(/<span class="strat-label">🧠 LAB:<\/span>/g, '<span class="strat-label">STRATEJİ:</span>');
content = content.replace(/🔥 4\. Asimetrik Pro \(\+%14 Kâr\)/g, '4. Asimetrik Pro (+14.0%)');
content = content.replace(/🤖 2\. Quant MAE \(\+%9\.5\)/g, '2. Quant MAE (+9.5%)');
content = content.replace(/🔄 3\. Trailing BE \(%78\.8 Win\)/g, '3. Trailing BE (78.8% Win)');
content = content.replace(/🏛️ 1\. Yapısal SL/g, '1. Yapısal SL');
content = content.replace(/📐 0\. Sabit 1\.67/g, '0. Sabit 1:1.67');

// Layer buttons
content = content.replace(/<span style="color: #10b981;">☁️<\/span> Bulut/g, '<span class="ind-dot" style="background: #10b981;"></span> Bulut');
content = content.replace(/<span style="color: #f97316;">⚡<\/span> EMA/g, '<span class="ind-dot" style="background: #f97316;"></span> EMA');
content = content.replace(/<span style="color: #fbbf24;">🎯<\/span> Sinyal/g, '<span class="ind-dot" style="background: #fbbf24;"></span> Sinyaller');
content = content.replace(/🎆 Backtest/g, 'Backtest');
content = content.replace(/<span>🌌<\/span> Rejim/g, '<span class="ind-dot" style="background: #a855f7;"></span> Rejim');

// Property bar trash button
content = content.replace(
    /<button class="tv-prop-btn delete" onclick="deleteSelectedDrawing\(\)" title="Çizimi Sil">🗑️<\/button>/g,
    '<button class="tv-prop-btn delete" onclick="deleteSelectedDrawing()" title="Çizimi Sil"><svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor"><path d="M18 7h5v1h-2l-1.3 14.6a1.5 1.5 0 0 1-1.5 1.4H9.8a1.5 1.5 0 0 1-1.5-1.4L7 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4Z"></path></svg></button>'
);

// HUD overlay tags
content = content.replace(/GÜÇLÜ BOĞA 🚀/g, 'GÜÇLÜ BOĞA');
content = content.replace(/GÜÇLÜ AYI 🔻/g, 'GÜÇLÜ AYI');
content = content.replace(/🔥 4\. ASİMETRİK PRO/g, '4. ASİMETRİK PRO');
content = content.replace(/🎯 <b id="vbt-tp-count" style="color: #10b981;">0<\/b> \| ❌ <b id="vbt-sl-count" style="color: #ef4444;">0<\/b> \| ⌛ <b id="vbt-open-count" style="color: #38bdf8;">0<\/b>/g, 'Kazanma: <b id="vbt-tp-count" style="color: #10b981;">0</b> | Stop: <b id="vbt-sl-count" style="color: #ef4444;">0</b> | Açık: <b id="vbt-open-count" style="color: #38bdf8;">0</b>');
content = content.replace(/💰 <b>\$1\.000<\/b> İle Sırayla All-In Girilseydi:/g, 'Portföy Simülasyonu ($1,000 Giriş):');

// Signal Inspector
content = content.replace(/⚡ SİNYAL: --/g, 'SİNYAL: --');
content = content.replace(/🏆 BACKTEST: TP BAŞARILI!/g, 'BACKTEST: TP BAŞARILI');
content = content.replace(/🎯 TP: \$0\.00/g, 'TP: $0.00');
content = content.replace(/🛡️ SL: \$0\.00/g, 'SL: $0.00');

// Corner Reset & Bottom Status Bar
content = content.replace(/OTO 🔄/g, 'OTO');
content = content.replace(/🚀 GPU \(WebGL 2\.0\)/g, 'GPU (WebGL 2.0)');
content = content.replace(/⚡ Hibrit Turbo 2D \(Tablet Uyumlu\)/g, 'Turbo 2D (Tablet)');
content = content.replace(/🔍 TÜMÜNÜ GÖR/g, 'SIĞDIR');

// JavaScript functions
content = content.replace(/🔥 1M ASİMETRİK SCALP PRO \(BUY2: 1\.5\/3\.0x %63\.6 Win \| SELL: 1\.5\/3\.0x\)/g, '1M ASİMETRİK SCALP PRO (BUY2: 1.5/3.0x %63.6 Win | SELL: 1.5/3.0x)');
content = content.replace(/🔄 1M MICRO-BREAKEVEN \(%70\.5 KAZANMA ORANI \| \+0\.6 ATR BE & SWING 8\)/g, '1M MICRO-BREAKEVEN (%70.5 Kazanma Oranı | +0.6 ATR BE & Swing 8)');
content = content.replace(/⚡ 1M SERİ HIZLI SCALP \(1\.5x SL \/ 2\.0x TP \| DAKİKALIK KAPANIŞ\)/g, '1M HIZLI SCALP (1.5x SL / 2.0x TP | Dakikalık Kapanış)');
content = content.replace(/🏛️ 1M MİKRO-YAPISAL SL \(SON 5 BAR SWING \+ 0\.2x ATR TAMPON\)/g, '1M MİKRO-YAPISAL SL (Son 5 Bar Swing + 0.2x ATR Tampon)');
content = content.replace(/📐 1M KLASİK SABİT SCALP \(1\.2x SL \/ 1\.8x TP\)/g, '1M KLASİK SABİT SCALP (1.2x SL / 1.8x TP)');
content = content.replace(/⚡ 1M SCALP STRATEJİSİ/g, '1M SCALP STRATEJİSİ');

content = content.replace(/🔥 1H ASİMETRİK PRO \(BUY1: 2\.2x, BUY2 TREND: 4\.0x R:R 1:2\.85, SELL: 2\.5x\)/g, '1H ASİMETRİK PRO (BUY1: 2.2x, BUY2: 4.0x R:R 1:2.85, SELL: 2.5x)');
content = content.replace(/🔄 1H TRAILING STOP \(\+0\.8 ATR BREAKEVEN & %78\.8 KAZANMA ORANI\)/g, '1H TRAILING STOP (+0.8 ATR Breakeven & %78.8 Kazanma Oranı)');
content = content.replace(/🤖 1H QUANT MAE \(DİNAMİK VOLATİLİTE: 1\.2x-2\.5x SL \/ 2\.0x-3\.2x TP\)/g, '1H QUANT MAE (Dinamik Volatilite: 1.2x-2.5x SL / 2.0x-3.2x TP)');
content = content.replace(/🏛️ 1H YAPISAL SL \(SWING LOW\/HIGH \+ KIJUN \+ BULUT TABANI \+ 0\.4 ATR\)/g, '1H YAPISAL SL (Swing Low/High + Kijun + Bulut Tabanı + 0.4 ATR)');
content = content.replace(/📐 1H KLASİK SABİT 1:1\.67 R:R \(1\.5x SL \/ 2\.5x TP\)/g, '1H KLASİK SABİT 1:1.67 R:R (1.5x SL / 2.5x TP)');
content = content.replace(/📊 1H SWING STRATEJİSİ/g, '1H SWING STRATEJİSİ');

content = content.replace(/Aktif: <b>⚡ 4\. 1M Asimetrik Scalp \(BUY2: 1\.5x SL \/ 3\.0x TP %63\.6 Win 🚀, SELL: 1\.5x SL \/ 3\.0x TP\)<\/b>/g, 'Aktif: <b>4. 1M Asimetrik Scalp (BUY2: 1.5x SL / 3.0x TP %63.6 Win, SELL: 1.5x SL / 3.0x TP)</b>');
content = content.replace(/Aktif: <b>🔄 3\. 1M Micro-BE \(%70\.5 Win Rate \| \+0\.6 ATR Erken Breakeven\)<\/b>/g, 'Aktif: <b>3. 1M Micro-BE (%70.5 Win Rate | +0.6 ATR Erken Breakeven)</b>');
content = content.replace(/Aktif: <b>⚡ 2\. 1M Hızlı Scalp \(1\.5x SL \/ 2\.0x TP R:R 1:1\.33\)<\/b>/g, 'Aktif: <b>2. 1M Hızlı Scalp (1.5x SL / 2.0x TP R:R 1:1.33)</b>');
content = content.replace(/Aktif: <b>🏛️ 1\. 1M Mikro-Yapısal \(Son 5 Bar Swing \+ 0\.2x ATR\)<\/b>/g, 'Aktif: <b>1. 1M Mikro-Yapısal (Son 5 Bar Swing + 0.2x ATR)</b>');
content = content.replace(/Aktif: <b>📐 0\. 1M Sabit Scalp \(1\.2x SL \/ 1\.8x TP\)<\/b>/g, 'Aktif: <b>0. 1M Sabit Scalp (1.2x SL / 1.8x TP)</b>');

content = content.replace(/Aktif: <b>🔥 4\. 1H Asimetrik Pro \(BUY1: 2\.2x, BUY2: 1\.4\/4\.0x R:R 1:2\.85, SELL: 1\.2\/2\.5x\)<\/b>/g, 'Aktif: <b>4. 1H Asimetrik Pro (BUY1: 2.2x, BUY2: 1.4/4.0x R:R 1:2.85, SELL: 1.2/2.5x)</b>');
content = content.replace(/Aktif: <b>🔄 3\. 1H Trailing BE \(\+0\.8 ATR Erken Breakeven & %78\.8 Win Rate\)<\/b>/g, 'Aktif: <b>3. 1H Trailing BE (+0.8 ATR Erken Breakeven & %78.8 Win Rate)</b>');
content = content.replace(/Aktif: <b>🤖 2\. 1H Quant MAE \(Sıkışmada 2\.5x SL \/ Patlamada 3\.2x TP\)<\/b>/g, 'Aktif: <b>2. 1H Quant MAE (Sıkışmada 2.5x SL / Patlamada 3.2x TP)</b>');
content = content.replace(/Aktif: <b>🏛️ 1\. 1H Yapısal SL \(Swing 10 \+ Kijun \+ Bulut \+ 0\.4 ATR Tampon\)<\/b>/g, 'Aktif: <b>1. 1H Yapısal SL (Swing 10 + Kijun + Bulut + 0.4 ATR Tampon)</b>');
content = content.replace(/Aktif: <b>📐 0\. 1H Sabit 1\.67 \(1\.5x ATR SL \/ 2\.5x ATR TP\)<\/b>/g, 'Aktif: <b>0. 1H Sabit 1.67 (1.5x ATR SL / 2.5x ATR TP)</b>');

content = content.replace(/btn4\.innerHTML = '🔥 4\. 1M Asimetrik Scalp'/g, "btn4.innerHTML = '4. 1M Asimetrik Scalp'");
content = content.replace(/btn3\.innerHTML = '🔄 3\. 1M Micro-BE \(%70\.5 Win\)'/g, "btn3.innerHTML = '3. 1M Micro-BE (%70.5 Win)'");
content = content.replace(/btn2\.innerHTML = '⚡ 2\. 1M Hızlı Scalp'/g, "btn2.innerHTML = '2. 1M Hızlı Scalp'");
content = content.replace(/btn1\.innerHTML = '🏛️ 1\. 1M Mikro-Yapısal'/g, "btn1.innerHTML = '1. 1M Mikro-Yapısal'");
content = content.replace(/btn0\.innerHTML = '📐 0\. 1M Sabit Scalp'/g, "btn0.innerHTML = '0. 1M Sabit Scalp'");

content = content.replace(/btn4\.innerHTML = '🔥 4\. Asimetrik Pro \(\+%14 Kâr\)'/g, "btn4.innerHTML = '4. Asimetrik Pro (+14.0%)'");
content = content.replace(/btn3\.innerHTML = '🔄 3\. Trailing BE \(%78\.8 Win\)'/g, "btn3.innerHTML = '3. Trailing BE (78.8% Win)'");
content = content.replace(/btn2\.innerHTML = '🤖 2\. Quant MAE \(\+%9\.5\)'/g, "btn2.innerHTML = '2. Quant MAE (+9.5%)'");
content = content.replace(/btn1\.innerHTML = '🏛️ 1\. Yapısal SL'/g, "btn1.innerHTML = '1. Yapısal SL'");
content = content.replace(/btn0\.innerHTML = '📐 0\. Sabit 1\.67'/g, "btn0.innerHTML = '0. Sabit 1:1.67'");

content = content.replace(/btn\.innerText = isBacktestActive \? '🎆 Backtest: AÇIK' : '📊 Backtest Modu';/g, "btn.innerText = isBacktestActive ? 'Backtest: AÇIK' : 'Backtest Modu';");

// Clean Timeframe labels
content = content.replace(/label: '⚡ 1m Scalp Pro'/g, "label: '1m Scalp Pro'");
content = content.replace(/label: '🔥 3m Turbo Trade'/g, "label: '3m Turbo Trade'");
content = content.replace(/label: '🚀 5m Day Trade'/g, "label: '5m Day Trade'");
content = content.replace(/label: '🎯 15m Short Swing'/g, "label: '15m Short Swing'");
content = content.replace(/label: '📊 1h Swing \(Pine v6\)'/g, "label: '1h Swing (Pine v6)'");
content = content.replace(/label: '🏛️ 4h Macro Trend'/g, "label: '4h Macro Trend'");

content = content.replace(/extraInfo = `1M BUY2 Trend: 1\.5x SL \/ 3\.0x TP \(%63\.6 Win 🚀\)`/g, "extraInfo = `1M BUY2 Trend: 1.5x SL / 3.0x TP (%63.6 Win)`");
content = content.replace(/extraInfo = `1M SELL: 1\.5x SL \/ 3\.0x TP \(\+%1\.48 Kâr 🔻\)`/g, "extraInfo = `1M SELL: 1.5x SL / 3.0x TP (+%1.48 Kâr)`");
content = content.replace(/extraInfo = `BUY2 Trend: 1\.4x SL \/ 4\.0x TP \(R:R 1:2\.85 🚀\)`/g, "extraInfo = `BUY2 Trend: 1.4x SL / 4.0x TP (R:R 1:2.85)`");
content = content.replace(/extraInfo = `SELL Trend: 1\.2x SL \/ 2\.5x TP \(R:R 1:2\.08 🔻\)`/g, "extraInfo = `SELL Trend: 1.2x SL / 2.5x TP (R:R 1:2.08)`");
content = content.replace(/extraInfo = `1M Micro-BE: \+0\.6 ATR Erken Breakeven \(%70\.5 Win 🏆\)`/g, "extraInfo = `1M Micro-BE: +0.6 ATR Erken Breakeven (%70.5 Win)`");

// Canvas Signals: Replace emojis in canvas rendering
content = content.replace(/if \(isBacktestActive && isTpWin\) text \+= ' 🏆 TP';/g, "if (isBacktestActive && isTpWin) text += ' [TP]';");

// Remove canvas emoji rendering for TP and SL
content = content.replace(/ctx2d\.fillText\('🎯', screenX, tpEmojiY\);/g, `
                    // Vector TP Indicator Tag
                    ctx2d.font = 'bold 9px "SF Pro Text", "Segoe UI", sans-serif';
                    ctx2d.fillStyle = '#38bdf8';
                    ctx2d.fillText('TP', screenX, tpEmojiY);
`);

content = content.replace(/ctx2d\.fillText\('🛡️', screenX, slEmojiY\);/g, `
                    // Vector SL Indicator Tag
                    ctx2d.font = 'bold 9px "SF Pro Text", "Segoe UI", sans-serif';
                    ctx2d.fillStyle = '#ec4899';
                    ctx2d.fillText('SL', screenX, slEmojiY);
`);

// Holographic Spotlight badges on focus:
content = content.replace(/const tpText = `🎯 TP HEDEFİ: \$[^\`]*`;/g, 'const tpText = `TP HEDEFİ: $${sig.tp.toFixed(1)} (+%${targetPnlPct}) ${isTpWin ? "[BAŞARILI]" : ""}`;');
content = content.replace(/const slText = `🛡️ STOP LOSS: \$[^\`]*`;/g, 'const slText = `STOP LOSS: $${sig.sl.toFixed(1)} (-%${riskPnlPct}) ${isSlLoss ? "[STOP]" : ""}`;');
content = content.replace(/const entryText = `⚡ GİRİŞ: \$[^\`]*`;/g, 'const entryText = `GİRİŞ: $${sig.price.toFixed(1)} | R:R 1 : ${sig.rrRatio.toFixed(2)}`;');

// Signal Inspector Tooltip
content = content.replace(/inspType\.innerText = `⚡ \${sigAtCandle\.label}`;/g, 'inspType.innerText = `SİNYAL: ${sigAtCandle.label}`;');
content = content.replace(/inspBtResult\.innerText = `🏆 BACKTEST: TP BAŞARILI! \(\+\${sigAtCandle\.pnlPct\.toFixed\(2\)}%\)`;/g, 'inspBtResult.innerText = `BACKTEST: TP BAŞARILI (+${sigAtCandle.pnlPct.toFixed(2)}%)`;');
content = content.replace(/inspBtResult\.innerText = `❌ BACKTEST: STOP OLDU! \(\${sigAtCandle\.pnlPct\.toFixed\(2\)}%\)`;/g, 'inspBtResult.innerText = `BACKTEST: STOP LOSS (${sigAtCandle.pnlPct.toFixed(2)}%)`;');
content = content.replace(/inspBtResult\.innerText = '⌛ BACKTEST: İŞLEM HALA AÇIK';/g, "inspBtResult.innerText = 'BACKTEST: İŞLEM AÇIK';");

content = content.replace(/inspTp\.innerText = `🎯 TP: \$[^\`]*`;/g, 'inspTp.innerText = `TP HEDEFİ: $${sigAtCandle.tp.toFixed(2)}`;');
content = content.replace(/inspSl\.innerText = `🛡️ SL: \$[^\`]*`;/g, 'inspSl.innerText = `STOP LOSS: $${sigAtCandle.sl.toFixed(2)}`;');

// Drawing Engine note text
content = content.replace(/ctx\.fillText\('✍️ Not: ' \+ \(p1\.price\.toFixed\(2\)\), x1, y1\);/g, "ctx.fillText('Not: ' + (p1.price.toFixed(2)), x1, y1);");

// Add ind-dot CSS style
const dotStyle = `
        .ind-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 4px;
        }
`;
if (!content.includes('.ind-dot')) {
    content = content.replace('.indicator-nav {', dotStyle + '\n        .indicator-nav {');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated indikator_sablonu.html!');
