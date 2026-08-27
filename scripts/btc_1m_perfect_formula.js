// ==============================================================================
// 🏆 1M DAKİKALIK ŞAMPİYON FORMÜL ARAYIŞI (HEM KÂR HEM % WIN RATE EN İYİLEME)
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

function compute1M(data1M, data5M, data1H) {
    const N1M = data1M.length, N5M = data5M.length, N1H = data1H.length;
    const sa1M = new Float32Array(N1M), sb1M = new Float32Array(N1M), kijun1M = new Float32Array(N1M);
    const ema5MLiveArr = new Float32Array(N1M), regime1HArr = new Float32Array(N1M), atrArr = new Float32Array(N1M), vol20SmaArr = new Float32Array(N1M);
    const convLen = 9, baseLen = 26, spanBLen = 52, disp = 26, emaLen = 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    // 1H
    const sa1HRaw = new Float32Array(N1H), sb1HRaw = new Float32Array(N1H);
    for (let i = 0; i < N1H; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, data1H[i - j].high); tL = Math.min(tL, data1H[i - j].low);
        }
        const tenkan = (tH + tL) / 2;
        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, data1H[i - j].high); kL = Math.min(kL, data1H[i - j].low);
        }
        const kijun = (kH + kL) / 2;
        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1H[i - j].high); sBL = Math.min(sBL, data1H[i - j].low);
        }
        sa1HRaw[i] = (tenkan + kijun) / 2; sb1HRaw[i] = (sBH + sBL) / 2;
    }

    let lastRegime1H = 0;
    const confirmedRegime1HList = [];
    for (let i = 0; i < N1H; i++) {
        const shiftedA = (i >= disp) ? sa1HRaw[i - disp] : sa1HRaw[i];
        const shiftedB = (i >= disp) ? sb1HRaw[i - disp] : sb1HRaw[i];
        const cloudTop = Math.max(shiftedA, shiftedB), cloudBot = Math.min(shiftedA, shiftedB);
        const c = data1H[i].close;
        let rawRegime = 0;
        if (c > cloudTop) rawRegime = 1; else if (c < cloudBot) rawRegime = -1;
        if (rawRegime === 1 || rawRegime === -1) lastRegime1H = rawRegime;
        confirmedRegime1HList.push({ time: data1H[i].time, closeTime: data1H[i].time + 3600000 - 1, lastRegime: lastRegime1H });
    }

    // 5M EMA
    const ema5MClosedArr = new Float32Array(N5M);
    let pEma5M = data5M[0] ? data5M[0].close : 0;
    for (let i = 0; i < N5M; i++) {
        pEma5M = data5M[i].close * emaCoeff + pEma5M * (1.0 - emaCoeff);
        ema5MClosedArr[i] = pEma5M;
    }

    // 1M ATR
    let prevAtr = 0;
    for (let i = 0; i < N1M; i++) {
        const h = data1M[i].high, l = data1M[i].low, pc = i > 0 ? data1M[i - 1].close : data1M[i].open;
        const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        if (i === 0) prevAtr = tr; else if (i < 14) prevAtr = (prevAtr * i + tr) / (i + 1); else prevAtr = (prevAtr * 13 + tr) / 14;
        atrArr[i] = prevAtr;
        let volSum = 0; const volLook = Math.min(i + 1, 20);
        for (let k = 0; k < volLook; k++) volSum += data1M[i - k].vol;
        vol20SmaArr[i] = volSum / volLook;
    }

    const sa1MRaw = new Float32Array(N1M), sb1MRaw = new Float32Array(N1M);
    for (let i = 0; i < N1M; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, data1M[i - j].high); tL = Math.min(tL, data1M[i - j].low);
        }
        const tenkan = (tH + tL) / 2;
        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, data1M[i - j].high); kL = Math.min(kL, data1M[i - j].low);
        }
        const kijun = (kH + kL) / 2; kijun1M[i] = kijun;
        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, data1M[i - j].high); sBL = Math.min(sBL, data1M[i - j].low);
        }
        sa1MRaw[i] = (tenkan + kijun) / 2; sb1MRaw[i] = (sBH + sBL) / 2;
    }
    for (let i = 0; i < N1M; i++) {
        sa1M[i] = (i >= disp) ? sa1MRaw[i - disp] : sa1MRaw[i];
        sb1M[i] = (i >= disp) ? sb1MRaw[i - disp] : sb1MRaw[i];
    }

    let hIdx = 0, fiveMIdx = 0;
    for (let i = 0; i < N1M; i++) {
        const t1M = data1M[i].time, c1M = data1M[i].close;
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
        const bullish = (cur1HReg === 1) && above5MEma, bearish = (cur1HReg === -1) && below5MEma;
        const enterUp1M = (c > top1M) && (prevC <= prevTop1M), enterDown1M = (c < bot1M) && (prevC >= prevBot1M);
        const above1MCloud = c > top1M, below1MCloud = c < bot1M;
        const buy2Cond = bullish && above1MCloud, sell2Cond = bearish && below1MCloud;
        const buySignal1 = bullish && enterUp1M, sellSignal1 = bearish && enterDown1M;
        const buySignal2 = buy2Cond && !prevBuy2Cond, sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond; prevSell2Cond = sell2Cond;

        let sig = null;
        if (buySignal1) sig = { index: i, type: 'BUY1', isBuy: true, price: c };
        else if (sellSignal1) sig = { index: i, type: 'SELL1', isBuy: false, price: c };
        else if (buySignal2) sig = { index: i, type: 'BUY2', isBuy: true, price: c };
        else if (sellSignal2) sig = { index: i, type: 'SELL2', isBuy: false, price: c };
        if (sig) rawSignals.push(sig);
    }

    return { sa1M, sb1M, kijun1M, ema5MLiveArr, regime1HArr, atrArr, vol20SmaArr, rawSignals };
}

async function findPerfect1M() {
    const data1M = await fetchBinanceKlines('BTCUSDT', '1m', 3000);
    const data5M = await fetchBinanceKlines('BTCUSDT', '5m', 1000);
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 500);

    const ind = compute1M(data1M, data5M, data1H);

    console.log(`📊 Toplam 1m Sinyal: ${ind.rawSignals.length} adet`);

    // Sinyalleri tiplerine göre inceleyelim
    const stats = { BUY1: 0, SELL1: 0, BUY2: 0, SELL2: 0 };
    ind.rawSignals.forEach(s => stats[s.type]++);
    console.log('📈 Sinyal Dağılımı:', stats);

    // Kapsamlı Arama: Sinyal Onay Filtresi (Eğer 5m EMA'dan çok uzaktaysa girme, Kijun yakınsa gir)
    const experiments = [];

    for (let slAtr of [0.8, 1.0, 1.2, 1.5, 1.8]) {
        for (let tpAtr of [1.0, 1.4, 1.8, 2.2, 2.6, 3.2]) {
            for (let beTrig of [0, 0.6, 0.8, 1.0]) {
                for (let maxKijunDist of [0, 1.2, 1.8]) {
                    let capital = 1000.0;
                    let tpCount = 0, slCount = 0;

                    for (const sig of ind.rawSignals) {
                        const i = sig.index;
                        const c = sig.price;
                        const isBuy = sig.isBuy;
                        const atr = ind.atrArr[i];
                        const kDist = Math.abs(c - ind.kijun1M[i]) / atr;

                        if (maxKijunDist > 0 && kDist > maxKijunDist) continue;

                        const sl = isBuy ? (c - atr * slAtr) : (c + atr * slAtr);
                        const tp = isBuy ? (c + atr * tpAtr) : (c - atr * tpAtr);

                        let curStop = sl;
                        let maxProfitAtr = 0;
                        let exitPrice = c;

                        for (let step = i + 1; step < data1M.length; step++) {
                            const bH = data1M[step].high, bL = data1M[step].low;
                            const pAtr = isBuy ? (bH - c) / atr : (c - bL) / atr;
                            if (pAtr > maxProfitAtr) maxProfitAtr = pAtr;

                            if (beTrig > 0 && maxProfitAtr >= beTrig) {
                                const be = isBuy ? (c + atr * 0.05) : (c - atr * 0.05);
                                if (isBuy && be > curStop) curStop = be;
                                if (!isBuy && be < curStop) curStop = be;
                            }

                            if (isBuy) {
                                if (bH >= tp && bL > curStop) { exitPrice = tp; break; }
                                else if (bL <= curStop && bH < tp) { exitPrice = curStop; break; }
                                else if (bH >= tp && bL <= curStop) { exitPrice = data1M[step].close >= data1M[step].open ? tp : curStop; break; }
                            } else {
                                if (bL <= tp && bH < curStop) { exitPrice = tp; break; }
                                else if (bH >= curStop && bL > tp) { exitPrice = curStop; break; }
                                else if (bL <= tp && bH >= curStop) { exitPrice = data1M[step].close <= data1M[step].open ? tp : curStop; break; }
                            }
                        }

                        const pnl = isBuy ? ((exitPrice - c) / c) * 100 : ((c - exitPrice) / c) * 100;
                        if (pnl >= 0) tpCount++; else slCount++;
                        capital = capital * (1.0 + pnl / 100.0);
                    }

                    const total = tpCount + slCount;
                    if (total >= 30) {
                        const winRate = (tpCount / total) * 100;
                        const ret = ((capital - 1000) / 1000) * 100;
                        experiments.push({ slAtr, tpAtr, beTrig, maxKijunDist, total, tpCount, slCount, winRate, capital, ret });
                    }
                }
            }
        }
    }

    // Skor Formülü: WinRate * TotalReturn
    experiments.sort((a, b) => (b.winRate * (b.ret + 10)) - (a.winRate * (a.ret + 10)));

    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🏆 1-DAKİKA İÇİN EN İYİ DENGELİ FORMÜL (EN YÜKSEK WIN RATE + POZİTİF KÂR)');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(5, experiments.length); i++) {
        const e = experiments[i];
        console.log(`#${i + 1} | SL: ${e.slAtr}x ATR | TP: ${e.tpAtr}x ATR | BE: ${e.beTrig}x | KijunFiltre: ${e.maxKijunDist}`);
        console.log(`   🎯 Kazanma Oranı: %${e.winRate.toFixed(1)} (${e.tpCount} Başarılı / ${e.slCount} Stop - Toplam: ${e.total})`);
        console.log(`   💰 $1.000 -> $${e.capital.toFixed(2)} (+%${e.ret.toFixed(2)})\n`);
    }
}

findPerfect1M().catch(console.error);
