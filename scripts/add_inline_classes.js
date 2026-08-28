import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const techClassesCode = `
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
`;

content = content.replace('const BUILTIN_INDICATOR_DEFS = {', techClassesCode + '\n        const BUILTIN_INDICATOR_DEFS = {');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully added TechnicalCalculations and ScriptEngine classes inline!');
