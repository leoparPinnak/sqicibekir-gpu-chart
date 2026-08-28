import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const engineCodeToInsert = `
        // ============================================================
        // 📊 TEKNİK HESAPLAMA MOTORU VE FORMÜL KÜTÜPHANESİ
        // ============================================================
        class TechnicalCalculations {
            static sma(data, period, key = 'close') {
                const values = data.map(d => typeof d === 'number' ? d : d[key]);
                const result = new Array(values.length).fill(null);
                let sum = 0;
                for (let i = 0; i < values.length; i++) {
                    sum += values[i];
                    if (i >= period) sum -= values[i - period];
                    if (i >= period - 1) result[i] = sum / period;
                }
                return result;
            }

            static ema(data, period, key = 'close') {
                const values = data.map(d => typeof d === 'number' ? d : d[key]);
                const result = new Array(values.length).fill(null);
                const k = 2 / (period + 1);
                let initialSum = 0;
                for (let i = 0; i < values.length; i++) {
                    if (i < period - 1) initialSum += values[i];
                    else if (i === period - 1) { initialSum += values[i]; result[i] = initialSum / period; }
                    else result[i] = (values[i] - result[i - 1]) * k + result[i - 1];
                }
                return result;
            }

            static rsi(candles, period = 14, key = 'close') {
                const values = candles.map(c => typeof c === 'number' ? c : c[key]);
                const result = new Array(values.length).fill(null);
                if (values.length <= period) return result;

                let gains = 0, losses = 0;
                for (let i = 1; i <= period; i++) {
                    const diff = values[i] - values[i - 1];
                    if (diff >= 0) gains += diff;
                    else losses -= diff;
                }

                let avgGain = gains / period;
                let avgLoss = losses / period;
                result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

                for (let i = period + 1; i < values.length; i++) {
                    const diff = values[i] - values[i - 1];
                    const gain = diff > 0 ? diff : 0;
                    const loss = diff < 0 ? -diff : 0;
                    avgGain = (avgGain * (period - 1) + gain) / period;
                    avgLoss = (avgLoss * (period - 1) + loss) / period;
                    result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
                }
                return result;
            }

            static macd(candles, fast = 12, slow = 26, signal = 9, key = 'close') {
                const fastEma = this.ema(candles, fast, key);
                const slowEma = this.ema(candles, slow, key);
                const macdLine = new Array(candles.length).fill(null);

                for (let i = 0; i < candles.length; i++) {
                    if (fastEma[i] !== null && slowEma[i] !== null) macdLine[i] = fastEma[i] - slowEma[i];
                }

                const validMacdStart = macdLine.findIndex(v => v !== null);
                const signalLine = new Array(candles.length).fill(null);
                const histogram = new Array(candles.length).fill(null);

                if (validMacdStart !== -1) {
                    const validMacdValues = macdLine.slice(validMacdStart);
                    const sigEma = this.ema(validMacdValues, signal);
                    for (let i = 0; i < sigEma.length; i++) {
                        const targetIdx = validMacdStart + i;
                        signalLine[targetIdx] = sigEma[i];
                        if (macdLine[targetIdx] !== null && signalLine[targetIdx] !== null) {
                            histogram[targetIdx] = macdLine[targetIdx] - signalLine[targetIdx];
                        }
                    }
                }
                return { macd: macdLine, signal: signalLine, histogram };
            }

            static bollingerBands(candles, period = 20, mult = 2.0, key = 'close') {
                const values = candles.map(c => typeof c === 'number' ? c : c[key]);
                const basis = this.sma(candles, period, key);
                const upper = new Array(values.length).fill(null);
                const lower = new Array(values.length).fill(null);

                for (let i = period - 1; i < values.length; i++) {
                    let sumSq = 0;
                    for (let j = 0; j < period; j++) sumSq += Math.pow(values[i - j] - basis[i], 2);
                    const stdev = Math.sqrt(sumSq / period);
                    upper[i] = basis[i] + mult * stdev;
                    lower[i] = basis[i] - mult * stdev;
                }
                return { basis, upper, lower };
            }

            static atr(candles, period = 14) {
                const result = new Array(candles.length).fill(null);
                if (candles.length < 2) return result;

                const tr = [candles[0].high - candles[0].low];
                for (let i = 1; i < candles.length; i++) {
                    const h = candles[i].high, l = candles[i].low, pc = candles[i - 1].close;
                    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
                }

                let sum = 0;
                for (let i = 0; i < period; i++) sum += tr[i];
                result[period - 1] = sum / period;

                for (let i = period; i < candles.length; i++) {
                    result[i] = (result[i - 1] * (period - 1) + tr[i]) / period;
                }
                return result;
            }

            static supertrend(candles, period = 10, factor = 3.0) {
                const atr = this.atr(candles, period);
                const upperBand = new Array(candles.length).fill(null);
                const lowerBand = new Array(candles.length).fill(null);
                const superTrend = new Array(candles.length).fill(null);
                const direction = new Array(candles.length).fill(1);

                for (let i = 0; i < candles.length; i++) {
                    if (atr[i] === null) continue;
                    const hl2 = (candles[i].high + candles[i].low) / 2;
                    let basicUpper = hl2 + factor * atr[i];
                    let basicLower = hl2 - factor * atr[i];

                    let prevLower = (i > 0 && lowerBand[i - 1] !== null) ? lowerBand[i - 1] : basicLower;
                    let prevUpper = (i > 0 && upperBand[i - 1] !== null) ? upperBand[i - 1] : basicUpper;
                    let prevClose = (i > 0) ? candles[i - 1].close : candles[i].close;

                    lowerBand[i] = (basicLower > prevLower || prevClose < prevLower) ? basicLower : prevLower;
                    upperBand[i] = (basicUpper < prevUpper || prevClose > prevUpper) ? basicUpper : prevUpper;

                    let prevDir = (i > 0) ? direction[i - 1] : 1;
                    let prevST = (i > 0 && superTrend[i - 1] !== null) ? superTrend[i - 1] : lowerBand[i];

                    if (prevST === prevUpper) {
                        direction[i] = candles[i].close > upperBand[i] ? 1 : -1;
                    } else {
                        direction[i] = candles[i].close < lowerBand[i] ? -1 : 1;
                    }
                    superTrend[i] = direction[i] === 1 ? lowerBand[i] : upperBand[i];
                }
                return { superTrend, direction, upperBand, lowerBand };
            }

            static volume(candles, smaPeriod = 20) {
                const vols = candles.map(c => c.volume || 0);
                const volSma = this.sma(vols, smaPeriod);
                return { volume: vols, volSma };
            }
        }

        // ============================================================
        // 💻 PINE / SCRIPT ENGINE RUNTIME
        // ============================================================
        class ScriptEngine {
            static execute(code, candles) {
                if (!candles || candles.length === 0) return { success: false, error: 'Mum verisi bulunamadı.' };

                const plots = [];
                const logs = [];
                const open = candles.map(c => c.open);
                const high = candles.map(c => c.high);
                const low = candles.map(c => c.low);
                const close = candles.map(c => c.close);
                const volume = candles.map(c => c.volume || 0);
                const time = candles.map(c => c.time);
                const hl2 = candles.map(c => (c.high + c.low) / 2);
                const hlc3 = candles.map(c => (c.high + c.low + c.close) / 3);
                const ohlc4 = candles.map(c => (c.open + c.high + c.low + c.close) / 4);

                const sma = (src, len) => TechnicalCalculations.sma(src, len);
                const ema = (src, len) => TechnicalCalculations.ema(src, len);
                const rsi = (src, len) => TechnicalCalculations.rsi(src, len);
                const atr = (len) => TechnicalCalculations.atr(candles, len);
                const bb = (src, len, mult) => TechnicalCalculations.bollingerBands(src, len, mult);
                const supertrend = (len, factor) => TechnicalCalculations.supertrend(candles, len, factor);

                const highest = (src, len) => {
                    const arr = typeof src[0] === 'number' ? src : src.map(c => c.high);
                    const res = new Array(arr.length).fill(null);
                    for (let i = len - 1; i < arr.length; i++) {
                        let max = -Infinity;
                        for (let j = 0; j < len; j++) if (arr[i - j] > max) max = arr[i - j];
                        res[i] = max;
                    }
                    return res;
                };

                const lowest = (src, len) => {
                    const arr = typeof src[0] === 'number' ? src : src.map(c => c.low);
                    const res = new Array(arr.length).fill(null);
                    for (let i = len - 1; i < arr.length; i++) {
                        let min = Infinity;
                        for (let j = 0; j < len; j++) if (arr[i - j] < min) min = arr[i - j];
                        res[i] = min;
                    }
                    return res;
                };

                const crossover = (seriesA, seriesB) => {
                    const res = new Array(candles.length).fill(false);
                    for (let i = 1; i < candles.length; i++) {
                        if (seriesA[i - 1] !== null && seriesB[i - 1] !== null && seriesA[i] !== null && seriesB[i] !== null) {
                            res[i] = seriesA[i - 1] <= seriesB[i - 1] && seriesA[i] > seriesB[i];
                        }
                    }
                    return res;
                };

                const crossunder = (seriesA, seriesB) => {
                    const res = new Array(candles.length).fill(false);
                    for (let i = 1; i < candles.length; i++) {
                        if (seriesA[i - 1] !== null && seriesB[i - 1] !== null && seriesA[i] !== null && seriesB[i] !== null) {
                            res[i] = seriesA[i - 1] >= seriesB[i - 1] && seriesA[i] < seriesB[i];
                        }
                    }
                    return res;
                };

                const plot = (series, title = 'Plot', color = '#38bdf8', linewidth = 2, overlay = true) => {
                    plots.push({
                        type: 'line',
                        title: String(title),
                        series: Array.isArray(series) ? series : new Array(candles.length).fill(series),
                        color: color || '#38bdf8',
                        linewidth: linewidth || 2,
                        overlay: overlay !== false
                    });
                };

                const plotbar = (series, title = 'Bar', color = '#10b981', overlay = false) => {
                    plots.push({
                        type: 'bar',
                        title: String(title),
                        series: Array.isArray(series) ? series : new Array(candles.length).fill(series),
                        color: color || '#10b981',
                        overlay: overlay === true
                    });
                };

                const hline = (price, title = 'Level', color = '#64748b', linestyle = 'dashed') => {
                    plots.push({
                        type: 'hline',
                        price: Number(price),
                        title: String(title),
                        color: color || '#64748b',
                        linestyle: linestyle || 'dashed',
                        overlay: false
                    });
                };

                const print = (...args) => {
                    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                };

                try {
                    const userFunction = new Function(
                        'candles', 'open', 'high', 'low', 'close', 'volume', 'time', 'hl2', 'hlc3', 'ohlc4',
                        'sma', 'ema', 'rsi', 'atr', 'bb', 'supertrend', 'highest', 'lowest', 'crossover', 'crossunder',
                        'plot', 'plotbar', 'hline', 'print',
                        \`"use strict";\\n\${code}\`
                    );
                    userFunction(
                        candles, open, high, low, close, volume, time, hl2, hlc3, ohlc4,
                        sma, ema, rsi, atr, bb, supertrend, highest, lowest, crossover, crossunder,
                        plot, plotbar, hline, print
                    );
                    return { success: true, plots, logs, error: null };
                } catch (err) {
                    return { success: false, plots: [], logs, error: err.message || 'Script çalıştırma hatası' };
                }
            }

            static getTemplates() {
                return [
                    {
                        name: 'EMA Cross (9 / 21)',
                        code: '// ⚡ EMA 9 ve EMA 21 Kesişimi\\nconst ema9 = ema(close, 9);\\nconst ema21 = ema(close, 21);\\n\\nplot(ema9, "EMA 9", "#38bdf8", 2, true);\\nplot(ema21, "EMA 21", "#f59e0b", 2, true);'
                    },
                    {
                        name: 'Özel RSI Osilatörü (14)',
                        code: '// 📊 RSI (14) Osilatörü\\nconst rsiVal = rsi(close, 14);\\n\\nplot(rsiVal, "RSI (14)", "#a855f7", 2, false);\\nhline(70, "Aşırı Alım", "#ef4444", "dashed");\\nhline(30, "Aşırı Satım", "#10b981", "dashed");\\nhline(50, "Orta Seviye", "#64748b", "dotted");'
                    },
                    {
                        name: 'Bollinger Bandı & Fiyat',
                        code: '// 🎯 Bollinger Bantları (20, 2.0)\\nconst bands = bb(close, 20, 2.0);\\n\\nplot(bands.upper, "Üst Bant", "#38bdf8", 1.5, true);\\nplot(bands.basis, "Orta (SMA 20)", "#fbbf24", 1.5, true);\\nplot(bands.lower, "Alt Bant", "#38bdf8", 1.5, true);'
                    },
                    {
                        name: 'Hacim Momentum Histogramı',
                        code: '// 📈 Hacim Momentum Histogramı\\nconst volSma20 = sma(volume, 20);\\nconst priceSma20 = sma(close, 20);\\nconst diff = close.map((c, i) => (c - (priceSma20[i] || c)) * (volume[i] / (volSma20[i] || 1)));\\n\\nplotbar(diff, "Hacim Momentum", "#10b981", false);\\nhline(0, "Sıfır Çizgisi", "#64748b", "solid");'
                    }
                ];
            }
        }

        const BUILTIN_INDICATOR_DEFS = {
            'rsi': {
                id: 'rsi',
                name: 'RSI (Göreceli Güç Endeksi)',
                desc: '14 periyotluk momentum osilatörü [0 - 100]',
                type: 'subpane',
                defaultParams: { length: 14, color: '#a855f7', width: 2, upper: 70, lower: 30 }
            },
            'macd': {
                id: 'macd',
                name: 'MACD (Hareketli Ortalama Yakınsama)',
                desc: '12/26/9 Standart MACD Çizgisi, Sinyal ve Histogram',
                type: 'subpane',
                defaultParams: { fast: 12, slow: 26, signal: 9, macdColor: '#38bdf8', sigColor: '#f59e0b' }
            },
            'bollinger': {
                id: 'bollinger',
                name: 'Bollinger Bantları',
                desc: '20 periyot, 2.0 standart sapma volatilite kanalları',
                type: 'overlay',
                defaultParams: { length: 20, mult: 2.0, upperColor: '#38bdf8', lowerColor: '#38bdf8', basisColor: '#fbbf24', width: 1.5 }
            },
            'ema': {
                id: 'ema',
                name: 'EMA (Üstel Hareketli Ortalama)',
                desc: 'Fiyat ağırlıklı üstel ortalama (9, 21, 50, 200 vb.)',
                type: 'overlay',
                defaultParams: { length: 20, color: '#38bdf8', width: 2 }
            },
            'sma': {
                id: 'sma',
                name: 'SMA (Basit Hareketli Ortalama)',
                desc: 'Standart aritmetik hareketli ortalama',
                type: 'overlay',
                defaultParams: { length: 50, color: '#f59e0b', width: 2 }
            },
            'volume': {
                id: 'volume',
                name: 'Hacim (Volume + Vol SMA)',
                desc: 'Mum işlem hacmi ve 20 periyotluk hacim ortalaması',
                type: 'subpane',
                defaultParams: { smaLength: 20, showSma: true }
            },
            'supertrend': {
                id: 'supertrend',
                name: 'SuperTrend',
                desc: '10 ATR, 3.0 çarpanlı dinamik trend takip bantları',
                type: 'overlay',
                defaultParams: { period: 10, factor: 3.0 }
            },
            'atr': {
                id: 'atr',
                name: 'ATR (Average True Range)',
                desc: '14 periyotluk piyasa oynaklık/volatilite ölçeri',
                type: 'subpane',
                defaultParams: { period: 14, color: '#38bdf8', width: 2 }
            }
        };

        let activeIndicators = [];
        let editingIndicatorId = null;

        function calcIndicatorData(ind, candles) {
            if (!candles || candles.length === 0) return null;
            const p = ind.params;

            if (ind.defId === 'rsi') {
                return { rsi: TechnicalCalculations.rsi(candles, p.length) };
            } else if (ind.defId === 'macd') {
                return TechnicalCalculations.macd(candles, p.fast, p.slow, p.signal);
            } else if (ind.defId === 'bollinger') {
                return TechnicalCalculations.bollingerBands(candles, p.length, p.mult);
            } else if (ind.defId === 'ema') {
                return { ema: TechnicalCalculations.ema(candles, p.length) };
            } else if (ind.defId === 'sma') {
                return { sma: TechnicalCalculations.sma(candles, p.length) };
            } else if (ind.defId === 'volume') {
                return TechnicalCalculations.volume(candles, p.smaLength);
            } else if (ind.defId === 'supertrend') {
                return TechnicalCalculations.supertrend(candles, p.period, p.factor);
            } else if (ind.defId === 'atr') {
                return { atr: TechnicalCalculations.atr(candles, p.period) };
            } else if (ind.defId === 'custom_script') {
                return ind.scriptResult;
            }
            return null;
        }

        window.recalculateAllIndicators = function() {
            if (!candleDataBase || candleDataBase.length === 0) return;
            for (const ind of activeIndicators) {
                if (ind.defId === 'custom_script') {
                    const res = ScriptEngine.execute(ind.code, candleDataBase);
                    ind.scriptResult = res;
                } else {
                    ind.data = calcIndicatorData(ind, candleDataBase);
                }
            }
            syncSubpaneDOM();
        };

        window.syncSubpaneDOM = function() {
            const wrapper = document.getElementById('subpanes-wrapper');
            if (!wrapper) return;

            const subpanes = activeIndicators.filter(ind => ind.type === 'subpane' || (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots.some(pl => !pl.overlay)));
            
            const existingIds = new Set();
            for (const el of wrapper.children) {
                const id = el.getAttribute('data-ind-id');
                if (id) existingIds.add(id);
            }

            for (const id of existingIds) {
                if (!subpanes.some(s => s.id === id)) {
                    const el = wrapper.querySelector(\`[data-ind-id="\${id}"]\`);
                    if (el) el.remove();
                }
            }

            for (const ind of subpanes) {
                if (!wrapper.querySelector(\`[data-ind-id="\${ind.id}"]\`)) {
                    const card = document.createElement('div');
                    card.className = 'subpane-container';
                    card.setAttribute('data-ind-id', ind.id);
                    card.innerHTML = \`
                        <div class="subpane-header">
                            <span class="subpane-title">\${ind.name}</span>
                            <span class="subpane-val" id="subpane-val-\${ind.id}">--</span>
                            <div class="subpane-actions">
                                <button class="subpane-btn" onclick="toggleIndicatorVis('\${ind.id}')" title="Gizle/Göster">\${ind.visible ? '👁️' : '🚫'}</button>
                                <button class="subpane-btn" onclick="openIndicatorSettings('\${ind.id}')" title="Ayarlar">⚙️</button>
                                <button class="subpane-btn" onclick="removeIndicator('\${ind.id}')" title="Kapat">✕</button>
                            </div>
                        </div>
                        <canvas class="subpane-canvas" id="subpane-canvas-\${ind.id}"></canvas>
                    \`;
                    wrapper.appendChild(card);
                }
            }

            const countEl = document.getElementById('active-ind-count');
            if (countEl) countEl.innerText = activeIndicators.length;
        };

        window.renderAllSubpanes = function() {
            const subpanes = activeIndicators.filter(ind => ind.type === 'subpane' && ind.visible && ind.data);
            const w = canvasContainer ? canvasContainer.clientWidth : 800;
            const curStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
            const curEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
            const count = Math.max(1, curEnd - curStart);

            for (const ind of subpanes) {
                const cvs = document.getElementById(\`subpane-canvas-\${ind.id}\`);
                if (!cvs) continue;
                const dpr = window.devicePixelRatio || 1;
                const h = cvs.parentElement.clientHeight || 120;

                if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) {
                    cvs.width = Math.round(w * dpr);
                    cvs.height = Math.round(h * dpr);
                }

                const ctx = cvs.getContext('2d');
                ctx.save();
                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, w, h);

                if (ind.defId === 'rsi' && ind.data.rsi) {
                    const rsiArr = ind.data.rsi;
                    const col = ind.params.color || '#a855f7';
                    const upY = h - (ind.params.upper / 100) * h;
                    const loY = h - (ind.params.lower / 100) * h;

                    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
                    ctx.fillRect(0, upY, w, loY - upY);

                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(0, upY); ctx.lineTo(w, upY);
                    ctx.moveTo(0, loY); ctx.lineTo(w, loY);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.strokeStyle = col;
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;

                    for (let i = 0; i < totalCandles; i++) {
                        const val = rsiArr[i];
                        if (val === null || val === undefined) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - (val / 100) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const curVal = rsiArr[lastIdx];
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && curVal !== null && curVal !== undefined) {
                        valEl.innerText = curVal.toFixed(2);
                        valEl.style.color = col;
                    }
                } else if (ind.defId === 'macd' && ind.data.macd) {
                    const { macd, signal, histogram } = ind.data;
                    let maxH = 0.01;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (macd[i] !== null) maxH = Math.max(maxH, Math.abs(macd[i]));
                        if (signal[i] !== null) maxH = Math.max(maxH, Math.abs(signal[i]));
                        if (histogram[i] !== null) maxH = Math.max(maxH, Math.abs(histogram[i]));
                    }
                    maxH *= 1.2;
                    const midY = h / 2;

                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(0, midY); ctx.lineTo(w, midY);
                    ctx.stroke();

                    const barW = Math.max(2, (w / count) * 0.7);
                    for (let i = 0; i < totalCandles; i++) {
                        const hist = histogram[i];
                        if (hist === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const barH = (hist / maxH) * (h / 2);
                        ctx.fillStyle = hist >= 0 ? '#10b981' : '#ef4444';
                        ctx.fillRect(x - barW / 2, midY, barW, -barH);
                    }

                    ctx.strokeStyle = ind.params.macdColor || '#38bdf8';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const m = macd[i];
                        if (m === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = midY - (m / maxH) * (h / 2);
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    ctx.strokeStyle = ind.params.sigColor || '#f59e0b';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const s = signal[i];
                        if (s === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = midY - (s / maxH) * (h / 2);
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && macd[lastIdx] !== null) {
                        valEl.innerText = \`MACD: \${macd[lastIdx].toFixed(2)} | Sig: \${signal[lastIdx] ? signal[lastIdx].toFixed(2) : '--'}\`;
                        valEl.style.color = '#38bdf8';
                    }
                } else if (ind.defId === 'volume' && ind.data.volume) {
                    const { volume: vols, volSma } = ind.data;
                    let maxV = 1;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (vols[i]) maxV = Math.max(maxV, vols[i]);
                    }
                    maxV *= 1.15;
                    const barW = Math.max(2, (w / count) * 0.7);

                    for (let i = 0; i < totalCandles; i++) {
                        const v = vols[i];
                        if (!v) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const barH = (v / maxV) * (h - 10);
                        const isUp = candleDataBase[i] && candleDataBase[i].close >= candleDataBase[i].open;
                        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
                        ctx.fillRect(x - barW / 2, h - barH, barW, barH);
                    }

                    if (ind.params.showSma && volSma) {
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        let started = false;
                        for (let i = 0; i < totalCandles; i++) {
                            const vs = volSma[i];
                            if (vs === null) continue;
                            const x = ((i + 0.5 - curStart) / count) * w;
                            const y = h - (vs / maxV) * (h - 10);
                            if (!started) { ctx.moveTo(x, y); started = true; }
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && vols[lastIdx]) {
                        valEl.innerText = \`Hacim: \${vols[lastIdx].toLocaleString()}\`;
                        valEl.style.color = '#38bdf8';
                    }
                } else if (ind.defId === 'atr' && ind.data.atr) {
                    const atrArr = ind.data.atr;
                    let minA = Infinity, maxA = -Infinity;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (atrArr[i] !== null) {
                            minA = Math.min(minA, atrArr[i]);
                            maxA = Math.max(maxA, atrArr[i]);
                        }
                    }
                    if (minA === Infinity) { minA = 0; maxA = 1; }
                    const span = maxA - minA || 1;

                    ctx.strokeStyle = ind.params.color || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const a = atrArr[i];
                        if (a === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((a - minA) / span) * (h - 20) - 10;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && atrArr[lastIdx] !== null) {
                        valEl.innerText = atrArr[lastIdx].toFixed(2);
                        valEl.style.color = '#38bdf8';
                    }
                }

                if (mouseCssX >= 0 && mouseCssX <= w) {
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(mouseCssX, 0); ctx.lineTo(mouseCssX, h);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                ctx.restore();
            }
        };

        window.renderOverlayIndicators = function(ctx, w, h, pMin, pMax, curStart, curEnd) {
            const overlays = activeIndicators.filter(ind => (ind.type === 'overlay' || (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots.some(pl => pl.overlay))) && ind.visible);
            const count = Math.max(1, curEnd - curStart);
            const pSpan = pMax - pMin;
            if (pSpan <= 0) return;

            for (const ind of overlays) {
                if (ind.defId === 'ema' && ind.data && ind.data.ema) {
                    const emaArr = ind.data.ema;
                    ctx.strokeStyle = ind.params.color || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = emaArr[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'sma' && ind.data && ind.data.sma) {
                    const smaArr = ind.data.sma;
                    ctx.strokeStyle = ind.params.color || '#f59e0b';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = smaArr[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'bollinger' && ind.data && ind.data.basis) {
                    const { basis, upper, lower } = ind.data;
                    
                    ctx.strokeStyle = ind.params.basisColor || '#fbbf24';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = basis[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    ctx.strokeStyle = ind.params.upperColor || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 1.5;
                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = upper[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = lower[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'supertrend' && ind.data && ind.data.superTrend) {
                    const { superTrend, direction } = ind.data;
                    ctx.lineWidth = 2;
                    for (let i = 1; i < totalCandles; i++) {
                        const st1 = superTrend[i - 1];
                        const st2 = superTrend[i];
                        if (st1 === null || st2 === null) continue;
                        const x1 = ((i - 1 + 0.5 - curStart) / count) * w;
                        const y1 = h - ((st1 - pMin) / pSpan) * h;
                        const x2 = ((i + 0.5 - curStart) / count) * w;
                        const y2 = h - ((st2 - pMin) / pSpan) * h;

                        ctx.strokeStyle = direction[i] === 1 ? '#10b981' : '#ef4444';
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                } else if (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots) {
                    for (const pl of ind.scriptResult.plots) {
                        if (!pl.overlay) continue;
                        ctx.strokeStyle = pl.color || '#38bdf8';
                        ctx.lineWidth = pl.linewidth || 2;
                        ctx.beginPath();
                        let started = false;
                        for (let i = 0; i < totalCandles; i++) {
                            const val = pl.series[i];
                            if (val === null || val === undefined) continue;
                            const x = ((i + 0.5 - curStart) / count) * w;
                            const y = h - ((val - pMin) / pSpan) * h;
                            if (!started) { ctx.moveTo(x, y); started = true; }
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }
                }
            }
        };

        window.openIndicatorModal = function() {
            const modal = document.getElementById('fx-modal-backdrop');
            if (modal) {
                modal.classList.add('active');
                renderFxModalList('tech');
            }
        };

        window.closeIndicatorModal = function(e) {
            if (e && e.target !== e.currentTarget && !e.target.classList.contains('fx-modal-close')) return;
            const modal = document.getElementById('fx-modal-backdrop');
            if (modal) modal.classList.remove('active');
        };

        window.switchFxTab = function(tab) {
            document.getElementById('fx-tab-tech').classList.toggle('active', tab === 'tech');
            document.getElementById('fx-tab-active').classList.toggle('active', tab === 'active');
            renderFxModalList(tab);
        };

        window.filterIndicators = function(query) {
            const activeTab = document.getElementById('fx-tab-tech').classList.contains('active') ? 'tech' : 'active';
            renderFxModalList(activeTab, query.toLowerCase());
        };

        function renderFxModalList(tab, query = '') {
            const container = document.getElementById('fx-modal-body');
            if (!container) return;
            let html = '';

            if (tab === 'tech') {
                const defs = Object.values(BUILTIN_INDICATOR_DEFS).filter(d => 
                    d.name.toLowerCase().includes(query) || d.desc.toLowerCase().includes(query)
                );
                for (const def of defs) {
                    html += \`
                        <div class="fx-indicator-row">
                            <div class="fx-ind-info">
                                <span class="fx-ind-name">\${def.name}</span>
                                <span class="fx-ind-desc">\${def.desc}</span>
                            </div>
                            <button class="fx-btn-add" onclick="addIndicator('\${def.id}')">➕ Ekle</button>
                        </div>
                    \`;
                }
            } else {
                if (activeIndicators.length === 0) {
                    html = '<div style="text-align: center; color: #64748b; padding: 30px;">Grafikte aktif gösterge bulunmuyor.</div>';
                } else {
                    for (const ind of activeIndicators) {
                        html += \`
                            <div class="fx-indicator-row">
                                <div class="fx-ind-info">
                                    <span class="fx-ind-name">\${ind.name}</span>
                                    <span class="fx-ind-desc">\${ind.type === 'overlay' ? 'Grafik Üstü Katman' : 'Alt Panel'}</span>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <button class="pine-btn" onclick="toggleIndicatorVis('\${ind.id}')">\${ind.visible ? '👁️ Açık' : '🚫 Kapalı'}</button>
                                    <button class="pine-btn" onclick="openIndicatorSettings('\${ind.id}')">⚙️ Ayarlar</button>
                                    <button class="pine-btn" style="color: #ef4444; border-color: #ef4444;" onclick="removeIndicator('\${ind.id}')">🗑️ Sil</button>
                                </div>
                            </div>
                        \`;
                    }
                }
            }
            container.innerHTML = html;
        }

        window.addIndicator = function(defId) {
            const def = BUILTIN_INDICATOR_DEFS[defId];
            if (!def) return;
            const newInd = {
                id: 'ind_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                defId: def.id,
                name: def.name,
                type: def.type,
                params: JSON.parse(JSON.stringify(def.defaultParams)),
                visible: true,
                data: null
            };
            activeIndicators.push(newInd);
            recalculateAllIndicators();
            renderFxModalList('tech');
        };

        window.removeIndicator = function(id) {
            activeIndicators = activeIndicators.filter(ind => ind.id !== id);
            recalculateAllIndicators();
            renderFxModalList('active');
        };

        window.toggleIndicatorVis = function(id) {
            const ind = activeIndicators.find(i => i.id === id);
            if (ind) {
                ind.visible = !ind.visible;
                syncSubpaneDOM();
                renderFxModalList('active');
            }
        };

        window.openIndicatorSettings = function(id) {
            const ind = activeIndicators.find(i => i.id === id);
            if (!ind) return;
            editingIndicatorId = id;
            const modal = document.getElementById('fx-settings-modal');
            const titleEl = document.getElementById('fx-settings-title');
            const bodyEl = document.getElementById('fx-settings-body');
            if (titleEl) titleEl.innerText = \`⚙️ \${ind.name} Ayarları\`;

            let fieldsHtml = '';
            for (const [k, v] of Object.entries(ind.params)) {
                if (typeof v === 'number') {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()}:</label>
                            <input type="number" id="setting-\${k}" value="\${v}" step="\${k === 'mult' || k === 'factor' ? '0.1' : '1'}">
                        </div>
                    \`;
                } else if (typeof v === 'string' && v.startsWith('#')) {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()} RENK:</label>
                            <input type="color" id="setting-\${k}" value="\${v}">
                        </div>
                    \`;
                } else if (typeof v === 'boolean') {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()}:</label>
                            <input type="checkbox" id="setting-\${k}" \${v ? 'checked' : ''}>
                        </div>
                    \`;
                }
            }
            if (bodyEl) bodyEl.innerHTML = fieldsHtml;
            if (modal) modal.classList.add('active');
        };

        window.closeIndicatorSettings = function(e) {
            if (e && e.target !== e.currentTarget && !e.target.classList.contains('fx-modal-close') && e.target.tagName !== 'BUTTON') return;
            const modal = document.getElementById('fx-settings-modal');
            if (modal) modal.classList.remove('active');
            editingIndicatorId = null;
        };

        window.saveIndicatorSettings = function() {
            const ind = activeIndicators.find(i => i.id === editingIndicatorId);
            if (!ind) return;

            for (const k of Object.keys(ind.params)) {
                const el = document.getElementById(\`setting-\${k}\`);
                if (el) {
                    if (el.type === 'number') ind.params[k] = parseFloat(el.value);
                    else if (el.type === 'checkbox') ind.params[k] = el.checked;
                    else ind.params[k] = el.value;
                }
            }
            recalculateAllIndicators();
            closeIndicatorSettings();
        };

        window.toggleScriptEditor = function() {
            const panel = document.getElementById('pine-editor-panel');
            if (panel) panel.classList.toggle('active');
        };

        window.loadScriptTemplate = function(idx) {
            if (idx === '') return;
            const tpls = ScriptEngine.getTemplates();
            const tpl = tpls[parseInt(idx, 10)];
            if (tpl) {
                const editor = document.getElementById('pine-code-editor');
                if (editor) editor.value = tpl.code;
            }
        };

        window.clearPineScript = function() {
            const editor = document.getElementById('pine-code-editor');
            if (editor) editor.value = '';
            const consoleEl = document.getElementById('pine-console');
            if (consoleEl) {
                consoleEl.className = 'pine-console';
                consoleEl.innerText = 'Temizlendi.';
            }
        };

        window.runPineScript = function() {
            const editor = document.getElementById('pine-code-editor');
            const consoleEl = document.getElementById('pine-console');
            if (!editor || !consoleEl) return;
            const code = editor.value;

            const res = ScriptEngine.execute(code, candleDataBase);
            if (!res.success) {
                consoleEl.className = 'pine-console error';
                consoleEl.innerText = '❌ Hata: ' + res.error;
                return;
            }

            consoleEl.className = 'pine-console';
            consoleEl.innerText = \`✓ Başarılı: \${res.plots.length} adet çizim grafiğe eklendi.\`;

            activeIndicators = activeIndicators.filter(i => i.defId !== 'custom_script');
            activeIndicators.push({
                id: 'custom_script_' + Date.now(),
                defId: 'custom_script',
                name: 'Özel Script / Formül',
                type: res.plots.some(p => p.overlay) ? 'overlay' : 'subpane',
                code,
                scriptResult: res,
                visible: true
            });
            recalculateAllIndicators();
        };
`;

// Insert directly after the main <script> tag (which is the 3rd script tag in the file)
const parts = content.split('<script>');
// parts[0] is html before vertex shader script
// parts[1] is vertex shader
// parts[2] is fragment shader
// parts[3] is the main JavaScript code
parts[3] = engineCodeToInsert + '\n' + parts[3];

content = parts.join('<script>');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully injected indicator engine directly after main <script> tag!');
