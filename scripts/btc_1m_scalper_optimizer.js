// ==============================================================================
// ⚡ BTC/USDT 1-DAKİKALIK (1M) QUANT SCALPING MOTORU VE OPTİMİZASYONU
// ==============================================================================
import fs from 'fs';

console.log('⚡ 1-Dakikalık (1m) Scalping MTF Verisi Binance\'ten Çekiliyor...');
console.log('   - 1m Grafik: 3.000 Mum (Son ~2 gün)');
console.log('   - 5m EMA Trend: 1.000 Mum');
console.log('   - 1H Ichimoku Rejim: 500 Mum');

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

function computeScalpIndicators(data1M, data5M, data1H) {
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

    // 1. ÜST REJİM: 1H ICHIMOKU BULUTU (60x Zaman Dilimi)
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

    // 2. ORTA VADE TREND: 5M EMA26 (5x Zaman Dilimi)
    const ema5MClosedArr = new Float32Array(N5M);
    let pEma5M = data5M[0] ? data5M[0].close : 0;
    for (let i = 0; i < N5M; i++) {
        pEma5M = data5M[i].close * emaCoeff + pEma5M * (1.0 - emaCoeff);
        ema5MClosedArr[i] = pEma5M;
    }

    // 3. 1M ATR VE ICHIMOKU
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

    // Eşleştirme
    let hIdx = 0, fiveMIdx = 0;
    for (let i = 0; i < N1M; i++) {
        const t1M = data1M[i].time;
        const c1M = data1M[i].close;

        while (hIdx + 1 < confirmedRegime1HList.length && confirmedRegime1HList[hIdx + 1].closeTime <= t1M) {
            hIdx++;
        }
        regime1HArr[i] = confirmedRegime1HList[hIdx] ? confirmedRegime1HList[hIdx].lastRegime : 0;

        while (fiveMIdx + 1 < N5M && (data5M[fiveMIdx + 1].time + 300000 - 1) <= t1M) {
            fiveMIdx++;
        }
        const prevClosedEma5M = ema5MClosedArr[fiveMIdx] || c1M;
        ema5MLiveArr[i] = emaCoeff * c1M + (1.0 - emaCoeff) * prevClosedEma5M;
    }

    // 1M Sinyalleri
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

async function run1MQuant() {
    const data1M = await fetchBinanceKlines('BTCUSDT', '1m', 3000);
    const data5M = await fetchBinanceKlines('BTCUSDT', '5m', 1000);
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 500);

    console.log(`✅ 1m Scalping verileri çekildi: 1m (${data1M.length}), 5m (${data5M.length}), 1h (${data1H.length})`);

    const ind = computeScalpIndicators(data1M, data5M, data1H);
    console.log(`⚡ 1-Dakikalık Grafikte Üretilen Scalp Sinyali: ${ind.rawSignals.length} adet (Son ~2 Günde!)`);

    // Hızlı Scalping Simülasyonu
    const scalpGrid = [];
    for (let sl of [1.2, 1.5, 1.8, 2.2]) {
        for (let tp of [1.5, 2.0, 2.5, 3.0, 3.5]) {
            let capital = 1000.0;
            let tpCount = 0, slCount = 0;

            for (const sig of ind.rawSignals) {
                const i = sig.index;
                const c = sig.price;
                const isBuy = sig.isBuy;
                const atr = ind.atrArr[i] || 1;

                const slPrice = isBuy ? (c - atr * sl) : (c + atr * sl);
                const tpPrice = isBuy ? (c + atr * tp) : (c - atr * tp);

                let exitPrice = c;
                for (let step = i + 1; step < data1M.length; step++) {
                    const bH = data1M[step].high, bL = data1M[step].low;
                    if (isBuy) {
                        if (bH >= tpPrice && bL > slPrice) { exitPrice = tpPrice; break; }
                        else if (bL <= slPrice && bH < tpPrice) { exitPrice = slPrice; break; }
                        else if (bH >= tpPrice && bL <= slPrice) {
                            exitPrice = data1M[step].close >= data1M[step].open ? tpPrice : slPrice;
                            break;
                        }
                    } else {
                        if (bL <= tpPrice && bH < slPrice) { exitPrice = tpPrice; break; }
                        else if (bH >= slPrice && bL > tpPrice) { exitPrice = slPrice; break; }
                        else if (bL <= tpPrice && bH >= slPrice) {
                            exitPrice = data1M[step].close <= data1M[step].open ? tpPrice : slPrice;
                            break;
                        }
                    }
                }

                const pnl = isBuy ? ((exitPrice - c) / c) * 100 : ((c - exitPrice) / c) * 100;
                if (pnl >= 0) tpCount++;
                else slCount++;
                capital = capital * (1.0 + pnl / 100.0);
            }

            const winRate = (tpCount / (tpCount + slCount)) * 100;
            const ret = ((capital - 1000) / 1000) * 100;
            scalpGrid.push({ sl, tp, tpCount, slCount, total: tpCount + slCount, winRate, capital, ret });
        }
    }

    scalpGrid.sort((a, b) => b.ret - a.ret);

    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('⚡ 1-DAKİKALIK (1M) SCALPING EN KÂRLI İLK 5 STRATEJİ');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(5, scalpGrid.length); i++) {
        const s = scalpGrid[i];
        console.log(`#${i + 1} | SL: ${s.sl}x ATR / TP: ${s.tp}x ATR (R:R 1:${(s.tp/s.sl).toFixed(2)})`);
        console.log(`   💰 $1.000 -> $${s.capital.toFixed(2)} (+%${s.ret.toFixed(2)})`);
        console.log(`   🎯 Kazanma Oranı: %${s.winRate.toFixed(1)} | Toplam Hızlı İşlem: ${s.total} (TP: ${s.tpCount}, SL: ${s.slCount})\n`);
    }
}

run1MQuant().catch(console.error);
