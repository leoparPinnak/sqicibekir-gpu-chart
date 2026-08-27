/**
 * SqiciBekiRBindikatöR (PineScript v6) Multi-Timeframe Hesaplama Motoru
 */

export function resampleCandles(data1H, hoursPerBar) {
    const result = [];
    const barDuration = hoursPerBar * 3600000;
    let currentBar = null;

    for (let i = 0; i < data1H.length; i++) {
        const c = data1H[i];
        const barStart = Math.floor(c.time / barDuration) * barDuration;

        if (!currentBar || currentBar.time !== barStart) {
            if (currentBar) result.push(currentBar);
            currentBar = {
                time: barStart,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                vol: c.vol
            };
        } else {
            currentBar.high = Math.max(currentBar.high, c.high);
            currentBar.low = Math.min(currentBar.low, c.low);
            currentBar.close = c.close;
            currentBar.vol += c.vol;
        }
    }
    if (currentBar) result.push(currentBar);
    return result;
}

export function calculateSqiciBekiR(data1H, config = {}) {
    const N = data1H.length;
    if (N === 0) return null;

    const convLen = config.convLen || 9;
    const baseLen = config.baseLen || 26;
    const spanBLen = config.spanBLen || 52;
    const atrLen = config.atrLen || 14;
    const atrMult = config.atrMult || 1.5;
    const tpMult = config.tpMult || 2.5;
    const emaLen = config.emaLen || 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    const data4H = resampleCandles(data1H, 4);
    const data1D = resampleCandles(data1H, 24);

    // 1. 1D Ichimoku Rejimi (Kapanmış Günlük Mumlara Göre)
    const regime1DMap = new Map();
    for (let d = 0; d < data1D.length; d++) {
        let tenkanHigh = -Infinity, tenkanLow = Infinity;
        const k1 = Math.min(d + 1, convLen);
        for (let j = 0; j < k1; j++) {
            tenkanHigh = Math.max(tenkanHigh, data1D[d - j].high);
            tenkanLow = Math.min(tenkanLow, data1D[d - j].low);
        }
        const tenkan = (tenkanHigh + tenkanLow) / 2;

        let kijunHigh = -Infinity, kijunLow = Infinity;
        const k2 = Math.min(d + 1, baseLen);
        for (let j = 0; j < k2; j++) {
            kijunHigh = Math.max(kijunHigh, data1D[d - j].high);
            kijunLow = Math.min(kijunLow, data1D[d - j].low);
        }
        const kijun = (kijunHigh + kijunLow) / 2;
        const senkouA = (tenkan + kijun) / 2;

        let spanBHigh = -Infinity, spanBLow = Infinity;
        const k3 = Math.min(d + 1, spanBLen);
        for (let j = 0; j < k3; j++) {
            spanBHigh = Math.max(spanBHigh, data1D[d - j].high);
            spanBLow = Math.min(spanBLow, data1D[d - j].low);
        }
        const senkouB = (spanBHigh + spanBLow) / 2;

        const c = data1D[d].close;
        const cloudTop = Math.max(senkouA, senkouB);
        const cloudBot = Math.min(senkouA, senkouB);

        let r = 0;
        if (c > cloudTop) r = 1;
        else if (c < cloudBot) r = -1;

        regime1DMap.set(data1D[d].time, r);
    }

    // 2. 4H EMA26 Serisi
    const ema4HMap = new Map();
    let curEma4H = data4H[0] ? data4H[0].close : 0;
    for (let i = 0; i < data4H.length; i++) {
        curEma4H = data4H[i].close * emaCoeff + curEma4H * (1.0 - emaCoeff);
        ema4HMap.set(data4H[i].time, curEma4H);
    }

    // 3. 1H Serileri
    const sa1H = new Float32Array(N);
    const sb1H = new Float32Array(N);
    const atr1H = new Float32Array(N);
    const ema4HLive = new Float32Array(N);
    const lastRegime1DArr = new Float32Array(N);

    const signalCode = new Float32Array(N);
    const slArray = new Float32Array(N);
    const tpArray = new Float32Array(N);
    const crossUp4H = new Float32Array(N);
    const crossDown4H = new Float32Array(N);

    // ATR Hesabı
    let prevAtr = 0;
    for (let i = 0; i < N; i++) {
        const high = data1H[i].high;
        const low = data1H[i].low;
        const prevClose = i > 0 ? data1H[i - 1].close : data1H[i].open;
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        if (i === 0) prevAtr = tr;
        else if (i < atrLen) prevAtr = (prevAtr * i + tr) / (i + 1);
        else prevAtr = (prevAtr * (atrLen - 1) + tr) / atrLen;
        atr1H[i] = prevAtr;
    }

    // 1H Ichimoku Bulutu
    for (let i = 0; i < N; i++) {
        let tenkanHigh = -Infinity, tenkanLow = Infinity;
        const k1 = Math.min(i + 1, convLen);
        for (let j = 0; j < k1; j++) {
            tenkanHigh = Math.max(tenkanHigh, data1H[i - j].high);
            tenkanLow = Math.min(tenkanLow, data1H[i - j].low);
        }
        const tenkan = (tenkanHigh + tenkanLow) / 2;

        let kijunHigh = -Infinity, kijunLow = Infinity;
        const k2 = Math.min(i + 1, baseLen);
        for (let j = 0; j < k2; j++) {
            kijunHigh = Math.max(kijunHigh, data1H[i - j].high);
            kijunLow = Math.min(kijunLow, data1H[i - j].low);
        }
        const kijun = (kijunHigh + kijunLow) / 2;

        let spanBHigh = -Infinity, spanBLow = Infinity;
        const k3 = Math.min(i + 1, spanBLen);
        for (let j = 0; j < k3; j++) {
            spanBHigh = Math.max(spanBHigh, data1H[i - j].high);
            spanBLow = Math.min(spanBLow, data1H[i - j].low);
        }
        const senkouB = (spanBHigh + spanBLow) / 2;
        const senkouA = (tenkan + kijun) / 2;

        sa1H[i] = senkouA;
        sb1H[i] = senkouB;
    }

    // Sinyaller ve Rejim
    let activeRegime1D = 0;
    let prevBuy2Cond = false;
    let prevSell2Cond = false;
    let lastFoundSignal = null;

    for (let i = 0; i < N; i++) {
        const t = data1H[i].time;
        const close = data1H[i].close;

        // Kapanmış 1D Rejimi
        const currentDayStart = Math.floor(t / 86400000) * 86400000;
        const prevDayStart = currentDayStart - 86400000;
        const r = regime1DMap.get(prevDayStart);
        if (r === 1 || r === -1) {
            activeRegime1D = r;
        }
        lastRegime1DArr[i] = activeRegime1D;

        // Önceki 4H Kapanmış EMA
        const current4HStart = Math.floor(t / 14400000) * 14400000;
        const prev4HStart = current4HStart - 14400000;
        const previousEma4H = ema4HMap.get(prev4HStart) || close;

        const liveEma = emaCoeff * close + (1.0 - emaCoeff) * previousEma4H;
        ema4HLive[i] = liveEma;

        const above4HEMA = close > liveEma;
        const below4HEMA = close < liveEma;

        if (i > 0) {
            const prevClose = data1H[i - 1].close;
            const prevLiveEma = ema4HLive[i - 1];
            if (close > liveEma && prevClose <= prevLiveEma) crossUp4H[i] = 1.0;
            if (close < liveEma && prevClose >= prevLiveEma) crossDown4H[i] = 1.0;
        }

        const top1H = Math.max(sa1H[i], sb1H[i]);
        const bot1H = Math.min(sa1H[i], sb1H[i]);
        const above1HCloud = close > top1H;
        const below1HCloud = close < bot1H;

        let enterUp1H = false;
        let enterDown1H = false;
        if (i > 0) {
            const prevClose = data1H[i - 1].close;
            const prevTop1H = Math.max(sa1H[i - 1], sb1H[i - 1]);
            const prevBot1H = Math.min(sa1H[i - 1], sb1H[i - 1]);
            enterUp1H = close > top1H && prevClose <= prevTop1H;
            enterDown1H = close < bot1H && prevClose >= prevBot1H;
        }

        const bullish = (activeRegime1D === 1) && above4HEMA;
        const bearish = (activeRegime1D === -1) && below4HEMA;

        const buySignal1 = bullish && enterUp1H;
        const sellSignal1 = bearish && enterDown1H;

        const buy2Cond = bullish && above1HCloud;
        const sell2Cond = bearish && below1HCloud;

        const buySignal2 = buy2Cond && !prevBuy2Cond;
        const sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond;
        prevSell2Cond = sell2Cond;

        const atr = atr1H[i];

        if (buySignal1) {
            signalCode[i] = 1.0;
            slArray[i] = close - atr * atrMult;
            tpArray[i] = close + atr * tpMult;
            lastFoundSignal = { type: 'BUY1 (Bulut Kırılımı)', price: close, sl: slArray[i], tp: tpArray[i] };
        } else if (sellSignal1) {
            signalCode[i] = 2.0;
            slArray[i] = close + atr * atrMult;
            tpArray[i] = close - atr * tpMult;
            lastFoundSignal = { type: 'SELL1 (Bulut Kırılımı)', price: close, sl: slArray[i], tp: tpArray[i] };
        } else if (buySignal2) {
            signalCode[i] = 3.0;
            slArray[i] = close - atr * atrMult;
            tpArray[i] = close + atr * tpMult;
            lastFoundSignal = { type: 'BUY2 (Setup Başlangıcı)', price: close, sl: slArray[i], tp: tpArray[i] };
        } else if (sellSignal2) {
            signalCode[i] = 4.0;
            slArray[i] = close + atr * atrMult;
            tpArray[i] = close - atr * tpMult;
            lastFoundSignal = { type: 'SELL2 (Setup Başlangıcı)', price: close, sl: slArray[i], tp: tpArray[i] };
        }
    }

    return {
        sa1H, sb1H, ema4HLive, atr1H, lastRegime1DArr,
        signalCode, slArray, tpArray, crossUp4H, crossDown4H,
        lastFoundSignal
    };
}
