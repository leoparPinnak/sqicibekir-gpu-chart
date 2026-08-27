// ==============================================================================
// 🎯 SIGNAL-SPECIFIC OPTIMIZER (BUY1 vs BUY2 vs SELL1 vs SELL2)
// ==============================================================================
import fs from 'fs';

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
    return Array.from(uniqueMap.values()).sort((a, b) => a[0] - b[0]).map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        vol: parseFloat(k[5])
    }));
}

function computeIndicators(data1H, data4H, data1D) {
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

    const convLen = 9, baseLen = 26, spanBLen = 52, disp = 26, emaLen = 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    // 1D
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
        if (rawRegime === 1 || rawRegime === -1) lastRegime1D = rawRegime;

        confirmedRegime1DByDay.push({
            time: data1D[i].time,
            closeTime: data1D[i].time + 86400000 - 1,
            lastRegime: lastRegime1D
        });
    }

    // 4H EMA
    const ema4HClosedArr = new Float32Array(N4H);
    let pEma4H = data4H[0] ? data4H[0].close : 0;
    for (let i = 0; i < N4H; i++) {
        pEma4H = data4H[i].close * emaCoeff + pEma4H * (1.0 - emaCoeff);
        ema4HClosedArr[i] = pEma4H;
    }

    // 1H ATR & SMA
    let prevAtr = 0;
    for (let i = 0; i < N1H; i++) {
        const h = data1H[i].high, l = data1H[i].low;
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
            kH = Math.max(kH, data1H[i - j].high);
            kL = Math.min(kL, data1H[i - j].low);
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

    let dIdx = 0, fourHIdx = 0;
    for (let i = 0; i < N1H; i++) {
        const t1H = data1H[i].time;
        const c1H = data1H[i].close;
        while (dIdx + 1 < confirmedRegime1DByDay.length && confirmedRegime1DByDay[dIdx + 1].closeTime <= t1H) dIdx++;
        regime1DArr[i] = confirmedRegime1DByDay[dIdx] ? confirmedRegime1DByDay[dIdx].lastRegime : 0;
        while (fourHIdx + 1 < N4H && (data4H[fourHIdx + 1].time + 14400000 - 1) <= t1H) fourHIdx++;
        const prevClosedEma4H = ema4HClosedArr[fourHIdx] || c1H;
        ema4HLiveArr[i] = emaCoeff * c1H + (1.0 - emaCoeff) * prevClosedEma4H;
    }

    let prevBuy2Cond = false, prevSell2Cond = false;
    const rawSignals = [];

    for (let i = 53; i < N1H; i++) {
        const c = data1H[i].close, prevC = data1H[i - 1].close;
        const curSa = sa1H[i], curSb = sb1H[i], prevSa = sa1H[i - 1], prevSb = sb1H[i - 1];
        const top1H = Math.max(curSa, curSb), bot1H = Math.min(curSa, curSb);
        const prevTop1H = Math.max(prevSa, prevSb), prevBot1H = Math.min(prevSa, prevSb);
        const cur1DReg = regime1DArr[i], curEma4HLive = ema4HLiveArr[i];

        const above4HEMA = c > curEma4HLive, below4HEMA = c < curEma4HLive;
        const bullish = (cur1DReg === 1) && above4HEMA, bearish = (cur1DReg === -1) && below4HEMA;
        const enterUp1H = (c > top1H) && (prevC <= prevTop1H), enterDown1H = (c < bot1H) && (prevC >= prevBot1H);
        const above1HCloud = c > top1H, below1HCloud = c < bot1H;

        const buy2Cond = bullish && above1HCloud, sell2Cond = bearish && below1HCloud;
        const buySignal1 = bullish && enterUp1H, sellSignal1 = bearish && enterDown1H;
        const buySignal2 = buy2Cond && !prevBuy2Cond, sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond; prevSell2Cond = sell2Cond;

        let sig = null;
        if (buySignal1) sig = { index: i, type: 'BUY1', isBuy: true, price: c };
        else if (sellSignal1) sig = { index: i, type: 'SELL1', isBuy: false, price: c };
        else if (buySignal2) sig = { index: i, type: 'BUY2', isBuy: true, price: c };
        else if (sellSignal2) sig = { index: i, type: 'SELL2', isBuy: false, price: c };

        if (sig) rawSignals.push(sig);
    }

    return { sa1H, sb1H, kijun1H, ema4HLiveArr, regime1DArr, atrArr, atr50SmaArr, vol20SmaArr, rawSignals };
}

// Signal Type Distribution
async function analyze() {
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 3000);
    const data4H = await fetchBinanceKlines('BTCUSDT', '4h', 1000);
    const data1D = await fetchBinanceKlines('BTCUSDT', '1d', 500);

    const ind = computeIndicators(data1H, data4H, data1D);

    const typeCounts = { BUY1: 0, SELL1: 0, BUY2: 0, SELL2: 0 };
    ind.rawSignals.forEach(s => typeCounts[s.type]++);
    console.log('📊 Sinyal Dağılımı:', typeCounts);

    // Test: What if we take BUY1 with 1.8R, and BUY2 (trend confirmation) with 2.8R?
    // What if we take SELL signals with tighter stops?
    const asymmetricGrid = [];

    for (let slBuy1 of [1.2, 1.5, 1.8, 2.2]) {
        for (let tpBuy1 of [1.8, 2.2, 2.8]) {
            for (let slBuy2 of [1.4, 1.8, 2.4]) {
                for (let tpBuy2 of [2.5, 3.2, 4.0]) {
                    for (let slSell of [1.2, 1.5, 2.0]) {
                        for (let tpSell of [1.8, 2.5, 3.2]) {
                            asymmetricGrid.push({
                                slBuy1, tpBuy1, slBuy2, tpBuy2, slSell, tpSell
                            });
                        }
                    }
                }
            }
        }
    }

    console.log(`🚀 Asimetrik Sinyal Tipi Grid Taranıyor: ${asymmetricGrid.length} kombinasyon...`);

    let bestConfig = null;
    let bestCapital = -Infinity;
    let bestWinRate = 0;
    let bestReturn = 0;

    for (const conf of asymmetricGrid) {
        let capital = 1000.0;
        let tpCount = 0, slCount = 0;

        for (const sig of ind.rawSignals) {
            const i = sig.index;
            const c = sig.price;
            const isBuy = sig.isBuy;
            const atr = ind.atrArr[i];

            let slMult = 1.5, tpMult = 2.5;
            if (sig.type === 'BUY1') { slMult = conf.slBuy1; tpMult = conf.tpBuy1; }
            else if (sig.type === 'BUY2') { slMult = conf.slBuy2; tpMult = conf.tpBuy2; }
            else { slMult = conf.slSell; tpMult = conf.tpSell; }

            const sl = isBuy ? (c - atr * slMult) : (c + atr * slMult);
            const tp = isBuy ? (c + atr * tpMult) : (c - atr * tpMult);

            let exitPrice = c;
            for (let step = i + 1; step < data1H.length; step++) {
                const bH = data1H[step].high, bL = data1H[step].low;
                if (isBuy) {
                    if (bH >= tp && bL > sl) { exitPrice = tp; break; }
                    else if (bL <= sl && bH < tp) { exitPrice = sl; break; }
                    else if (bH >= tp && bL <= sl) {
                        exitPrice = data1H[step].close >= data1H[step].open ? tp : sl;
                        break;
                    }
                } else {
                    if (bL <= tp && bH < sl) { exitPrice = tp; break; }
                    else if (bH >= sl && bL > tp) { exitPrice = sl; break; }
                    else if (bL <= tp && bH >= sl) {
                        exitPrice = data1H[step].close <= data1H[step].open ? tp : sl;
                        break;
                    }
                }
            }

            const pnlPct = isBuy ? ((exitPrice - c) / c) * 100 : ((c - exitPrice) / c) * 100;
            if (pnlPct >= 0) tpCount++;
            else slCount++;
            capital = capital * (1.0 + pnlPct / 100.0);
        }

        if (capital > bestCapital) {
            bestCapital = capital;
            bestWinRate = (tpCount / (tpCount + slCount)) * 100;
            bestReturn = ((capital - 1000) / 1000) * 100;
            bestConfig = { conf, tpCount, slCount, bestWinRate, bestCapital, bestReturn };
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🏆 ASİMETRİK SİNYAL TİPİ EN İYİ KOMBİNASYON (ASYMMETRIC OPTIMAL SL/TP)');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log(JSON.stringify(bestConfig, null, 2));
}

analyze().catch(console.error);
