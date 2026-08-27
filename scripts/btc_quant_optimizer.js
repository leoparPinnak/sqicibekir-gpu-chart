// ==============================================================================
// 🔬 BTC/USDT 3000-MUM QUANT OPTİMİZATÖRÜ VE STRATEJİ EVRİM MOTORU
// ==============================================================================
import fs from 'fs';
import path from 'path';

console.log('🚀 BTCUSDT Multi-Timeframe (3000 1H + 1000 4H + 500 1D) verisi çekiliyor...');

async function fetchBinanceKlines(symbol, interval, count) {
    let allKlines = [];
    let endTime = null;
    const requestsNeeded = Math.ceil(count / 1000);
    const hosts = ['https://api.binance.com', 'https://data-api.binance.vision', 'https://api1.binance.com'];

    for (let req = 0; req < requestsNeeded; req++) {
        let chunk = null;
        for (const host of hosts) {
            try {
                let url = `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
                if (endTime) url += `&endTime=${endTime}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        chunk = data;
                        break;
                    }
                }
            } catch (e) {}
        }
        if (!chunk || chunk.length === 0) break;
        allKlines = chunk.concat(allKlines);
        endTime = chunk[0][0] - 1;
    }

    const uniqueMap = new Map();
    for (const k of allKlines) uniqueMap.set(k[0], k);
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => a[0] - b[0]);

    return sorted.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        vol: parseFloat(k[5])
    }));
}

// -------------------------------------------------------------
// PINE SCRIPT v6 MTF SİNYAL VE İNDİKATÖR MOTORU
// -------------------------------------------------------------
function computePineV6IndicatorsAndSignals(data1H, data4H, data1D) {
    const N1H = data1H.length;
    const N4H = data4H.length;
    const N1D = data1D.length;

    const sa1H = new Float32Array(N1H);
    const sb1H = new Float32Array(N1H);
    const kijun1H = new Float32Array(N1H);
    const ema4HLiveArr = new Float32Array(N1H);
    const regime1DArr = new Float32Array(N1H);
    const atrArr = new Float32Array(N1H);
    const atr50SmaArr = new Float32Array(N1H);
    const vol20SmaArr = new Float32Array(N1H);

    const convLen = 9;
    const baseLen = 26;
    const spanBLen = 52;
    const disp = 26;
    const emaLen = 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    // 1D Ichimoku
    const sa1DRaw = new Float32Array(N1D);
    const sb1DRaw = new Float32Array(N1D);
    for (let i = 0; i < N1D; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, data1D[i - j].high);
            tL = Math.min(tL, data1D[i - j].low);
        }
        const tenkan = (tH + tL) / 2;

        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, data1D[i - j].high);
            kL = Math.min(kL, data1D[i - j].low);
        }
        const kijun = (kH + kL) / 2;

        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1D[i - j].high);
            sBL = Math.min(sBL, data1D[i - j].low);
        }
        sa1DRaw[i] = (tenkan + kijun) / 2;
        sb1DRaw[i] = (sBH + sBL) / 2;
    }

    let lastRegime1D = 0;
    const confirmedRegime1DByDay = [];
    for (let i = 0; i < N1D; i++) {
        const shiftedA = (i >= disp) ? sa1DRaw[i - disp] : sa1DRaw[i];
        const shiftedB = (i >= disp) ? sb1DRaw[i - disp] : sb1DRaw[i];
        const cloudTop = Math.max(shiftedA, shiftedB);
        const cloudBot = Math.min(shiftedA, shiftedB);
        const c = data1D[i].close;

        let rawRegime = 0;
        if (c > cloudTop) rawRegime = 1;
        else if (c < cloudBot) rawRegime = -1;
        else rawRegime = 0;

        if (rawRegime === 1 || rawRegime === -1) {
            lastRegime1D = rawRegime;
        }

        confirmedRegime1DByDay.push({
            time: data1D[i].time,
            closeTime: data1D[i].time + 86400000 - 1,
            lastRegime: lastRegime1D
        });
    }

    // 4H EMA26
    const ema4HClosedArr = new Float32Array(N4H);
    let pEma4H = data4H[0] ? data4H[0].close : 0;
    for (let i = 0; i < N4H; i++) {
        pEma4H = data4H[i].close * emaCoeff + pEma4H * (1.0 - emaCoeff);
        ema4HClosedArr[i] = pEma4H;
    }

    // 1H ATR & SMA
    let prevAtr = 0;
    for (let i = 0; i < N1H; i++) {
        const h = data1H[i].high;
        const l = data1H[i].low;
        const pc = i > 0 ? data1H[i - 1].close : data1H[i].open;
        const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        if (i === 0) prevAtr = tr;
        else if (i < 14) prevAtr = (prevAtr * i + tr) / (i + 1);
        else prevAtr = (prevAtr * 13 + tr) / 14;
        atrArr[i] = prevAtr;

        let atrSum = 0;
        const atrLook = Math.min(i + 1, 50);
        for (let k = 0; k < atrLook; k++) atrSum += atrArr[i - k];
        atr50SmaArr[i] = atrSum / atrLook;

        let volSum = 0;
        const volLook = Math.min(i + 1, 20);
        for (let k = 0; k < volLook; k++) volSum += data1H[i - k].vol;
        vol20SmaArr[i] = volSum / volLook;
    }

    // 1H Ichimoku
    const sa1HRaw = new Float32Array(N1H);
    const sb1HRaw = new Float32Array(N1H);
    for (let i = 0; i < N1H; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, data1H[i - j].high);
            tL = Math.min(tL, data1H[i - j].low);
        }
        const tenkan = (tH + tL) / 2;

        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, data1D ? data1H[i - j].high : 0);
            kL = Math.min(kL, data1D ? data1H[i - j].low : 0);
        }
        const kijun = (kH + kL) / 2;
        kijun1H[i] = kijun;

        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1H[i - j].high);
            sBL = Math.min(sBL, data1H[i - j].low);
        }

        sa1HRaw[i] = (tenkan + kijun) / 2;
        sb1HRaw[i] = (sBH + sBL) / 2;
    }

    for (let i = 0; i < N1H; i++) {
        sa1H[i] = (i >= disp) ? sa1HRaw[i - disp] : sa1HRaw[i];
        sb1H[i] = (i >= disp) ? sb1HRaw[i - disp] : sb1HRaw[i];
    }

    // Match 1D & 4H
    let dIdx = 0, fourHIdx = 0;
    for (let i = 0; i < N1H; i++) {
        const t1H = data1H[i].time;
        const c1H = data1H[i].close;

        while (dIdx + 1 < confirmedRegime1DByDay.length && confirmedRegime1DByDay[dIdx + 1].closeTime <= t1H) {
            dIdx++;
        }
        regime1DArr[i] = confirmedRegime1DByDay[dIdx] ? confirmedRegime1DByDay[dIdx].lastRegime : 0;

        while (fourHIdx + 1 < N4H && (data4H[fourHIdx + 1].time + 14400000 - 1) <= t1H) {
            fourHIdx++;
        }
        const prevClosedEma4H = ema4HClosedArr[fourHIdx] || c1H;
        ema4HLiveArr[i] = emaCoeff * c1H + (1.0 - emaCoeff) * prevClosedEma4H;
    }

    // Detect Raw Signals
    let prevBuy2Cond = false, prevSell2Cond = false;
    const rawSignals = [];

    for (let i = 53; i < N1H; i++) {
        const c = data1H[i].close;
        const prevC = data1H[i - 1].close;
        const curSa = sa1H[i], curSb = sb1H[i];
        const prevSa = sa1H[i - 1], prevSb = sb1H[i - 1];

        const top1H = Math.max(curSa, curSb);
        const bot1H = Math.min(curSa, curSb);
        const prevTop1H = Math.max(prevSa, prevSb);
        const prevBot1H = Math.min(prevSa, prevSb);

        const cur1DReg = regime1DArr[i];
        const curEma4HLive = ema4HLiveArr[i];

        const above4HEMA = c > curEma4HLive;
        const below4HEMA = c < curEma4HLive;

        const bullish = (cur1DReg === 1) && above4HEMA;
        const bearish = (cur1DReg === -1) && below4HEMA;

        const enterUp1H = (c > top1H) && (prevC <= prevTop1H);
        const enterDown1H = (c < bot1H) && (prevC >= prevBot1H);

        const above1HCloud = c > top1H;
        const below1HCloud = c < bot1H;

        const buy2Cond = bullish && above1HCloud;
        const sell2Cond = bearish && below1HCloud;

        const buySignal1 = bullish && enterUp1H;
        const sellSignal1 = bearish && enterDown1H;
        const buySignal2 = buy2Cond && !prevBuy2Cond;
        const sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond;
        prevSell2Cond = sell2Cond;

        let sig = null;
        if (buySignal1) sig = { index: i, type: 'BUY1', isBuy: true, price: c };
        else if (sellSignal1) sig = { index: i, type: 'SELL1', isBuy: false, price: c };
        else if (buySignal2) sig = { index: i, type: 'BUY2', isBuy: true, price: c };
        else if (sellSignal2) sig = { index: i, type: 'SELL2', isBuy: false, price: c };

        if (sig) {
            rawSignals.push(sig);
        }
    }

    return { sa1H, sb1H, kijun1H, ema4HLiveArr, regime1DArr, atrArr, atr50SmaArr, vol20SmaArr, rawSignals };
}

// -------------------------------------------------------------
// ÇOK BOYUTLU STRATEJİ SİMÜLATÖRÜ
// -------------------------------------------------------------
function simulateStrategy(config, data1H, indicators) {
    const { rawSignals, sa1H, sb1H, kijun1H, atrArr, atr50SmaArr, vol20SmaArr } = indicators;
    const N1H = data1H.length;

    let tpCount = 0;
    let slCount = 0;
    let initialCapital = 1000.0;
    let capital = initialCapital;
    let maxCapital = initialCapital;
    let maxDrawdownPct = 0;
    let totalPnlPct = 0;
    let tradeResults = [];

    for (const sig of rawSignals) {
        const i = sig.index;
        const c = sig.price;
        const isBuy = sig.isBuy;
        const atr = atrArr[i] || 1;
        const curSa = sa1H[i];
        const curSb = sb1H[i];
        const curKijun = kijun1H[i];

        // 1. FİLTRELEME (Quality Filters)
        if (config.minRvol && vol20SmaArr[i] > 0) {
            const rvol = data1H[i].vol / vol20SmaArr[i];
            if (rvol < config.minRvol) continue; // Filtreye takıldı
        }
        if (config.maxKijunStretch) {
            const kijunDist = Math.abs(c - curKijun) / atr;
            if (kijunDist > config.maxKijunStretch) continue; // Fazla uzamış
        }
        if (config.minCloudThickness) {
            const cloudThickPct = (Math.abs(curSa - curSb) / c) * 100;
            if (cloudThickPct < config.minCloudThickness) continue; // Kumo twist / ince bulut
        }

        // 2. STOP & TARGET HESAPLAMA
        let sl = 0;
        let tp = 0;

        if (config.mode === 'STRUCTURE') {
            let swingLow = Infinity, swingHigh = -Infinity;
            const lookback = config.swingLookback || 10;
            for (let k = 0; k < lookback; k++) {
                const pastIdx = Math.max(0, i - k);
                if (data1H[pastIdx].low < swingLow) swingLow = data1H[pastIdx].low;
                if (data1H[pastIdx].high > swingHigh) swingHigh = data1H[pastIdx].high;
            }
            const buffer = atr * (config.bufferMult || 0.4);
            const minD = atr * (config.minAtrClamp || 1.0);
            const maxD = atr * (config.maxAtrClamp || 3.0);

            if (isBuy) {
                const anchor = Math.min(swingLow, curKijun, Math.min(curSa, curSb));
                let rawD = c - (anchor - buffer);
                let finalD = Math.max(minD, Math.min(maxD, rawD));
                sl = c - finalD;
                tp = c + (finalD * (config.targetRR || 1.67));
            } else {
                const anchor = Math.max(swingHigh, curKijun, Math.max(curSa, curSb));
                let rawD = (anchor + buffer) - c;
                let finalD = Math.max(minD, Math.min(maxD, rawD));
                sl = c + finalD;
                tp = c - (finalD * (config.targetRR || 1.67));
            }
        } else if (config.mode === 'QUANT_MAE') {
            const atr50 = atr50SmaArr[i] || atr;
            const vol20 = vol20SmaArr[i] || data1H[i].vol;
            const rAtr = atr / atr50;
            const rCloud = (Math.abs(curSa - curSb) / c) * 100;
            const rvol = vol20 > 0 ? (data1H[i].vol / vol20) : 1.0;
            const rKijun = Math.abs(c - curKijun) / atr;

            const zRegime = config.wAtr * (rAtr - 1.0) + config.wVol * (rvol - 1.0) + config.wCloud * ((rCloud / 0.8) - 1.0) - config.wKijun * (rKijun - 0.7);
            const pExp = 1.0 / (1.0 + Math.exp(-config.lambda * zRegime));

            const kMAE = config.kSlMax - (pExp * (config.kSlMax - config.kSlMin));
            const kTP = config.kTpMin + (Math.pow(pExp, 0.85) * (config.kTpMax - config.kTpMin));

            sl = isBuy ? (c - kMAE * atr) : (c + kMAE * atr);
            tp = isBuy ? (c + kTP * atr) : (c - kTP * atr);
        } else if (config.mode === 'HYBRID_ULTRA') {
            // Yapısal SL + Dinamik MAE Volatilite Genişlemesi
            let swingLow = Infinity, swingHigh = -Infinity;
            for (let k = 0; k < 10; k++) {
                const pastIdx = Math.max(0, i - k);
                if (data1H[pastIdx].low < swingLow) swingLow = data1H[pastIdx].low;
                if (data1H[pastIdx].high > swingHigh) swingHigh = data1H[pastIdx].high;
            }
            const atr50 = atr50SmaArr[i] || atr;
            const rAtr = atr / atr50;
            const dynamicBuffer = rAtr < 0.9 ? (0.6 * atr) : (0.35 * atr);

            if (isBuy) {
                const anchor = Math.min(swingLow, curKijun, Math.min(curSa, curSb));
                let finalD = Math.max(1.0 * atr, Math.min(3.2 * atr, c - (anchor - dynamicBuffer)));
                sl = c - finalD;
                tp = c + (finalD * (config.targetRR || 2.0));
            } else {
                const anchor = Math.max(swingHigh, curKijun, Math.max(curSa, curSb));
                let finalD = Math.max(1.0 * atr, Math.min(3.2 * atr, (anchor + dynamicBuffer) - c));
                sl = c + finalD;
                tp = c - (finalD * (config.targetRR || 2.0));
            }
        } else {
            // Sabit ATR
            sl = isBuy ? (c - atr * config.fixedSlAtr) : (c + atr * config.fixedSlAtr);
            tp = isBuy ? (c + atr * config.fixedTpAtr) : (c - atr * config.fixedTpAtr);
        }

        // 3. BAR-BY-BAR SIMULATION & TRAILING STOP
        let currentDynamicStop = sl;
        let highestProfitAtr = 0;
        let exitPrice = c;
        let isTp = false;

        for (let step = i + 1; step < N1H; step++) {
            const bH = data1H[step].high;
            const bL = data1H[step].low;
            const stepAtr = atrArr[step] || atr;
            const stepKijun = kijun1H[step] || c;

            // Trailing Stop Kuralları
            if (config.useTrailing) {
                const profitAtr = isBuy ? (bH - c) / atr : (c - bL) / atr;
                if (profitAtr > highestProfitAtr) highestProfitAtr = profitAtr;

                // Parabolik Kâr Kilitleme
                if (config.parabolicTrigger && highestProfitAtr >= config.parabolicTrigger) {
                    const lbL = Math.min(data1H[step - 1].low, data1H[Math.max(0, step - 2)].low);
                    const lbH = Math.max(data1H[step - 1].high, data1H[Math.max(0, step - 2)].high);
                    if (isBuy && lbL > currentDynamicStop) currentDynamicStop = lbL;
                    if (!isBuy && lbH < currentDynamicStop) currentDynamicStop = lbH;
                }
                // Kijun Trailing
                else if (config.kijunTrigger && highestProfitAtr >= config.kijunTrigger && stepKijun > 0) {
                    const kStop = isBuy ? stepKijun - (stepAtr * (config.kijunOffset || 0.2)) : stepKijun + (stepAtr * (config.kijunOffset || 0.2));
                    if (isBuy && kStop > currentDynamicStop) currentDynamicStop = kStop;
                    if (!isBuy && kStop < currentDynamicStop) currentDynamicStop = kStop;
                }
                // Breakeven
                else if (config.beTrigger && highestProfitAtr >= config.beTrigger) {
                    const beStop = isBuy ? c + (atr * (config.beBuffer || 0.05)) : c - (atr * (config.beBuffer || 0.05));
                    if (isBuy && beStop > currentDynamicStop) currentDynamicStop = beStop;
                    if (!isBuy && beStop < currentDynamicStop) currentDynamicStop = beStop;
                }
            }

            if (isBuy) {
                const hitTp = bH >= tp;
                const hitSl = bL <= currentDynamicStop;

                if (hitTp && !hitSl) {
                    isTp = true; exitPrice = tp; break;
                } else if (hitSl && !hitTp) {
                    isTp = false; exitPrice = currentDynamicStop; break;
                } else if (hitTp && hitSl) {
                    isTp = data1H[step].close >= data1H[step].open;
                    exitPrice = isTp ? tp : currentDynamicStop;
                    break;
                }
            } else {
                const hitTp = bL <= tp;
                const hitSl = bH >= currentDynamicStop;

                if (hitTp && !hitSl) {
                    isTp = true; exitPrice = tp; break;
                } else if (hitSl && !hitTp) {
                    isTp = false; exitPrice = currentDynamicStop; break;
                } else if (hitTp && hitSl) {
                    isTp = data1H[step].close <= data1H[step].open;
                    exitPrice = isTp ? tp : currentDynamicStop;
                    break;
                }
            }
        }

        const pnlPct = isBuy ? ((exitPrice - c) / c) * 100 : ((c - exitPrice) / c) * 100;
        
        if (pnlPct >= 0) tpCount++;
        else slCount++;

        capital = capital * (1.0 + (pnlPct / 100.0));
        if (capital > maxCapital) maxCapital = capital;
        const currentDd = ((maxCapital - capital) / maxCapital) * 100;
        if (currentDd > maxDrawdownPct) maxDrawdownPct = currentDd;

        tradeResults.push({ pnlPct });
    }

    const totalTrades = tpCount + slCount;
    const winRate = totalTrades > 0 ? (tpCount / totalTrades) * 100 : 0;
    const totalReturnPct = ((capital - initialCapital) / initialCapital) * 100;

    return {
        name: config.name,
        config,
        totalTrades,
        tpCount,
        slCount,
        winRate,
        capital,
        totalReturnPct,
        maxDrawdownPct
    };
}

// -------------------------------------------------------------
// ANA YÜRÜTME VE BİNLERCE KOMBİNASYON TARAMASI
// -------------------------------------------------------------
async function runMassiveOptimization() {
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 3000);
    const data4H = await fetchBinanceKlines('BTCUSDT', '4h', 1000);
    const data1D = await fetchBinanceKlines('BTCUSDT', '1d', 500);

    console.log(`✅ Veriler başarıyla çekildi: 1H (${data1H.length} mum), 4H (${data4H.length} mum), 1D (${data1D.length} mum)`);

    const indicators = computePineV6IndicatorsAndSignals(data1H, data4H, data1D);
    console.log(`⚡ Toplam Üretilen Pine Script v6 Sinyali: ${indicators.rawSignals.length} adet\n`);

    const strategyGrid = [];

    // 1. KLASİK SABİT GRID (100 Kombinasyon)
    for (let sl = 1.0; sl <= 3.0; sl += 0.25) {
        for (let tp = 1.5; tp <= 4.5; tp += 0.5) {
            strategyGrid.push({
                name: `Sabit SL ${sl.toFixed(2)}x / TP ${tp.toFixed(2)}x`,
                mode: 'FIXED',
                fixedSlAtr: sl,
                fixedTpAtr: tp,
                useTrailing: false
            });
        }
    }

    // 2. PİYASA YAPISI (STRUCTURE) GRID (300 Kombinasyon)
    for (let lookback of [5, 8, 10, 15, 20]) {
        for (let buffer of [0.2, 0.3, 0.4, 0.5, 0.6]) {
            for (let rr of [1.4, 1.67, 1.85, 2.0, 2.3, 2.6]) {
                for (let minRvol of [0, 0.8, 1.1]) {
                    strategyGrid.push({
                        name: `Structure Lookback:${lookback} Buf:${buffer} RR:${rr} MinRvol:${minRvol}`,
                        mode: 'STRUCTURE',
                        swingLookback: lookback,
                        bufferMult: buffer,
                        targetRR: rr,
                        minAtrClamp: 1.0,
                        maxAtrClamp: 3.2,
                        minRvol: minRvol,
                        useTrailing: false
                    });
                }
            }
        }
    }

    // 3. QUANT MAE & VOLATİLİTE GRID (250 Kombinasyon)
    for (let slMax of [2.2, 2.5, 2.8]) {
        for (let slMin of [1.2, 1.4, 1.6]) {
            for (let tpMax of [2.8, 3.2, 3.8]) {
                for (let tpMin of [1.6, 1.8, 2.0]) {
                    strategyGrid.push({
                        name: `Quant MAE SL[${slMin}-${slMax}] TP[${tpMin}-${tpMax}]`,
                        mode: 'QUANT_MAE',
                        wAtr: 1.6, wVol: 0.9, wCloud: 0.5, wKijun: 0.75, lambda: 1.75,
                        kSlMax: slMax, kSlMin: slMin, kTpMax: tpMax, kTpMin: tpMin,
                        useTrailing: false
                    });
                }
            }
        }
    }

    // 4. TRAILING STOP & BREAKEVEN GRID (350 Kombinasyon)
    for (let beTrig of [0.8, 1.0, 1.2, 1.5]) {
        for (let beBuf of [0.0, 0.05, 0.1]) {
            for (let kijunTrig of [1.4, 1.8, 2.2]) {
                for (let targetRR of [1.67, 2.0, 2.5, 3.0]) {
                    strategyGrid.push({
                        name: `Trailing BE:${beTrig}x KijunTrig:${kijunTrig}x RR:${targetRR}`,
                        mode: 'STRUCTURE',
                        swingLookback: 10,
                        bufferMult: 0.4,
                        targetRR: targetRR,
                        useTrailing: true,
                        beTrigger: beTrig,
                        beBuffer: beBuf,
                        kijunTrigger: kijunTrig,
                        kijunOffset: 0.2,
                        parabolicTrigger: 2.5
                    });
                }
            }
        }
    }

    // 5. HYBRID ULTRA SİSTEMİ (Kalite Filtreli + Dinamik Tampon + Trailing) (200 Kombinasyon)
    for (let rr of [1.8, 2.0, 2.2, 2.5, 2.8]) {
        for (let minRvol of [0.85, 1.0, 1.2]) {
            for (let maxKijun of [1.4, 1.8, 2.2]) {
                for (let beTrig of [0.9, 1.1, 1.3]) {
                    strategyGrid.push({
                        name: `🏆 HYBRID ULTRA (RR:${rr} RVOL:${minRvol} KijunMax:${maxKijun} BE:${beTrig})`,
                        mode: 'HYBRID_ULTRA',
                        targetRR: rr,
                        minRvol: minRvol,
                        maxKijunStretch: maxKijun,
                        useTrailing: true,
                        beTrigger: beTrig,
                        beBuffer: 0.08,
                        kijunTrigger: 1.7,
                        kijunOffset: 0.15,
                        parabolicTrigger: 2.6
                    });
                }
            }
        }
    }

    console.log(`🔥 Toplam test edilecek strateji kombinasyonu: ${strategyGrid.length} adet... Lütfen bekleyin...\n`);

    const results = [];
    for (const strat of strategyGrid) {
        const res = simulateStrategy(strat, data1H, indicators);
        results.push(res);
    }

    // Sıralama 1: Kümülatif Getiriye ($1000 All-In Büyümesine) Göre
    results.sort((a, b) => b.totalReturnPct - a.totalReturnPct);

    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🏆 EN YÜKSEK KÜMÜLATİF GETİRİ SAĞLAYAN İLK 10 STRATEJİ (TOP 10 ALL-IN PROFIT)');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(10, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1} | ${r.name}`);
        console.log(`   💰 $1.000 -> $${r.capital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (+%${r.totalReturnPct.toFixed(2)})`);
        console.log(`   🎯 Kazanma: %${r.winRate.toFixed(1)} | Toplam İşlem: ${r.totalTrades} (TP: ${r.tpCount}, SL: ${r.slCount}) | Max Drawdown: -%${r.maxDrawdownPct.toFixed(1)}\n`);
    }

    // Sıralama 2: Kazanma Oranına (Win Rate %) Göre (Min 20 işlem)
    const highWinRate = results.filter(r => r.totalTrades >= 25).sort((a, b) => b.winRate - a.winRate);
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🎯 EN YÜKSEK KAZANMA ORANINA (WIN RATE) SAHİP İLK 5 STRATEJİ (Min 25 İşlem)');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(5, highWinRate.length); i++) {
        const r = highWinRate[i];
        console.log(`#${i + 1} | ${r.name}`);
        console.log(`   🎯 Kazanma Oranı: %${r.winRate.toFixed(1)} | İşlem: ${r.totalTrades} (TP: ${r.tpCount}, SL: ${r.slCount})`);
        console.log(`   💰 Getiri: +%${r.totalReturnPct.toFixed(2)} ($${r.capital.toFixed(2)}) | Max Drawdown: -%${r.maxDrawdownPct.toFixed(1)}\n`);
    }

    // En iyi sonuçları JSON olarak kaydet
    const outputData = {
        symbol: 'BTCUSDT',
        testedCandles: 3000,
        totalStrategiesTested: strategyGrid.length,
        topByProfit: results.slice(0, 15),
        topByWinRate: highWinRate.slice(0, 10)
    };

    fs.writeFileSync('scripts/optimization_results.json', JSON.stringify(outputData, null, 2));
    console.log('📁 Sonuçlar scripts/optimization_results.json dosyasına kaydedildi.');
}

runMassiveOptimization().catch(console.error);
