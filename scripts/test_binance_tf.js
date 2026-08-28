async function fetchKlinesForInterval(symbol, interval, targetCount) {
    let allKlines = [];
    let endTime = null;
    const requestsNeeded = Math.ceil(targetCount / 1000);
    const hosts = ['https://api.binance.com', 'https://data-api.binance.vision'];

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
            } catch (e) {
                console.error(`Fetch error on ${host}:`, e.message);
            }
        }
        if (!chunk || chunk.length === 0) break;
        allKlines = chunk.concat(allKlines);
        endTime = chunk[0][0] - 1;
    }

    const uniqueMap = new Map();
    for (const k of allKlines) uniqueMap.set(k[0], k);
    const sortedKlines = Array.from(uniqueMap.values()).sort((a, b) => a[0] - b[0]);

    return sortedKlines.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        vol: parseFloat(k[5])
    }));
}

const TIMEFRAME_CONFIGS = {
    '1m': {
        baseTf: '1m', emaTf: '5m', regimeTf: '1h',
        baseMs: 60 * 1000, emaMs: 5 * 60 * 1000, regimeMs: 60 * 60 * 1000,
        label: '1m Scalp Pro', emaLabel: '5M EMA26', regimeLabel: '1H ICHIMOKU'
    },
    '3m': {
        baseTf: '3m', emaTf: '15m', regimeTf: '1h',
        baseMs: 3 * 60 * 1000, emaMs: 15 * 60 * 1000, regimeMs: 60 * 60 * 1000,
        label: '3m Turbo Trade', emaLabel: '15M EMA26', regimeLabel: '1H ICHIMOKU'
    },
    '5m': {
        baseTf: '5m', emaTf: '15m', regimeTf: '4h',
        baseMs: 5 * 60 * 1000, emaMs: 15 * 60 * 1000, regimeMs: 4 * 60 * 60 * 1000,
        label: '5m Day Trade', emaLabel: '15M EMA26', regimeLabel: '4H ICHIMOKU'
    },
    '15m': {
        baseTf: '15m', emaTf: '1h', regimeTf: '1d',
        baseMs: 15 * 60 * 1000, emaMs: 60 * 60 * 1000, regimeMs: 24 * 60 * 60 * 1000,
        label: '15m Short Swing', emaLabel: '1H EMA26', regimeLabel: '1D ICHIMOKU'
    },
    '1h': {
        baseTf: '1h', emaTf: '4h', regimeTf: '1d',
        baseMs: 60 * 60 * 1000, emaMs: 4 * 60 * 60 * 1000, regimeMs: 24 * 60 * 60 * 1000,
        label: '1h Swing (Pine v6)', emaLabel: '4H EMA26', regimeLabel: '1D ICHIMOKU'
    }
};

function calculateSqiciBekiR_MultiStrategy(dataBase, dataEma, dataRegime, stratId, tfKey) {
    const tfCfg = TIMEFRAME_CONFIGS[tfKey || '1h'] || TIMEFRAME_CONFIGS['1h'];
    const N_base = dataBase.length;
    const N_ema = dataEma.length;
    const N_regime = dataRegime.length;

    const saBase = new Float32Array(N_base);
    const sbBase = new Float32Array(N_base);
    const kijunBase = new Float32Array(N_base);
    const emaLiveArr = new Float32Array(N_base);
    const regimeArr = new Float32Array(N_base);
    const atrArr = new Float32Array(N_base);
    const signals = [];

    const convLen = 9;
    const baseLen = 26;
    const spanBLen = 52;
    const disp = 26;
    const emaLen = 26;
    const emaCoeff = 2.0 / (emaLen + 1.0);

    // 1. ÜST REJİM ICHIMOKU BULUTU
    const saRegimeRaw = new Float32Array(N_regime);
    const sbRegimeRaw = new Float32Array(N_regime);

    for (let i = 0; i < N_regime; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, dataRegime[i - j].high);
            tL = Math.min(tL, dataRegime[i - j].low);
        }
        const tenkan = (tH + tL) / 2;

        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, dataRegime[i - j].high);
            kL = Math.min(kL, dataRegime[i - j].low);
        }
        const kijun = (kH + kL) / 2;

        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, dataRegime[i - j].high);
            sBL = Math.min(sBL, dataRegime[i - j].low);
        }

        saRegimeRaw[i] = (tenkan + kijun) / 2;
        sbRegimeRaw[i] = (sBH + sBL) / 2;
    }

    let lastRegime = 0;
    const confirmedRegimeList = [];

    for (let i = 0; i < N_regime; i++) {
        const shiftedA = (i >= disp) ? saRegimeRaw[i - disp] : saRegimeRaw[i];
        const shiftedB = (i >= disp) ? sbRegimeRaw[i - disp] : sbRegimeRaw[i];
        const cloudTop = Math.max(shiftedA, shiftedB);
        const cloudBot = Math.min(shiftedA, shiftedB);
        const c = dataRegime[i].close;

        let rawRegime = 0;
        if (c > cloudTop) rawRegime = 1;
        else if (c < cloudBot) rawRegime = -1;
        else rawRegime = 0;

        if (rawRegime === 1 || rawRegime === -1) {
            lastRegime = rawRegime;
        }

        confirmedRegimeList.push({
            time: dataRegime[i].time,
            closeTime: dataRegime[i].time + tfCfg.regimeMs - 1,
            lastRegime: lastRegime
        });
    }

    // 2. ORTA VADE EMA26 HESAPLAMASI
    const emaClosedArr = new Float32Array(N_ema);
    let pEma = dataEma[0] ? dataEma[0].close : 0;
    for (let i = 0; i < N_ema; i++) {
        pEma = dataEma[i].close * emaCoeff + pEma * (1.0 - emaCoeff);
        emaClosedArr[i] = pEma;
    }

    // 3. BASE ATR (14)
    let prevAtr = 0;
    for (let i = 0; i < N_base; i++) {
        const h = dataBase[i].high;
        const l = dataBase[i].low;
        const pc = i > 0 ? dataBase[i - 1].close : dataBase[i].open;
        const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
        if (i === 0) prevAtr = tr;
        else if (i < 14) prevAtr = (prevAtr * i + tr) / (i + 1);
        else prevAtr = (prevAtr * 13 + tr) / 14;
        atrArr[i] = prevAtr;
    }

    // 4. BASE ICHIMOKU
    const saBaseRaw = new Float32Array(N_base);
    const sbBaseRaw = new Float32Array(N_base);

    for (let i = 0; i < N_base; i++) {
        let tH = -Infinity, tL = Infinity;
        for (let j = 0; j < Math.min(i + 1, convLen); j++) {
            tH = Math.max(tH, dataBase[i - j].high);
            tL = Math.min(tL, dataBase[i - j].low);
        }
        const tenkan = (tH + tL) / 2;

        let kH = -Infinity, kL = Infinity;
        for (let j = 0; j < Math.min(i + 1, baseLen); j++) {
            kH = Math.max(kH, dataBase[i - j].high);
            kL = Math.min(kL, dataBase[i - j].low);
        }
        const kijun = (kH + kL) / 2;
        kijunBase[i] = kijun;

        let sBH = -Infinity, sBL = Infinity;
        for (let j = 0; j < Math.min(i + 1, spanBLen); j++) {
            sBH = Math.max(sBH, dataRegime[i - j] ? dataBase[i - j].high : dataBase[i].high);
            sBL = Math.min(sBL, dataRegime[i - j] ? dataBase[i - j].low : dataBase[i].low);
        }

        saBaseRaw[i] = (tenkan + kijun) / 2;
        sbBaseRaw[i] = (sBH + sBL) / 2;
    }

    for (let i = 0; i < N_base; i++) {
        saBase[i] = (i >= disp) ? saBaseRaw[i - disp] : saBaseRaw[i];
        sbBase[i] = (i >= disp) ? sbBaseRaw[i - disp] : sbBaseRaw[i];
    }

    // 5. REJİM VE CANLI EMA EŞLEŞTİRMESİ
    let dIdx = 0;
    let emaIdx = 0;

    for (let i = 0; i < N_base; i++) {
        const tBase = dataBase[i].time;
        const cBase = dataBase[i].close;

        while (dIdx + 1 < confirmedRegimeList.length && confirmedRegimeList[dIdx + 1].closeTime <= tBase) {
            dIdx++;
        }
        regimeArr[i] = confirmedRegimeList[dIdx] ? confirmedRegimeList[dIdx].lastRegime : 0;

        while (emaIdx + 1 < N_ema && (dataEma[emaIdx + 1].time + tfCfg.emaMs - 1) <= tBase) {
            emaIdx++;
        }
        const prevClosedEma = emaClosedArr[emaIdx] || cBase;
        emaLiveArr[i] = emaCoeff * cBase + (1.0 - emaCoeff) * prevClosedEma;
    }

    let prevBuy2Cond = false;
    let prevSell2Cond = false;

    for (let i = 53; i < N_base; i++) {
        const c = dataBase[i].close;
        const prevC = dataBase[i - 1].close;

        const curSa = saBase[i];
        const curSb = sbBase[i];
        const prevSa = saBase[i - 1];
        const prevSb = sbBase[i - 1];

        const topBase = Math.max(curSa, curSb);
        const botBase = Math.min(curSa, curSb);
        const prevTopBase = Math.max(prevSa, prevSb);
        const prevBotBase = Math.min(prevSa, prevSb);

        const curRegime = regimeArr[i];
        const curEmaLive = emaLiveArr[i];

        const aboveEMA = c > curEmaLive;
        const belowEMA = c < curEmaLive;

        const bullish = (curRegime === 1) && aboveEMA;
        const bearish = (curRegime === -1) && belowEMA;

        const enterUpBase = (c > topBase) && (prevC <= prevTopBase);
        const enterDownBase = (c < botBase) && (prevC >= prevBotBase);

        const aboveCloud = c > topBase;
        const belowCloud = c < botBase;

        const buy2Cond = bullish && aboveCloud;
        const sell2Cond = bearish && belowCloud;

        const buySignal1 = bullish && enterUpBase;
        const sellSignal1 = bearish && enterDownBase;
        const buySignal2 = buy2Cond && !prevBuy2Cond;
        const sellSignal2 = sell2Cond && !prevSell2Cond;

        prevBuy2Cond = buy2Cond;
        prevSell2Cond = sell2Cond;

        if (buySignal1 || sellSignal1 || buySignal2 || sellSignal2) {
            signals.push({
                index: i,
                type: buySignal1 ? 'BUY' : sellSignal1 ? 'SELL' : buySignal2 ? 'BUY2' : 'SELL2',
                price: c,
                time: dataBase[i].time
            });
        }
    }

    return { signals, regimeArr, emaLiveArr };
}

async function testTf(tf) {
    const tfCfg = TIMEFRAME_CONFIGS[tf];
    console.log(`\nTesting timeframe: ${tf}`);
    
    const [dataBase, dataEma, dataRegime] = await Promise.all([
        fetchKlinesForInterval('BTCUSDT', tfCfg.baseTf, 3000),
        fetchKlinesForInterval('BTCUSDT', tfCfg.emaTf, 1000),
        fetchKlinesForInterval('BTCUSDT', tfCfg.regimeTf, 500)
    ]);
    
    console.log(`Fetched counts: dataBase=${dataBase.length}, dataEma=${dataEma.length}, dataRegime=${dataRegime.length}`);
    const res = calculateSqiciBekiR_MultiStrategy(dataBase, dataEma, dataRegime, 4, tf);
    console.log(`Signals count for ${tf}: ${res.signals.length}`);
    if (res.signals.length > 0) {
        console.log(`First 3 signals:`, res.signals.slice(0, 3));
    }
}

async function run() {
    await testTf('1m');
    await testTf('3m');
    await testTf('5m');
    await testTf('15m');
    await testTf('1h');
}

run();
