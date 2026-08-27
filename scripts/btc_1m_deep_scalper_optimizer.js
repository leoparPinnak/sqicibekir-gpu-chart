// ==============================================================================
// 🔬 BTC 1-DAKİKALIK (1M) DERİN QUANT SCALPING OPTİMİZASYON LABORATUVARI
// ==============================================================================
import fs from 'fs';

console.log('⚡ 1-Dakikalık (1m) BTC Verileri Çekiliyor...');

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

function compute1MIndicators(data1M, data5M, data1H) {
    const N1M = data1M.length;
    const N5M = data5M.length;
    const N1H = data1H.length;

    const sa1M = new Float32Array(N1M);
    const sb1M = new Float32Array(N1M);
    const kijun1M = new Float32Array(N1M);
    const ema5MLiveArr = new Float32Array(N1M);
    const regime1HArr = new Float32Array(N1M);
    const atrArr = new Float32Array(N1M);
    const vol20SmaArr = new Float32Array(N1M);

    const convLen = 9, baseLen = 26, spanBLen = 52, disp = 26, emaLen = 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    // 1H ICHIMOKU REJİM (60x)
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
        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1H[i - j].high);
            sBL = Math.min(sBL, data1H[i - j].low);
        }
        sa1HRaw[i] = (tenkan + kijun) / 2;
        sb1HRaw[i] = (sBH + sBL) / 2;
    }

    let lastRegime1H = 0;
    const confirmedRegime1HList = [];
    for (let i = 0; i < N1H; i++) {
        const shiftedA = (i >= disp) ? sa1HRaw[i - disp] : sa1HRaw[i];
        const shiftedB = (i >= disp) ? sb1HRaw[i - disp] : sb1HRaw[i];
        const cloudTop = Math.max(shiftedA, shiftedB);
        const cloudBot = Math.min(shiftedA, shiftedB);
        const c = data1H[i].close;

        let rawRegime = 0;
        if (c > cloudTop) rawRegime = 1;
        else if (c < cloudBot) rawRegime = -1;
        if (rawRegime === 1 || rawRegime === -1) lastRegime1H = rawRegime;

        confirmedRegime1HList.push({
            time: data1H[i].time,
            closeTime: data1H[i].time + 3600000 - 1,
            lastRegime: lastRegime1H
        });
    }

    // 5M EMA26 (5x)
    const ema5MClosedArr = new Float32Array(N5M);
    let pEma5M = data5M[0] ? data5M[0].close : 0;
    for (let i = 0; i < N5M; i++) {
        pEma5M = data5M[i].close * emaCoeff + pEma5M * (1.0 - emaCoeff);
        ema5MClosedArr[i] = pEma5M;
    }

    // 1M ATR VE ICHIMOKU
    let prevAtr = 0;
    for (let i = 0; i < N1M; i++) {
        const h = data1M[i].high, l = data1M[i].low;
        const pc = i > 0 ? data1M[i - 1].close : data1M[i].open;
        const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        if (i === 0) prevAtr = tr;
        else if (i < 14) prevAtr = (prevAtr * i + tr) / (i + 1);
        else prevAtr = (prevAtr * 13 + tr) / 14;
        atrArr[i] = prevAtr;

        let volSum = 0;
        const volLook = Math.min(i + 1, 20);
        for (let k = 0; k < volLook; k++) volSum += data1M[i - k].vol;
        vol20SmaArr[i] = volSum / volLook;
    }

    const sa1MRaw = new Float32Array(N1M);
    const sb1MRaw = new Float32Array(N1M);
    for (let i = 0; i < N1M; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, data1M[i - j].high);
            tL = Math.min(tL, data1M[i - j].low);
        }
        const tenkan = (tH + tL) / 2;
        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, data1M[i - j].high);
            kL = Math.min(kL, data1M[i - j].low);
        }
        const kijun = (kH + kL) / 2;
        kijun1M[i] = kijun;

        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1M[i - j].high);
            sBL = Math.min(sBL, data1M[i - j].low);
        }
        sa1MRaw[i] = (tenkan + kijun) / 2;
        sb1MRaw[i] = (sBH + sBL) / 2;
    }

    for (let i = 0; i < N1M; i++) {
        sa1M[i] = (i >= disp) ? sa1MRaw[i - disp] : sa1MRaw[i];
        sb1M[i] = (i >= disp) ? sb1MRaw[i - disp] : sb1MRaw[i];
    }

    // Match
    let hIdx = 0, fiveMIdx = 0;
    for (let i = 0; i < N1M; i++) {
        const t1M = data1M[i].time;
        const c1M = data1M[i].close;

        while (hIdx + 1 < confirmedRegime1HList.length && confirmedRegime1HList[hIdx + 1].closeTime <= t1M) hIdx++;
        regime1HArr[i] = confirmedRegime1HList[hIdx] ? confirmedRegime1HList[hIdx].lastRegime : 0;

        while (fiveMIdx + 1 < N5M && (data5M[fiveMIdx + 1].time + 300000 - 1) <= t1M) fiveMIdx++;
        const prevClosedEma5M = ema5MClosedArr[fiveMIdx] || c1M;
        ema5MLiveArr[i] = emaCoeff * c1M + (1.0 - emaCoeff) * prevClosedEma5M;
    }

    let prevBuy2Cond = false, prevSell2Cond = false;
    const rawSignals = [];

    for (let i = 53; i < N1M; i++) {
        const c = data1M[i].close, prevC = data1M[i - 1].close;
        const curSa = sa1M[i], curSb = sb1M[i], prevSa = sa1M[i - 1], prevSb = sb1M[i - 1];
        const top1M = Math.max(curSa, curSb), bot1M = Math.min(curSa, curSb);
        const prevTop1M = Math.max(prevSa, prevSb), prevBot1M = Math.min(prevSa, prevSb);

        const cur1HReg = regime1HArr[i], curEma5MLive = ema5MLiveArr[i];
        const above5MEma = c > curEma5MLive, below5MEma = c < curEma5MLive;

        const bullish = (cur1HReg === 1) && above5MEma;
        const bearish = (cur1HReg === -1) && below5MEma;

        const enterUp1M = (c > top1M) && (prevC <= prevTop1M);
        const enterDown1M = (c < bot1M) && (prevC >= prevBot1M);

        const above1MCloud = c > top1M, below1MCloud = c < bot1M;

        const buy2Cond = bullish && above1MCloud;
        const sell2Cond = bearish && below1MCloud;

        const buySignal1 = bullish && enterUp1M;
        const sellSignal1 = bearish && enterDown1M;
        const buySignal2 = buy2Cond && !prevBuy2Cond;
        const sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond; prevSell2Cond = sell2Cond;

        let sig = null;
        if (buySignal1) sig = { index: i, type: 'BUY1', isBuy: true, price: c, time: data1M[i].time };
        else if (sellSignal1) sig = { index: i, type: 'SELL1', isBuy: false, price: c, time: data1M[i].time };
        else if (buySignal2) sig = { index: i, type: 'BUY2', isBuy: true, price: c, time: data1M[i].time };
        else if (sellSignal2) sig = { index: i, type: 'SELL2', isBuy: false, price: c, time: data1M[i].time };

        if (sig) rawSignals.push(sig);
    }

    return { sa1M, sb1M, kijun1M, ema5MLiveArr, regime1HArr, atrArr, vol20SmaArr, rawSignals };
}

// -------------------------------------------------------------
// 1M SİMÜLASYON MOTORU
// -------------------------------------------------------------
function simulate1MScalp(config, data1M, ind) {
    const { rawSignals, sa1M, sb1M, kijun1M, atrArr, vol20SmaArr } = ind;
    const N1M = data1M.length;

    let capital = 1000.0;
    let tpCount = 0, slCount = 0;
    let maxCapital = 1000.0;
    let maxDrawdownPct = 0;

    for (const sig of rawSignals) {
        const i = sig.index;
        const c = sig.price;
        const isBuy = sig.isBuy;
        const atr = atrArr[i] || 1;

        // Filtre: RVOL
        if (config.minRvol && vol20SmaArr[i] > 0) {
            const rvol = data1M[i].vol / vol20SmaArr[i];
            if (rvol < config.minRvol) continue;
        }

        // SL & TP Belirleme
        let sl = 0, tp = 0;
        if (config.typeMode) {
            // Sinyal tipine göre özel SL/TP
            if (sig.type === 'BUY1') { sl = c - atr * config.slBuy1; tp = c + atr * config.tpBuy1; }
            else if (sig.type === 'BUY2') { sl = c - atr * config.slBuy2; tp = c + atr * config.tpBuy2; }
            else if (sig.type === 'SELL1') { sl = c + atr * config.slSell1; tp = c - atr * config.tpSell1; }
            else { sl = c + atr * config.slSell2; tp = c - atr * config.tpSell2; }
        } else if (config.structureMode) {
            let sL = Infinity, sH = -Infinity;
            const lookback = config.swingLookback || 5;
            for (let k = 0; k < lookback; k++) {
                const pIdx = Math.max(0, i - k);
                if (data1M[pIdx].low < sL) sL = data1M[pIdx].low;
                if (data1M[pIdx].high > sH) sH = data1M[pIdx].high;
            }
            const buf = atr * (config.buffer || 0.2);
            if (isBuy) {
                const dist = Math.max(0.8 * atr, Math.min(2.5 * atr, c - (sL - buf)));
                sl = c - dist;
                tp = c + dist * config.rr;
            } else {
                const dist = Math.max(0.8 * atr, Math.min(2.5 * atr, (sH + buf) - c));
                sl = c + dist;
                tp = c - dist * config.rr;
            }
        } else {
            sl = isBuy ? (c - atr * config.sl) : (c + atr * config.sl);
            tp = isBuy ? (c + atr * config.tp) : (c - atr * config.tp);
        }

        let currentDynamicStop = sl;
        let highestProfitAtr = 0;
        let exitPrice = c;
        let durationBars = 0;

        for (let step = i + 1; step < N1M; step++) {
            durationBars++;
            const bH = data1M[step].high, bL = data1M[step].low;
            const curProfitAtr = isBuy ? (bH - c) / atr : (c - bL) / atr;
            if (curProfitAtr > highestProfitAtr) highestProfitAtr = curProfitAtr;

            // 1. Erken Breakeven
            if (config.beTrigger && highestProfitAtr >= config.beTrigger) {
                const bePrice = isBuy ? (c + atr * config.beBuffer) : (c - atr * config.beBuffer);
                if (isBuy && bePrice > currentDynamicStop) currentDynamicStop = bePrice;
                if (!isBuy && bePrice < currentDynamicStop) currentDynamicStop = bePrice;
            }

            // 2. Trailing Stop
            if (config.trailTrigger && highestProfitAtr >= config.trailTrigger) {
                const trailPrice = isBuy ? (bH - atr * config.trailDist) : (bL + atr * config.trailDist);
                if (isBuy && trailPrice > currentDynamicStop) currentDynamicStop = trailPrice;
                if (!isBuy && trailPrice < currentDynamicStop) currentDynamicStop = trailPrice;
            }

            // 3. Zaman Filtresi (Time-Stop): Eğer N barda hedefe gitmediyse kârda/küçük zararda çık
            if (config.maxHoldBars && durationBars >= config.maxHoldBars) {
                exitPrice = data1M[step].close;
                break;
            }

            if (isBuy) {
                const hitTp = bH >= tp;
                const hitSl = bL <= currentDynamicStop;
                if (hitTp && !hitSl) { exitPrice = tp; break; }
                else if (hitSl && !hitTp) { exitPrice = currentDynamicStop; break; }
                else if (hitTp && hitSl) {
                    exitPrice = data1M[step].close >= data1M[step].open ? tp : currentDynamicStop;
                    break;
                }
            } else {
                const hitTp = bL <= tp;
                const hitSl = bH >= currentDynamicStop;
                if (hitTp && !hitSl) { exitPrice = tp; break; }
                else if (hitSl && !hitTp) { exitPrice = currentDynamicStop; break; }
                else if (hitTp && hitSl) {
                    exitPrice = data1M[step].close <= data1M[step].open ? tp : currentDynamicStop;
                    break;
                }
            }
        }

        const pnl = isBuy ? ((exitPrice - c) / c) * 100 : ((c - exitPrice) / c) * 100;
        if (pnl >= 0) tpCount++;
        else slCount++;

        capital = capital * (1.0 + pnl / 100.0);
        if (capital > maxCapital) maxCapital = capital;
        const dd = ((maxCapital - capital) / maxCapital) * 100;
        if (dd > maxDrawdownPct) maxDrawdownPct = dd;
    }

    const total = tpCount + slCount;
    const winRate = total > 0 ? (tpCount / total) * 100 : 0;
    const ret = ((capital - 1000) / 1000) * 100;

    return { config, total, tpCount, slCount, winRate, capital, ret, maxDrawdownPct };
}

async function runOptimization() {
    const data1M = await fetchBinanceKlines('BTCUSDT', '1m', 3000);
    const data5M = await fetchBinanceKlines('BTCUSDT', '5m', 1000);
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 500);

    const ind = compute1MIndicators(data1M, data5M, data1H);
    console.log(`✅ 1m Binance Verileri: ${data1M.length} mum, Üretilen Sinyal: ${ind.rawSignals.length} adet\n`);

    const grid = [];

    // GRUP 1: Hızlı Breakeven & Trailing Scalper (500 kombinasyon)
    for (let sl of [0.8, 1.0, 1.2, 1.5]) {
        for (let tp of [1.2, 1.5, 2.0, 2.5, 3.0]) {
            for (let beTrig of [0, 0.5, 0.7, 0.9]) {
                for (let beBuf of [0.02, 0.08]) {
                    grid.push({
                        name: `⚡ Fast Scalp SL:${sl}x TP:${tp}x BE:${beTrig}x`,
                        sl, tp, beTrigger: beTrig, beBuffer: beBuf,
                        typeMode: false, structureMode: false
                    });
                }
            }
        }
    }

    // GRUP 2: Micro-Structure Scalp (Swing Low/High + Kijun) (300 kombinasyon)
    for (let lookback of [3, 5, 8]) {
        for (let buffer of [0.1, 0.2, 0.3]) {
            for (let rr of [1.2, 1.5, 1.8, 2.2]) {
                for (let beTrig of [0, 0.6, 0.8]) {
                    grid.push({
                        name: `🏛️ Micro-Structure Lookback:${lookback} Buf:${buffer} RR:${rr} BE:${beTrig}`,
                        structureMode: true,
                        swingLookback: lookback,
                        buffer,
                        rr,
                        beTrigger: beTrig,
                        beBuffer: 0.05
                    });
                }
            }
        }
    }

    // GRUP 3: Sinyal Tipi Asimetrik Scalp (BUY1 vs BUY2 vs SELL) (600 kombinasyon)
    for (let slBuy1 of [1.0, 1.4]) {
        for (let tpBuy1 of [1.2, 1.8]) {
            for (let slBuy2 of [0.8, 1.2]) {
                for (let tpBuy2 of [2.0, 2.8, 3.5]) {
                    for (let slSell of [0.8, 1.2]) {
                        for (let tpSell of [1.5, 2.2]) {
                            grid.push({
                                name: `🎯 Asymmetric Scalp B1[${slBuy1}/${tpBuy1}] B2[${slBuy2}/${tpBuy2}] S[${slSell}/${tpSell}]`,
                                typeMode: true,
                                slBuy1, tpBuy1, slBuy2, tpBuy2,
                                slSell1: slSell, tpSell1: tpSell,
                                slSell2: slSell, tpSell2: tpSell,
                                beTrigger: 0.6, beBuffer: 0.05
                            });
                        }
                    }
                }
            }
        }
    }

    console.log(`🔥 1M İçin Taranan Toplam Scalping Strateji Kombinasyonu: ${grid.length} adet...`);

    const results = [];
    for (const g of grid) {
        results.push(simulate1MScalp(g, data1M, ind));
    }

    // 1. En Yüksek Kazanma Oranına (Win Rate) Göre
    results.sort((a, b) => b.winRate - a.winRate);
    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🎯 1-DAKİKA İÇİN EN YÜKSEK BAŞARI / KAZANMA ORANI (% WIN RATE) LİDERLERİ');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(5, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1} | ${r.config.name}`);
        console.log(`   🎯 Kazanma Oranı: %${r.winRate.toFixed(1)} | Başarılı: ${r.tpCount} TP / ${r.slCount} SL (Toplam: ${r.total})`);
        console.log(`   💰 $1.000 -> $${r.capital.toFixed(2)} (+%${r.ret.toFixed(2)}) | Max DD: -%${r.maxDrawdownPct.toFixed(1)}\n`);
    }

    // 2. En Yüksek Kümülatif Kâra Göre
    results.sort((a, b) => b.ret - a.ret);
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('💰 1-DAKİKA İÇİN EN YÜKSEK KÜMÜLATİF GETİRİ SAĞLAYAN STRATEJİLER');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(5, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1} | ${r.config.name}`);
        console.log(`   💰 $1.000 -> $${r.capital.toFixed(2)} (+%${r.ret.toFixed(2)})`);
        console.log(`   🎯 Kazanma Oranı: %${r.winRate.toFixed(1)} | ${r.tpCount} TP / ${r.slCount} SL | Max DD: -%${r.maxDrawdownPct.toFixed(1)}\n`);
    }
}

runOptimization().catch(console.error);
