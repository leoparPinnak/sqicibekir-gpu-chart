/**
 * TradeChart Pro - Custom Script & Formula Engine
 * Sandboxed execution environment for custom JavaScript and Pine-like indicator formulas.
 */

import { TechnicalCalculations } from './indicator_manager.js';

export class ScriptEngine {
    /**
     * Executes custom user code on candle data and returns generated plots.
     * @param {string} code - User script
     * @param {Array} candles - Array of candle objects { time, open, high, low, close, volume }
     * @returns {Object} { success: boolean, plots: Array, error?: string }
     */
    static execute(code, candles) {
        if (!candles || candles.length === 0) {
            return { success: false, error: 'Mum verisi bulunamadı.' };
        }

        const plots = [];
        const logs = [];

        // Built-in price series arrays
        const open = candles.map(c => c.open);
        const high = candles.map(c => c.high);
        const low = candles.map(c => c.low);
        const close = candles.map(c => c.close);
        const volume = candles.map(c => c.volume || 0);
        const time = candles.map(c => c.time);
        const hl2 = candles.map(c => (c.high + c.low) / 2);
        const hlc3 = candles.map(c => (c.high + c.low + c.close) / 3);
        const ohlc4 = candles.map(c => (c.open + c.high + c.low + c.close) / 4);

        // Built-in calculation functions
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

        // Built-in Plot API
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
            // Safe evaluation context
            const userFunction = new Function(
                'candles', 'open', 'high', 'low', 'close', 'volume', 'time', 'hl2', 'hlc3', 'ohlc4',
                'sma', 'ema', 'rsi', 'atr', 'bb', 'supertrend', 'highest', 'lowest', 'crossover', 'crossunder',
                'plot', 'plotbar', 'hline', 'print',
                `"use strict";\n${code}`
            );

            userFunction(
                candles, open, high, low, close, volume, time, hl2, hlc3, ohlc4,
                sma, ema, rsi, atr, bb, supertrend, highest, lowest, crossover, crossunder,
                plot, plotbar, hline, print
            );

            return {
                success: true,
                plots,
                logs,
                error: null
            };
        } catch (err) {
            return {
                success: false,
                plots: [],
                logs,
                error: err.message || 'Script çalıştırma hatası'
            };
        }
    }

    /**
     * Preset script templates for quick start.
     */
    static getTemplates() {
        return [
            {
                name: 'EMA Cross (9 / 21)',
                description: '9 ve 21 periyotluk Üstel Hareketli Ortalama Kesişimi',
                code: `// ⚡ EMA 9 ve EMA 21 Kesişimi
const ema9 = ema(close, 9);
const ema21 = ema(close, 21);

plot(ema9, "EMA 9", "#38bdf8", 2, true);
plot(ema21, "EMA 21", "#f59e0b", 2, true);

const buySignal = crossover(ema9, ema21);
const sellSignal = crossunder(ema9, ema21);
`
            },
            {
                name: 'Özel RSI Osilatörü (14)',
                description: 'Alt panelde çalışan 70/30 seviyeli RSI göstergesi',
                code: `// 📊 RSI (14) Osilatörü
const rsiVal = rsi(close, 14);

plot(rsiVal, "RSI (14)", "#a855f7", 2, false);
hline(70, "Aşırı Alım", "#ef4444", "dashed");
hline(30, "Aşırı Satım", "#10b981", "dashed");
hline(50, "Orta Seviye", "#64748b", "dotted");
`
            },
            {
                name: 'Bollinger Bandı & Fiyat',
                description: 'Standart Sapma 2.0 ve 20 periyotluk Bollinger Bantları',
                code: `// 🎯 Bollinger Bantları (20, 2.0)
const bands = bb(close, 20, 2.0);

plot(bands.upper, "Üst Bant", "#38bdf8", 1.5, true);
plot(bands.basis, "Orta (SMA 20)", "#fbbf24", 1.5, true);
plot(bands.lower, "Alt Bant", "#38bdf8", 1.5, true);
`
            },
            {
                name: 'Hacim Ağırlıklı Osilatör',
                description: 'Hacim ile fiyat momentumunun bileşimi',
                code: `// 📈 Hacim Momentum Histogramı
const volSma20 = sma(volume, 20);
const priceSma20 = sma(close, 20);
const diff = close.map((c, i) => (c - (priceSma20[i] || c)) * (volume[i] / (volSma20[i] || 1)));

plotbar(diff, "Hacim Momentum", "#10b981", false);
hline(0, "Sıfır Çizgisi", "#64748b", "solid");
`
            }
        ];
    }
}
