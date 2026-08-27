// ==============================================================================
// 🧬 BTC EVOLUTION ENGINE: HYBRID QUANT MAE + TRAILING + QUALITY FILTERING
// ==============================================================================
import fs from 'fs';

console.log('🧬 2. Aşama: Genetik & Evrimsel Strateji Optimizasyonu Başlatılıyor...');

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

function runSimulation(config, data1H, indicators) {
    const { rawSignals, sa1H, sb1H, kijun1H, atrArr, atr50SmaArr, vol20SmaArr } = indicators;
    const N1H = data1H.length;

    let tpCount = 0, slCount = 0;
    let capital = 1000.0;
    let maxCapital = 1000.0;
    let maxDrawdownPct = 0;

    for (const sig of rawSignals) {
        const i = sig.index;
        const c = sig.price;
        const isBuy = sig.isBuy;
        const atr = atrArr[i] || 1;
        const curSa = sa1H[i], curSb = sb1H[i], curKijun = kijun1H[i];

        // Kalite Filtreleri
        if (config.minRvol && vol20SmaArr[i] > 0) {
            const rvol = data1H[i].vol / vol20SmaArr[i];
            if (rvol < config.minRvol) continue;
        }
        if (config.maxKijunStretch) {
            const kDist = Math.abs(c - curKijun) / atr;
            if (kDist > config.maxKijunStretch) continue;
        }

        // MAE & Volatilite Katsayıları
        const atr50 = atr50SmaArr[i] || atr;
        const rAtr = atr / atr50;
        const rCloud = (Math.abs(curSa - curSb) / c) * 100;
        const rvol = vol20SmaArr[i] > 0 ? (data1H[i].vol / vol20SmaArr[i]) : 1.0;
        const rKijun = Math.abs(c - curKijun) / atr;

        const zRegime = 1.6 * (rAtr - 1.0) + 0.9 * (rvol - 1.0) + 0.5 * ((rCloud / 0.8) - 1.0) - 0.75 * (rKijun - 0.7);
        const pExp = 1.0 / (1.0 + Math.exp(-1.75 * zRegime));

        const kMAE = config.kSlMax - (pExp * (config.kSlMax - config.kSlMin));
        const kTP = config.kTpMin + (Math.pow(pExp, 0.85) * (config.kTpMax - config.kTpMin));

        let sl = isBuy ? (c - kMAE * atr) : (c + kMAE * atr);
        let tp = isBuy ? (c + kTP * atr) : (c - kTP * atr);

        // Yapısal Taban Hibriti (Anchor koruması)
        if (config.useStructureAnchor) {
            let swingLow = Infinity, swingHigh = -Infinity;
            for (let k = 0; k < 8; k++) {
                const pIdx = Math.max(0, i - k);
                if (data1H[pIdx].low < swingLow) swingLow = data1H[pIdx].low;
                if (data1H[pIdx].high > swingHigh) swingHigh = data1H[pIdx].high;
            }
            if (isBuy) {
                const anchor = Math.min(swingLow, curKijun, Math.min(curSa, curSb)) - 0.3 * atr;
                if (anchor > sl && (c - anchor) >= 1.0 * atr) sl = anchor;
            } else {
                const anchor = Math.max(swingHigh, curKijun, Math.max(curSa, curSb)) + 0.3 * atr;
                if (anchor < sl && (anchor - c) >= 1.0 * atr) sl = anchor;
            }
        }

        let currentDynamicStop = sl;
        let highestProfitAtr = 0;
        let exitPrice = c;

        for (let step = i + 1; step < N1H; step++) {
            const bH = data1H[step].high;
            const bL = data1H[step].low;
            const stepAtr = atrArr[step] || atr;
            const stepKijun = kijun1H[step] || c;

            // Trailing & Breakeven
            if (config.useTrailing) {
                const pAtr = isBuy ? (bH - c) / atr : (c - bL) / atr;
                if (pAtr > highestProfitAtr) highestProfitAtr = pAtr;

                // Kademeli Kâr Koruma (Breakeven)
                if (highestProfitAtr >= config.beTrigger) {
                    const beStop = isBuy ? c + (atr * config.beBuffer) : c - (atr * config.beBuffer);
                    if (isBuy && beStop > currentDynamicStop) currentDynamicStop = beStop;
                    if (!isBuy && beStop < currentDynamicStop) currentDynamicStop = beStop;
                }
                // Kijun Trailing
                if (highestProfitAtr >= config.kijunTrigger && stepKijun > 0) {
                    const kStop = isBuy ? stepKijun - (stepAtr * config.kijunOffset) : stepKijun + (stepAtr * config.kijunOffset);
                    if (isBuy && kStop > currentDynamicStop) currentDynamicStop = kStop;
                    if (!isBuy && kStop < currentDynamicStop) currentDynamicStop = kStop;
                }
            }

            if (isBuy) {
                const hitTp = bH >= tp;
                const hitSl = bL <= currentDynamicStop;
                if (hitTp && !hitSl) { exitPrice = tp; break; }
                else if (hitSl && !hitTp) { exitPrice = currentDynamicStop; break; }
                else if (hitTp && hitSl) {
                    exitPrice = data1H[step].close >= data1H[step].open ? tp : currentDynamicStop;
                    break;
                }
            } else {
                const hitTp = bL <= tp;
                const hitSl = bH >= currentDynamicStop;
                if (hitTp && !hitSl) { exitPrice = tp; break; }
                else if (hitSl && !hitTp) { exitPrice = currentDynamicStop; break; }
                else if (hitTp && hitSl) {
                    exitPrice = data1H[step].close <= data1H[step].open ? tp : currentDynamicStop;
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
    }

    const totalTrades = tpCount + slCount;
    const winRate = totalTrades > 0 ? (tpCount / totalTrades) * 100 : 0;
    const totalReturnPct = ((capital - 1000.0) / 1000.0) * 100;

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

async function evolve() {
    const data1H = await fetchBinanceKlines('BTCUSDT', '1h', 3000);
    const data4H = await fetchBinanceKlines('BTCUSDT', '4h', 1000);
    const data1D = await fetchBinanceKlines('BTCUSDT', '1d', 500);

    const indicators = computeIndicators(data1H, data4H, data1D);

    const grid = [];

    // Hibrit Evrim Grid (1.200 Kombinasyon)
    for (let kSlMax of [2.0, 2.3, 2.5, 2.8]) {
        for (let kSlMin of [1.1, 1.3, 1.5]) {
            for (let kTpMax of [2.8, 3.2, 3.6, 4.0]) {
                for (let kTpMin of [1.6, 1.8, 2.0]) {
                    for (let beTrig of [0, 1.0, 1.3, 1.6]) {
                        for (let beBuf of [0.05, 0.15]) {
                            for (let minRvol of [0, 0.9]) {
                                grid.push({
                                    name: `Hybrid MAE[${kSlMin}-${kSlMax}] TP[${kTpMin}-${kTpMax}] BE:${beTrig}x Rvol:${minRvol}`,
                                    kSlMax, kSlMin, kTpMax, kTpMin,
                                    useStructureAnchor: true,
                                    useTrailing: beTrig > 0,
                                    beTrigger: beTrig,
                                    beBuffer: beBuf,
                                    kijunTrigger: 2.0,
                                    kijunOffset: 0.15,
                                    minRvol
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    console.log(`🧬 Toplam taranan evrimsel kombinasyon: ${grid.length} adet...`);

    const results = [];
    for (const g of grid) {
        results.push(runSimulation(g, data1H, indicators));
    }

    results.sort((a, b) => b.totalReturnPct - a.totalReturnPct);

    console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════');
    console.log('🏆 2. AŞAMA EVRİMİN EN KÂRLI İLK 10 STRATEJİSİ (MAX GETİRİ & PROFIT FACTOR)');
    console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
    for (let i = 0; i < Math.min(10, results.length); i++) {
        const r = results[i];
        console.log(`#${i + 1} | ${r.name}`);
        console.log(`   💰 $1.000 -> $${r.capital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (+%${r.totalReturnPct.toFixed(2)})`);
        console.log(`   🎯 Kazanma: %${r.winRate.toFixed(1)} | İşlem: ${r.totalTrades} (TP: ${r.tpCount}, SL: ${r.slCount}) | Max Drawdown: -%${r.maxDrawdownPct.toFixed(1)}\n`);
    }

    // JSON kaydet
    fs.writeFileSync('scripts/evolution_top_results.json', JSON.stringify(results.slice(0, 20), null, 2));
}

evolve().catch(console.error);
