import './style.css';
import vsSource from './shaders/vertex.glsl?raw';
import fsSource from './shaders/fragment.glsl?raw';
import { WebGLEngine } from './engine/webgl.js';
import { InteractionManager } from './engine/interaction.js';
import { fetchKlines, subscribeKlineWebSocket } from './services/binance.js';
import { calculateSqiciBekiR } from './indicators/sqiciBekir.js';
import { HUDManager, formatFullTime } from './ui/hud.js';

// Global Uygulama Durumu (State)
const state = {
    symbol: 'BTCUSDT',
    candleData: [],
    calcResult: null,
    totalCandles: 0,
    viewStart: 0,
    viewEnd: 150,
    minPrice: 60000,
    maxPrice: 70000,
    priceScaleFactor: 1.0,
    mousePixelX: -1000,
    mousePixelY: -1000,
    time: 0,
    layers: {
        bg: 1,
        cloud: 1,
        ema: 1,
        signals: 1,
        cross: 1
    }
};

// DOM Elemanları
const canvas = document.getElementById('glcanvas');
const canvasContainer = document.getElementById('canvas-container');
const timeAxisElem = document.getElementById('time-axis');
const priceAxisElem = document.getElementById('price-axis');

// Yöneticileri Başlat
const engine = new WebGLEngine(canvas, vsSource, fsSource);
const hud = new HUDManager();

function updateGpuBuffers() {
    if (state.totalCandles === 0 || !state.calcResult) return;

    let maxVol = 0;
    for (let i = 0; i < state.totalCandles; i++) {
        if (state.candleData[i].vol > maxVol) maxVol = state.candleData[i].vol;
    }
    if (maxVol === 0) maxVol = 1;

    const candleArr = new Float32Array(state.totalCandles * 4);
    const cloudArr = new Float32Array(state.totalCandles * 4);
    const signalsArr = new Float32Array(state.totalCandles * 4);
    const crossArr = new Float32Array(state.totalCandles * 4);

    const c = state.candleData;
    const r = state.calcResult;

    for (let i = 0; i < state.totalCandles; i++) {
        const idx = i * 4;
        candleArr[idx + 0] = c[i].open;
        candleArr[idx + 1] = c[i].high;
        candleArr[idx + 2] = c[i].low;
        candleArr[idx + 3] = c[i].close;

        cloudArr[idx + 0] = r.sa1H[i];
        cloudArr[idx + 1] = r.sb1H[i];
        cloudArr[idx + 2] = r.ema4HLive[i];
        cloudArr[idx + 3] = c[i].vol / maxVol;

        signalsArr[idx + 0] = r.signalCode[i];
        signalsArr[idx + 1] = r.slArray[i];
        signalsArr[idx + 2] = r.tpArray[i];
        signalsArr[idx + 3] = r.lastRegime1DArr[i];

        crossArr[idx + 0] = r.crossUp4H[i];
        crossArr[idx + 1] = r.crossDown4H[i];
        crossArr[idx + 2] = 0.0;
        crossArr[idx + 3] = 0.0;
    }

    engine.updateTexture('candle', 0, candleArr, state.totalCandles);
    engine.updateTexture('cloud', 1, cloudArr, state.totalCandles);
    engine.updateTexture('signals', 2, signalsArr, state.totalCandles);
    engine.updateTexture('cross', 3, crossArr, state.totalCandles);

    hud.updateHUD(state.candleData, state.calcResult);
}

function recalculateIndicator() {
    state.calcResult = calculateSqiciBekiR(state.candleData);
    updateGpuBuffers();
}

async function loadSymbol(sym) {
    state.symbol = sym;
    hud.setLoading(true, `⏳ ${sym} Mumları ve İndikatör Verileri Yükleniyor...`);

    try {
        const data = await fetchKlines(sym, '1h', 1000);
        state.candleData = data;
        state.totalCandles = data.length;
        state.viewStart = Math.max(0, state.totalCandles - 150);
        state.viewEnd = state.totalCandles;

        recalculateIndicator();

        if (state.totalCandles > 0) {
            hud.updatePriceHeader(state.candleData[state.totalCandles - 1].close);
        }
    } catch (err) {
        console.error('Veri yükleme hatası:', err);
    } finally {
        hud.setLoading(false);
    }

    // WebSocket Bağlantısı
    subscribeKlineWebSocket(
        sym,
        '1h',
        (liveCandle) => {
            const lastIdx = state.candleData.length - 1;
            if (lastIdx >= 0 && state.candleData[lastIdx].time === liveCandle.time) {
                state.candleData[lastIdx] = liveCandle;
            } else {
                state.candleData.push(liveCandle);
                state.totalCandles = state.candleData.length;
                if (state.viewEnd >= state.totalCandles - 2) {
                    state.viewStart++;
                    state.viewEnd++;
                }
            }

            recalculateIndicator();
            hud.updatePriceHeader(liveCandle.close);
        },
        (status) => {
            hud.setWsStatus(status);
        }
    );
}

// Etkileşim Yöneticisi
const interaction = new InteractionManager(
    {
        canvas,
        container: canvasContainer,
        timeAxis: timeAxisElem,
        priceAxis: priceAxisElem
    },
    state,
    {
        fitAll: () => {
            state.viewStart = 0;
            state.viewEnd = state.totalCandles;
            state.priceScaleFactor = 1.0;
        },
        onCrosshairMove: (e, rect) => {
            const normX = (e.clientX - rect.left) / rect.width;
            const visibleCount = Math.max(1, state.viewEnd - state.viewStart);
            const cIdx = Math.floor(state.viewStart + normX * visibleCount);

            if (cIdx >= 0 && cIdx < state.totalCandles && state.candleData[cIdx]) {
                const c = state.candleData[cIdx];
                hud.dom.ohlcO.innerText = c.open.toFixed(2);
                hud.dom.ohlcH.innerText = c.high.toFixed(2);
                hud.dom.ohlcL.innerText = c.low.toFixed(2);
                hud.dom.ohlcC.innerText = c.close.toFixed(2);
                hud.dom.ohlcC.className = c.close >= c.open ? 'ohlc-val val-up' : 'ohlc-val val-down';

                if (state.calcResult && state.calcResult.atr1H) {
                    hud.dom.ohlcAtr.innerText = state.calcResult.atr1H[cIdx].toFixed(2);
                }

                const date = new Date(c.time);
                hud.dom.crosshairTimeTag.style.display = 'block';
                hud.dom.crosshairTimeTag.style.left = `${e.clientX - rect.left}px`;
                hud.dom.crosshairTimeTag.innerText = formatFullTime(date);
            }

            if (isFinite(state.minPrice) && isFinite(state.maxPrice) && state.maxPrice > state.minPrice) {
                const normY = (rect.bottom - e.clientY) / rect.height;
                const hoveredPrice = state.minPrice + normY * (state.maxPrice - state.minPrice);
                hud.dom.crosshairPriceTag.style.display = 'block';
                hud.dom.crosshairPriceTag.style.top = `${e.clientY - rect.top}px`;
                hud.dom.crosshairPriceTag.innerText = hoveredPrice.toFixed(2);
            }
        },
        onCrosshairLeave: () => {
            hud.dom.crosshairPriceTag.style.display = 'none';
            hud.dom.crosshairTimeTag.style.display = 'none';
        }
    }
);

// Global Window Metotları (HTML Butonları İçin)
window.changeSymbol = (sym) => loadSymbol(sym);
window.fitAllCandles = () => interaction.callbacks.fitAll();
window.resetPriceScale = () => {
    state.priceScaleFactor = 1.0;
};
window.toggleLayer = (layerName) => {
    state.layers[layerName] = state.layers[layerName] ? 0 : 1;
    document.getElementById(`btn-${layerName}`).classList.toggle('active', !!state.layers[layerName]);
};

// ==========================================
// RENDER DÖNGÜSÜ
// ==========================================
let lastT = performance.now();
let frameCount = 0;

function render(now) {
    frameCount++;
    if (now - lastT >= 500) {
        const fps = Math.round((frameCount * 1000) / (now - lastT));
        const visibleCount = Math.round(state.viewEnd - state.viewStart);
        hud.dom.fpsStat.innerText = fps;
        hud.dom.visibleCandlesStat.innerText = visibleCount;
        frameCount = 0;
        lastT = now;
    }

    state.time = now * 0.001;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(10, Math.floor(canvasContainer.clientWidth * dpr));
    const h = Math.max(10, Math.floor(canvasContainer.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        engine.gl.viewport(0, 0, w, h);
    }

    if (state.totalCandles > 0) {
        let minP = Infinity;
        let maxP = -Infinity;
        const startI = Math.max(0, Math.floor(state.viewStart));
        const endI = Math.min(state.totalCandles, Math.ceil(state.viewEnd));

        for (let i = startI; i < endI; i++) {
            if (state.candleData[i]) {
                if (state.candleData[i].low < minP) minP = state.candleData[i].low;
                if (state.candleData[i].high > maxP) maxP = state.candleData[i].high;
            }
        }

        if (!isFinite(minP) || !isFinite(maxP) || minP >= maxP) {
            minP = 60000;
            maxP = 70000;
        }

        const baseMid = (minP + maxP) / 2;
        const baseHalfSpan = (maxP - minP) / 2;
        const scaledHalfSpan = (baseHalfSpan / state.priceScaleFactor) * 1.05;

        state.minPrice = baseMid - scaledHalfSpan;
        state.maxPrice = baseMid + scaledHalfSpan;

        const lastClose = state.candleData[state.totalCandles - 1]?.close;
        hud.updatePriceScaleLabels(state.minPrice, state.maxPrice, lastClose);
        hud.updateTimeScaleLabels(state.candleData, state.viewStart, state.viewEnd);

        engine.render(state);
    }

    requestAnimationFrame(render);
}

// Başlat
loadSymbol('BTCUSDT');
requestAnimationFrame(render);
