
        const canvas = document.getElementById('glcanvas');
        const overlayCanvas = document.getElementById('overlay-canvas');
        const canvasContainer = document.getElementById('canvas-container');
        const timeAxisElem = document.getElementById('time-axis');
        const priceAxisElem = document.getElementById('price-axis');
        
        const gl = canvas.getContext('webgl2', { alpha: false, depth: false, antialias: true });
        const ctx2d = overlayCanvas.getContext('2d');

        if (!gl) alert('WebGL 2.0 desteklenmiyor!');
        gl.getExtension('EXT_color_buffer_float');

        function createShader(gl, type, source) {
            const s = gl.createShader(type);
            gl.shaderSource(s, source.trim());
            gl.compileShader(s);
            return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, document.getElementById('vs').text));
        gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, document.getElementById('fs').text));
        gl.linkProgram(prog);

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, 'u_resolution');
        const uViewRange = gl.getUniformLocation(prog, 'u_view_range');
        const uPriceRange = gl.getUniformLocation(prog, 'u_price_range');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');
        const uTime = gl.getUniformLocation(prog, 'u_time');

        const uShowCloud = gl.getUniformLocation(prog, 'u_show_cloud');
        const uShowEma = gl.getUniformLocation(prog, 'u_show_ema');
        const uShowBg = gl.getUniformLocation(prog, 'u_show_bg');

        const uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');
        const uIndTex = gl.getUniformLocation(prog, 'u_ind_tex');
        const uTotalCandles = gl.getUniformLocation(prog, 'u_total_candles');

        // ==========================================
        // 🎯 5 GELİŞMİŞ QUANT STRATEJİSİ (1M SCALP VS 1H SWING DİNAMİK)
        // ==========================================
        let activeStrategy = 4; // Varsayılan: 4 (Şampiyon Asimetrik Pro)

        function isScalpTimeframe(tf) {
            return tf === '1m' || tf === '3m' || tf === '5m' || tf === '15m';
        }

        function getStratTitle(stratId, tf) {
            const scalp = isScalpTimeframe(tf || currentTimeframe);
            if (scalp) {
                switch(stratId) {
                    case 4: return '🔥 1M ASİMETRİK SCALP PRO (BUY2: 1.5/3.0x %63.6 Win | SELL: 1.5/3.0x)';
                    case 3: return '🔄 1M MICRO-BREAKEVEN (%70.5 KAZANMA ORANI | +0.6 ATR BE & SWING 8)';
                    case 2: return '⚡ 1M SERİ HIZLI SCALP (1.5x SL / 2.0x TP | DAKİKALIK KAPANIŞ)';
                    case 1: return '🏛️ 1M MİKRO-YAPISAL SL (SON 5 BAR SWING + 0.2x ATR TAMPON)';
                    case 0: return '📐 1M KLASİK SABİT SCALP (1.2x SL / 1.8x TP)';
                    default: return '⚡ 1M SCALP STRATEJİSİ';
                }
            } else {
                switch(stratId) {
                    case 4: return '🔥 1H ASİMETRİK PRO (BUY1: 2.2x, BUY2 TREND: 4.0x R:R 1:2.85, SELL: 2.5x)';
                    case 3: return '🔄 1H TRAILING STOP (+0.8 ATR BREAKEVEN & %78.8 KAZANMA ORANI)';
                    case 2: return '🤖 1H QUANT MAE (DİNAMİK VOLATİLİTE: 1.2x-2.5x SL / 2.0x-3.2x TP)';
                    case 1: return '🏛️ 1H YAPISAL SL (SWING LOW/HIGH + KIJUN + BULUT TABANI + 0.4 ATR)';
                    case 0: return '📐 1H KLASİK SABİT 1:1.67 R:R (1.5x SL / 2.5x TP)';
                    default: return '📊 1H SWING STRATEJİSİ';
                }
            }
        }

        function getStratFooter(stratId, tf) {
            const scalp = isScalpTimeframe(tf || currentTimeframe);
            if (scalp) {
                switch(stratId) {
                    case 4: return 'Aktif: <b>⚡ 4. 1M Asimetrik Scalp (BUY2: 1.5x SL / 3.0x TP %63.6 Win 🚀, SELL: 1.5x SL / 3.0x TP)</b>';
                    case 3: return 'Aktif: <b>🔄 3. 1M Micro-BE (%70.5 Win Rate | +0.6 ATR Erken Breakeven)</b>';
                    case 2: return 'Aktif: <b>⚡ 2. 1M Hızlı Scalp (1.5x SL / 2.0x TP R:R 1:1.33)</b>';
                    case 1: return 'Aktif: <b>🏛️ 1. 1M Mikro-Yapısal (Son 5 Bar Swing + 0.2x ATR)</b>';
                    case 0: return 'Aktif: <b>📐 0. 1M Sabit Scalp (1.2x SL / 1.8x TP)</b>';
                    default: return '';
                }
            } else {
                switch(stratId) {
                    case 4: return 'Aktif: <b>🔥 4. 1H Asimetrik Pro (BUY1: 2.2x, BUY2: 1.4/4.0x R:R 1:2.85, SELL: 1.2/2.5x)</b>';
                    case 3: return 'Aktif: <b>🔄 3. 1H Trailing BE (+0.8 ATR Erken Breakeven & %78.8 Win Rate)</b>';
                    case 2: return 'Aktif: <b>🤖 2. 1H Quant MAE (Sıkışmada 2.5x SL / Patlamada 3.2x TP)</b>';
                    case 1: return 'Aktif: <b>🏛️ 1. 1H Yapısal SL (Swing 10 + Kijun + Bulut + 0.4 ATR Tampon)</b>';
                    case 0: return 'Aktif: <b>📐 0. 1H Sabit 1.67 (1.5x ATR SL / 2.5x ATR TP)</b>';
                    default: return '';
                }
            }
        }

        function updateStrategyToolbarUi(tf) {
            const scalp = isScalpTimeframe(tf);
            const btn4 = document.getElementById('strat-btn-4');
            const btn3 = document.getElementById('strat-btn-3');
            const btn2 = document.getElementById('strat-btn-2');
            const btn1 = document.getElementById('strat-btn-1');
            const btn0 = document.getElementById('strat-btn-0');

            if (scalp) {
                if (btn4) { btn4.innerHTML = '🔥 4. 1M Asimetrik Scalp'; btn4.title = '1M Scalp Şampiyonu: BUY2 Trend (3.0x TP %63.6 Win), SELL (3.0x TP)'; }
                if (btn3) { btn3.innerHTML = '🔄 3. 1M Micro-BE (%70.5 Win)'; btn3.title = '1M En Yüksek Başarı: +0.6 ATR Erken Breakeven & Son 8 Bar Swing'; }
                if (btn2) { btn2.innerHTML = '⚡ 2. 1M Hızlı Scalp'; btn2.title = '1M Hızlı Seri Kapanış: 1.5x SL / 2.0x TP (R:R 1:1.33)'; }
                if (btn1) { btn1.innerHTML = '🏛️ 1. 1M Mikro-Yapısal'; btn1.title = '1M Mikro-Yapısal SL: Son 5 bar Swing Low/High + 0.2x ATR'; }
                if (btn0) { btn0.innerHTML = '📐 0. 1M Sabit Scalp'; btn0.title = '1M Sabit Scalp: 1.2x ATR SL / 1.8x ATR TP'; }
            } else {
                if (btn4) { btn4.innerHTML = '🔥 4. Asimetrik Pro (+%14 Kâr)'; btn4.title = '1H Swing Şampiyonu: BUY1 (2.2x), BUY2 Trend (1.4/4.0x R:R 1:2.85), SELL (1.2/2.5x)'; }
                if (btn3) { btn3.innerHTML = '🔄 3. Trailing BE (%78.8 Win)'; btn3.title = '1H Trailing Stop: +0.8 ATR Erken Breakeven & %78.8 Kazanma Oranı'; }
                if (btn2) { btn2.innerHTML = '🤖 2. Quant MAE (+%9.5)'; btn2.title = '1H Quant MAE: Volatilite Sıkışmada 2.5x SL / Patlamada 3.2x TP'; }
                if (btn1) { btn1.innerHTML = '🏛️ 1. Yapısal SL'; btn1.title = '1H Piyasa Yapısı: Son 10 mum Swing Low + Kijun + Bulut Tabanı + 0.4 ATR Tampon'; }
                if (btn0) { btn0.innerHTML = '📐 0. Sabit 1.67'; btn0.title = '1H Sabit 1:1.67 R:R (1.5x ATR SL, 2.5x ATR TP)'; }
            }

            document.getElementById('vbt-strat-title').innerText = getStratTitle(activeStrategy, tf);
            document.getElementById('active-strat-footer').innerHTML = getStratFooter(activeStrategy, tf);
        }

        window.setStrategy = function(stratId) {
            activeStrategy = stratId;
            [0, 1, 2, 3, 4].forEach(id => {
                const btn = document.getElementById(`strat-btn-${id}`);
                if (btn) btn.classList.toggle('active', id === stratId);
            });
            document.getElementById('vbt-strat-title').innerText = getStratTitle(stratId, currentTimeframe);
            document.getElementById('active-strat-footer').innerHTML = getStratFooter(stratId, currentTimeframe);
            updateGpuTextures();
        };

        // ==========================================
        // BACKTEST DURUMU
        // ==========================================
        let isBacktestActive = true;

        window.toggleBacktestMode = function() {
            isBacktestActive = !isBacktestActive;
            const btn = document.getElementById('btn-backtest');
            const vbtCard = document.getElementById('visible-backtest-card');
            btn.classList.toggle('active', isBacktestActive);
            btn.innerText = isBacktestActive ? '🎆 Backtest: AÇIK' : '📊 Backtest Modu';
            vbtCard.style.display = isBacktestActive ? 'flex' : 'none';
        };

        // ==========================================
        // MULTI-TIMEFRAME BINANCE VERİ DEPOSU
        // ==========================================
        let currentSymbol = 'BTCUSDT';
        let requestedDepth = 3000;
        
        let candleData1H = [];
        let candleData4H = [];
        let candleData1D = [];

        let totalCandles = 0;
        let calculatedSignals = [];

        let candleTex = null;
        let indTex = null;

        let viewStart = 0;
        let viewEnd = 0;
        let ws = null;

        const loadingOverlay = document.getElementById('loading-overlay');
        const wsDot = document.getElementById('ws-dot');

        const layers = { cloud: 1, ema: 1, signals: 1, bg: 1 };
        window.toggleLayer = function(name) {
            layers[name] = layers[name] ? 0 : 1;
            document.getElementById(`btn-${name}`).classList.toggle('active', !!layers[name]);
        };

        // ==========================================
        // ⏱️ DİNAMİK MULTI-TIMEFRAME YAPILANDIRMASI
        // ==========================================
        const TIMEFRAME_CONFIGS = {
            '1m': {
                baseTf: '1m', emaTf: '5m', regimeTf: '1h',
                baseMs: 60 * 1000, emaMs: 5 * 60 * 1000, regimeMs: 60 * 60 * 1000,
                label: '⚡ 1m Scalp Pro', emaLabel: '5M EMA26', regimeLabel: '1H ICHIMOKU'
            },
            '3m': {
                baseTf: '3m', emaTf: '15m', regimeTf: '1h',
                baseMs: 3 * 60 * 1000, emaMs: 15 * 60 * 1000, regimeMs: 60 * 60 * 1000,
                label: '🔥 3m Turbo Trade', emaLabel: '15M EMA26', regimeLabel: '1H ICHIMOKU'
            },
            '5m': {
                baseTf: '5m', emaTf: '15m', regimeTf: '4h',
                baseMs: 5 * 60 * 1000, emaMs: 15 * 60 * 1000, regimeMs: 4 * 60 * 60 * 1000,
                label: '🚀 5m Day Trade', emaLabel: '15M EMA26', regimeLabel: '4H ICHIMOKU'
            },
            '15m': {
                baseTf: '15m', emaTf: '1h', regimeTf: '1d',
                baseMs: 15 * 60 * 1000, emaMs: 60 * 60 * 1000, regimeMs: 24 * 60 * 60 * 1000,
                label: '🎯 15m Short Swing', emaLabel: '1H EMA26', regimeLabel: '1D ICHIMOKU'
            },
            '1h': {
                baseTf: '1h', emaTf: '4h', regimeTf: '1d',
                baseMs: 60 * 60 * 1000, emaMs: 4 * 60 * 60 * 1000, regimeMs: 24 * 60 * 60 * 1000,
                label: '📊 1h Swing (Pine v6)', emaLabel: '4H EMA26', regimeLabel: '1D ICHIMOKU'
            },
            '4h': {
                baseTf: '4h', emaTf: '1d', regimeTf: '1w',
                baseMs: 4 * 60 * 60 * 1000, emaMs: 24 * 60 * 60 * 1000, regimeMs: 7 * 24 * 60 * 60 * 1000,
                label: '🏛️ 4h Macro Trend', emaLabel: '1D EMA26', regimeLabel: '1W ICHIMOKU'
            }
        };

        let currentTimeframe = '1h';

        window.changeTimeframe = function(tf) {
            currentTimeframe = tf;
            ['1m', '3m', '5m', '15m', '1h', '4h'].forEach(t => {
                const btn = document.getElementById(`tf-btn-${t}`);
                if (btn) btn.classList.toggle('active', t === tf);
            });
            updateStrategyToolbarUi(tf);
            fetchAllMultiTimeframeKlines(currentSymbol);
        };

        // ============================================================
        // SQICIBEKIRBINDIKATÖR: ÇOKLU STRATEJİLİ HESAPLAMA MOTORU
        // ============================================================
        function calculateSqiciBekiR_MultiStrategy(dataBase, dataEma, dataRegime, stratId, tfKey) {
            const tfCfg = TIMEFRAME_CONFIGS[tfKey || currentTimeframe] || TIMEFRAME_CONFIGS['1h'];
            const N_base = dataBase.length;
            const N_ema = dataEma.length;
            const N_regime = dataRegime.length;

            const saBase = new Float32Array(N_base);
            const sbBase = new Float32Array(N_base);
            const kijunBase = new Float32Array(N_base);
            const emaLiveArr = new Float32Array(N_base);
            const regimeArr = new Float32Array(N_base);
            const atrArr = new Float32Array(N_base);
            const atr50SmaArr = new Float32Array(N_base);
            const vol20SmaArr = new Float32Array(N_base);
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

            // 3. BASE ATR (14) & SMA(ATR, 50) & SMA(Volume, 20)
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

                let atrSum = 0;
                const atrLook = Math.min(i + 1, 50);
                for (let k = 0; k < atrLook; k++) atrSum += atrArr[i - k];
                atr50SmaArr[i] = atrSum / atrLook;

                let volSum = 0;
                const volLook = Math.min(i + 1, 20);
                for (let k = 0; k < volLook; k++) volSum += dataBase[i - k].vol;
                vol20SmaArr[i] = volSum / volLook;
            }

            // 4. BASE ICHIMOKU (disp = 26 KAYDIRILMIŞ)
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
                    sBH = Math.max(sBH, dataBase[i - j].high);
                    sBL = Math.min(sBL, dataBase[i - j].low);
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

            // 6. SİNYAL VE SEÇİLEN STRATEJİYE GÖRE AKILLI SL / TP SİMÜLASYONU
            const isScalp = isScalpTimeframe(tfCfg.baseTf);
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
                const atr = atrArr[i] || 1;

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

                let isSignal = false;
                let sigType = '';
                let sigLabel = '';
                let isBuy = true;

                if (buySignal1) {
                    isSignal = true; sigType = 'BUY'; sigLabel = `BUY (${tfCfg.baseTf} Kırılım)`; isBuy = true;
                } else if (sellSignal1) {
                    isSignal = true; sigType = 'SELL'; sigLabel = `SELL (${tfCfg.baseTf} Kırılım)`; isBuy = false;
                } else if (buySignal2) {
                    isSignal = true; sigType = 'BUY2'; sigLabel = `BUY2 (${tfCfg.baseTf} Trend)`; isBuy = true;
                } else if (sellSignal2) {
                    isSignal = true; sigType = 'SELL2'; sigLabel = `SELL2 (${tfCfg.baseTf} Trend)`; isBuy = false;
                }

                if (isSignal) {
                    let sl = 0;
                    let tp = 0;
                    let rrRatio = 1.67;
                    let extraInfo = '';

                    // -------------------------------------------------------------
                    // STRATEJİ 4: ASİMETRİK SİNYAL PRO (1M SCALP VS 1H SWING)
                    // -------------------------------------------------------------
                    if (stratId === 4) {
                        if (isScalp) {
                            if (sigType === 'BUY') {
                                sl = c - (atr * 1.2);
                                tp = c + (atr * 1.8);
                                rrRatio = 1.8 / 1.2;
                                extraInfo = `1M BUY1 Kırılım: 1.2x SL / 1.8x TP`;
                            } else if (sigType === 'BUY2') {
                                sl = c - (atr * 1.5);
                                tp = c + (atr * 3.0);
                                rrRatio = 2.0;
                                extraInfo = `1M BUY2 Trend: 1.5x SL / 3.0x TP (%63.6 Win 🚀)`;
                            } else {
                                sl = c + (atr * 1.5);
                                tp = c - (atr * 3.0);
                                rrRatio = 2.0;
                                extraInfo = `1M SELL: 1.5x SL / 3.0x TP (+%1.48 Kâr 🔻)`;
                            }
                        } else {
                            if (sigType === 'BUY') {
                                sl = c - (atr * 2.2);
                                tp = c + (atr * 2.2);
                                rrRatio = 1.0;
                                extraInfo = `BUY1 Kırılım: 2.2x SL / 2.2x TP (Geniş Tampon)`;
                            } else if (sigType === 'BUY2') {
                                sl = c - (atr * 1.4);
                                tp = c + (atr * 4.0);
                                rrRatio = 4.0 / 1.4;
                                extraInfo = `BUY2 Trend: 1.4x SL / 4.0x TP (R:R 1:2.85 🚀)`;
                            } else {
                                sl = c + (atr * 1.2);
                                tp = c - (atr * 2.5);
                                rrRatio = 2.5 / 1.2;
                                extraInfo = `SELL Trend: 1.2x SL / 2.5x TP (R:R 1:2.08 🔻)`;
                            }
                        }
                    }
                    // -------------------------------------------------------------
                    // STRATEJİ 3: DİNAMİK TRAILING STOP / BREAKEVEN
                    // -------------------------------------------------------------
                    else if (stratId === 3) {
                        if (isScalp) {
                            let swingLow8 = Infinity, swingHigh8 = -Infinity;
                            for (let k = 0; k < 8; k++) {
                                const pastIdx = Math.max(0, i - k);
                                if (dataBase[pastIdx].low < swingLow8) swingLow8 = dataBase[pastIdx].low;
                                if (dataBase[pastIdx].high > swingHigh8) swingHigh8 = dataBase[pastIdx].high;
                            }
                            const buf = atr * 0.3;
                            if (isBuy) {
                                const dist = Math.max(0.8 * atr, Math.min(2.5 * atr, c - (swingLow8 - buf)));
                                sl = c - dist;
                                tp = c + (dist * 1.5);
                            } else {
                                const dist = Math.max(0.8 * atr, Math.min(2.5 * atr, (swingHigh8 + buf) - c));
                                sl = c + dist;
                                tp = c - (dist * 1.5);
                            }
                            rrRatio = 1.5;
                            extraInfo = `1M Micro-BE: +0.6 ATR Erken Breakeven (%70.5 Win 🏆)`;
                        } else {
                            sl = isBuy ? (c - atr * 1.5) : (c + atr * 1.5);
                            tp = isBuy ? (c + atr * 2.5) : (c - atr * 2.5);
                            rrRatio = 2.5 / 1.5;
                            extraInfo = `1H Trailing BE: +0.8 ATR (%78.8 Win Rate) | Kijun: +2.2 ATR`;
                        }
                    }
                    // -------------------------------------------------------------
                    // STRATEJİ 2: QUANT MAE / 1M HIZLI SERİ SCALP
                    // -------------------------------------------------------------
                    else if (stratId === 2) {
                        if (isScalp) {
                            sl = isBuy ? (c - atr * 1.5) : (c + atr * 1.5);
                            tp = isBuy ? (c + atr * 2.0) : (c - atr * 2.0);
                            rrRatio = 2.0 / 1.5;
                            extraInfo = `1M Seri Hızlı Scalp: 1.5x SL / 2.0x TP (R:R 1:1.33)`;
                        } else {
                            const atr50 = atr50SmaArr[i] || atr;
                            const vol20 = vol20SmaArr[i] || dataBase[i].vol;
                            const rAtr = atr / atr50;
                            const rCloud = (Math.abs(curSa - curSb) / c) * 100;
                            const rvol = vol20 > 0 ? (dataBase[i].vol / vol20) : 1.0;
                            const rKijun = Math.abs(c - kijunBase[i]) / atr;

                            const zRegime = 1.60 * (rAtr - 1.0) + 0.90 * (rvol - 1.0) + 0.50 * ((rCloud / 0.80) - 1.0) - 0.75 * (rKijun - 0.70);
                            const pExpansion = 1.0 / (1.0 + Math.exp(-1.75 * zRegime));

                            const kMAE = 2.50 - (pExpansion * (2.50 - 1.20));
                            const kTP = 2.00 + (Math.pow(pExpansion, 0.85) * (3.20 - 2.00));
                            rrRatio = kTP / kMAE;

                            if (isBuy) {
                                sl = c - (kMAE * atr);
                                tp = c + (kTP * atr);
                            } else {
                                sl = c + (kMAE * atr);
                                tp = c - (kTP * atr);
                            }
                            extraInfo = `MAE SL: ${kMAE.toFixed(2)}x | TP: ${kTP.toFixed(2)}x (P_exp: %${(pExpansion * 100).toFixed(0)})`;
                        }
                    }
                    // -------------------------------------------------------------
                    // STRATEJİ 1: PİYASA YAPISI / 1M MİKRO-YAPISAL SL
                    // -------------------------------------------------------------
                    else if (stratId === 1) {
                        if (isScalp) {
                            let sL5 = Infinity, sH5 = -Infinity;
                            for (let k = 0; k < 5; k++) {
                                const pastIdx = Math.max(0, i - k);
                                if (dataBase[pastIdx].low < sL5) sL5 = dataBase[pastIdx].low;
                                if (dataBase[pastIdx].high > sH5) sH5 = dataBase[pastIdx].high;
                            }
                            const buf = atr * 0.2;
                            if (isBuy) {
                                const dist = Math.max(0.8 * atr, Math.min(2.0 * atr, c - (sL5 - buf)));
                                sl = c - dist;
                                tp = c + (dist * 1.5);
                            } else {
                                const dist = Math.max(0.8 * atr, Math.min(2.0 * atr, (sH5 + buf) - c));
                                sl = c + dist;
                                tp = c - (dist * 1.5);
                            }
                            rrRatio = 1.5;
                            extraInfo = `1M Mikro-Yapısal SL: Son 5 Bar Swing + 0.2x ATR`;
                        } else {
                            let swingLow10 = Infinity, swingHigh10 = -Infinity;
                            for (let k = 0; k < 10; k++) {
                                const pastIdx = Math.max(0, i - k);
                                if (dataBase[pastIdx].low < swingLow10) swingLow10 = dataBase[pastIdx].low;
                                if (dataBase[pastIdx].high > swingHigh10) swingHigh10 = dataBase[pastIdx].high;
                            }

                            const curKijun = kijunBase[i];
                            const atrBuffer = atr * 0.4;
                            const minDistance = atr * 1.0;
                            const maxDistance = atr * 3.0;

                            if (isBuy) {
                                const cloudBot = Math.min(curSa, curSb);
                                const structuralAnchor = Math.min(swingLow10, curKijun, cloudBot);
                                let rawDistance = c - (structuralAnchor - atrBuffer);
                                let finalDistance = Math.max(minDistance, Math.min(maxDistance, rawDistance));
                                sl = c - finalDistance;
                                tp = c + (finalDistance * 1.67);
                                extraInfo = `Yapısal Destek: $${structuralAnchor.toFixed(1)} + 0.4x ATR Tampon`;
                            } else {
                                const cloudTop = Math.max(curSa, curSb);
                                const structuralAnchor = Math.max(swingHigh10, curKijun, cloudTop);
                                let rawDistance = (structuralAnchor + atrBuffer) - c;
                                let finalDistance = Math.max(minDistance, Math.min(maxDistance, rawDistance));
                                sl = c + finalDistance;
                                tp = c - (finalDistance * 1.67);
                                extraInfo = `Yapısal Direnç: $${structuralAnchor.toFixed(1)} + 0.4x ATR Tampon`;
                            }
                        }
                    }
                    // -------------------------------------------------------------
                    // STRATEJİ 0: KLASİK SABİT
                    // -------------------------------------------------------------
                    else {
                        if (isScalp) {
                            sl = isBuy ? (c - atr * 1.2) : (c + atr * 1.2);
                            tp = isBuy ? (c + atr * 1.8) : (c - atr * 1.8);
                            rrRatio = 1.8 / 1.2;
                            extraInfo = `1M Sabit SL: 1.2x ATR | TP: 1.8x ATR`;
                        } else {
                            sl = isBuy ? (c - atr * 1.5) : (c + atr * 1.5);
                            tp = isBuy ? (c + atr * 2.5) : (c - atr * 2.5);
                            rrRatio = 2.5 / 1.5;
                            extraInfo = `Sabit SL: 1.5x ATR | TP: 2.5x ATR`;
                        }
                    }

                    // BACKTEST MOTORU SİMÜLASYONU
                    let btStatus = 'OPEN';
                    let exitIndex = N_base - 1;
                    let exitPrice = c;
                    let pnlPct = 0;
                    let currentDynamicStop = sl;
                    let highestProfitAtr = 0;

                    for (let step = i + 1; step < N_base; step++) {
                        const barHigh = dataBase[step].high;
                        const barLow = dataBase[step].low;
                        const stepAtr = atrArr[step] || atr;
                        const stepKijun = kijunBase[step] || c;

                        // STRATEJİ 3 İÇİN TRAILING / BREAKEVEN GÜNCELLEMESİ
                        if (stratId === 3) {
                            const curProfitAtr = isBuy ? (barHigh - c) / atr : (c - barLow) / atr;
                            if (curProfitAtr > highestProfitAtr) highestProfitAtr = curProfitAtr;

                            if (isScalp) {
                                // 1M Hızlı Breakeven (+0.6 ATR üstü)
                                if (highestProfitAtr >= 0.6) {
                                    const beStop = isBuy ? c + (atr * 0.05) : c - (atr * 0.05);
                                    if (isBuy && beStop > currentDynamicStop) currentDynamicStop = beStop;
                                    if (!isBuy && beStop < currentDynamicStop) currentDynamicStop = beStop;
                                }
                            } else {
                                // 1H Erken Breakeven (+0.8 ATR üstü)
                                if (highestProfitAtr >= 0.8) {
                                    const beStop = isBuy ? c + (atr * 0.05) : c - (atr * 0.05);
                                    if (isBuy && beStop > currentDynamicStop) currentDynamicStop = beStop;
                                    if (!isBuy && beStop < currentDynamicStop) currentDynamicStop = beStop;
                                }
                                // 1H Kijun-sen Trailing (+2.2 ATR üstü)
                                if (highestProfitAtr >= 2.2 && stepKijun > 0) {
                                    const kijunStop = isBuy ? stepKijun - (stepAtr * 0.2) : stepKijun + (stepAtr * 0.2);
                                    if (isBuy && kijunStop > currentDynamicStop) currentDynamicStop = kijunStop;
                                    if (!isBuy && kijunStop < currentDynamicStop) currentDynamicStop = kijunStop;
                                }
                            }
                        }

                        if (isBuy) {
                            const hitTp = barHigh >= tp;
                            const hitSl = barLow <= currentDynamicStop;

                            if (hitTp && !hitSl) {
                                btStatus = 'TP'; exitIndex = step; exitPrice = tp; break;
                            } else if (hitSl && !hitTp) {
                                btStatus = 'SL'; exitIndex = step; exitPrice = currentDynamicStop; break;
                            } else if (hitTp && hitSl) {
                                if (dataBase[step].close >= dataBase[step].open) {
                                    btStatus = 'TP'; exitPrice = tp;
                                } else {
                                    btStatus = 'SL'; exitPrice = currentDynamicStop;
                                }
                                exitIndex = step;
                                break;
                            }
                        } else {
                            const hitTp = barLow <= tp;
                            const hitSl = barHigh >= currentDynamicStop;

                            if (hitTp && !hitSl) {
                                btStatus = 'TP'; exitIndex = step; exitPrice = tp; break;
                            } else if (hitSl && !hitTp) {
                                btStatus = 'SL'; exitIndex = step; exitPrice = currentDynamicStop; break;
                            } else if (hitTp && hitSl) {
                                if (dataBase[step].close <= dataBase[step].open) {
                                    btStatus = 'TP'; exitPrice = tp;
                                } else {
                                    btStatus = 'SL'; exitPrice = currentDynamicStop;
                                }
                                exitIndex = step;
                                break;
                            }
                        }
                    }

                    if (isBuy) {
                        pnlPct = ((exitPrice - c) / c) * 100;
                    } else {
                        pnlPct = ((c - exitPrice) / c) * 100;
                    }

                    if (stratId === 3 && btStatus === 'SL' && pnlPct >= 0) {
                        btStatus = 'TP';
                    }

                    signals.push({
                        index: i,
                        type: sigType,
                        label: sigLabel,
                        isBuy: isBuy,
                        price: c,
                        sl: sl,
                        tp: tp,
                        rrRatio: rrRatio,
                        btStatus: btStatus,
                        exitIndex: exitIndex,
                        exitPrice: exitPrice,
                        pnlPct: pnlPct,
                        extraInfo: extraInfo,
                        time: dataBase[i].time
                    });
                }
            }

            return { sa: saBase, sb: sbBase, ema4H: emaLiveArr, regime1D: regimeArr, atrArr, signals, tfCfg };
        }

        // ============================================================
        // 📊 GÖRÜNEN EKRAN KÜMÜLATİF ALL-IN HESAPLAYICISI
        // ============================================================
        function updateVisibleBacktestSummary() {
            if (!isBacktestActive || calculatedSignals.length === 0) return;

            const visibleSignals = calculatedSignals.filter(s => s.index >= viewStart && s.index <= viewEnd);
            const vSpan = Math.round(viewEnd - viewStart);
            document.getElementById('vbt-candle-span').innerText = `${vSpan} Mum Aralığı`;

            let tpCount = 0;
            let slCount = 0;
            let openCount = 0;

            let initialCapital = 1000.0;
            let currentCapital = initialCapital;

            for (const sig of visibleSignals) {
                if (sig.btStatus === 'TP') tpCount++;
                else if (sig.btStatus === 'SL') slCount++;
                else openCount++;

                if (sig.btStatus === 'TP' || sig.btStatus === 'SL') {
                    const tradeReturnRatio = sig.pnlPct / 100.0;
                    currentCapital = currentCapital * (1.0 + tradeReturnRatio);
                }
            }

            const totalFinished = tpCount + slCount;
            const winRate = totalFinished > 0 ? ((tpCount / totalFinished) * 100).toFixed(1) : '0.0';
            const netPnlPct = (((currentCapital - initialCapital) / initialCapital) * 100);

            document.getElementById('vbt-total-sig').innerText = visibleSignals.length;
            document.getElementById('vbt-tp-count').innerText = tpCount;
            document.getElementById('vbt-sl-count').innerText = slCount;
            document.getElementById('vbt-open-count').innerText = openCount;
            document.getElementById('vbt-winrate').innerText = `%${winRate}`;

            const finalBalanceElem = document.getElementById('vbt-final-balance');
            const netPnlElem = document.getElementById('vbt-net-pnl');

            finalBalanceElem.innerText = `$${currentCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            if (netPnlPct >= 0) {
                finalBalanceElem.className = 'pnl-badge-up';
                netPnlElem.className = 'pnl-badge-up';
                netPnlElem.innerText = `+${netPnlPct.toFixed(2)}% (+$${(currentCapital - initialCapital).toFixed(2)}) 🚀`;
            } else {
                finalBalanceElem.className = 'pnl-badge-down';
                netPnlElem.className = 'pnl-badge-down';
                netPnlElem.innerText = `${netPnlPct.toFixed(2)}% (-$${(initialCapital - currentCapital).toFixed(2)}) 🔻`;
            }
        }

        function updateGpuTextures() {
            totalCandles = candleDataBase.length;
            if (totalCandles === 0) return;

            const ind = calculateSqiciBekiR_MultiStrategy(candleDataBase, candleDataEma, candleDataRegime, activeStrategy, currentTimeframe);
            calculatedSignals = ind.signals;
            const tfCfg = ind.tfCfg || TIMEFRAME_CONFIGS['1h'];

            const candleFloatArr = new Float32Array(totalCandles * 4);
            const indFloatArr = new Float32Array(totalCandles * 4);

            for (let i = 0; i < totalCandles; i++) {
                const idx = i * 4;
                candleFloatArr[idx + 0] = candleDataBase[i].open;
                candleFloatArr[idx + 1] = candleDataBase[i].high;
                candleFloatArr[idx + 2] = candleDataBase[i].low;
                candleFloatArr[idx + 3] = candleDataBase[i].close;

                indFloatArr[idx + 0] = ind.regime1D[i];
                indFloatArr[idx + 1] = ind.sa[i];
                indFloatArr[idx + 2] = ind.sb[i];
                indFloatArr[idx + 3] = ind.ema4H[i];
            }

            if (!candleTex) candleTex = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, candleTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, totalCandles, 1, 0, gl.RGBA, gl.FLOAT, candleFloatArr);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            if (!indTex) indTex = gl.createTexture();
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, indTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, totalCandles, 1, 0, gl.RGBA, gl.FLOAT, indFloatArr);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            document.getElementById('total-candles-stat').innerText = totalCandles;

            const lastIdx = totalCandles - 1;
            const lastClose = candleDataBase[lastIdx].close;
            const lastReg = ind.regime1D[lastIdx];
            const lastEma = ind.ema4H[lastIdx];

            const hudRegime = document.getElementById('hud-regime');
            const hudEma = document.getElementById('hud-ema');
            const hudTrend = document.getElementById('hud-trend');

            if (lastReg > 0.5) {
                hudRegime.innerText = `${tfCfg.regimeLabel}: BOĞA (YEŞİL)`;
                hudRegime.className = 'hud-tag tag-bull';
            } else if (lastReg < -0.5) {
                hudRegime.innerText = `${tfCfg.regimeLabel}: AYI (KIRMIZI)`;
                hudRegime.className = 'hud-tag tag-bear';
            } else {
                hudRegime.innerText = `${tfCfg.regimeLabel}: NÖTR`;
                hudRegime.className = 'hud-tag tag-bull';
            }

            if (lastClose >= lastEma) {
                hudEma.innerText = `${tfCfg.emaLabel}: ÜSTÜNDE (BOĞA)`;
                hudEma.className = 'hud-tag tag-bull';
            } else {
                hudEma.innerText = `${tfCfg.emaLabel}: ALTINDA (AYI)`;
                hudEma.className = 'hud-tag tag-bear';
            }

            if (lastReg > 0.5 && lastClose >= lastEma) {
                hudTrend.innerText = 'GÜÇLÜ BOĞA 🚀';
                hudTrend.className = 'hud-tag tag-bull';
            } else if (lastReg < -0.5 && lastClose < lastEma) {
                hudTrend.innerText = 'GÜÇLÜ AYI 🔻';
                hudTrend.className = 'hud-tag tag-bear';
            } else {
                hudTrend.innerText = 'NÖTR / DÖNÜŞ';
                hudTrend.className = 'hud-tag tag-bull';
            }

            document.getElementById('ohlc-atr').innerText = ind.atrArr[lastIdx].toFixed(2);
            updateVisibleBacktestSummary();
        }

        // ============================================================
        // 🎆 EKRAN GENELİ MİNİK HAVAİ FİŞEK VE KUTLAMA PARÇACIK MOTORU
        // ============================================================
        const SCREEN_FIREWORKS = [
            { relX: 0.12, relY: 0.22, seed: 1.2, speed: 1.15, size: 28, color: '#10b981' },
            { relX: 0.28, relY: 0.16, seed: 3.7, speed: 1.30, size: 36, color: '#38bdf8' },
            { relX: 0.48, relY: 0.24, seed: 5.1, speed: 0.95, size: 32, color: '#fbbf24' },
            { relX: 0.68, relY: 0.18, seed: 2.4, speed: 1.25, size: 38, color: '#34d399' },
            { relX: 0.86, relY: 0.22, seed: 4.8, speed: 1.05, size: 30, color: '#6ee7b7' },
            { relX: 0.20, relY: 0.52, seed: 6.3, speed: 1.40, size: 34, color: '#facc15' },
            { relX: 0.80, relY: 0.55, seed: 7.9, speed: 1.10, size: 32, color: '#00f2fe' },
            { relX: 0.38, relY: 0.68, seed: 8.5, speed: 0.85, size: 26, color: '#10b981' },
            { relX: 0.62, relY: 0.70, seed: 9.2, speed: 1.35, size: 30, color: '#38bdf8' }
        ];

        function drawScreenWideCelebrationFireworks(ctx, cssW, cssH, timeNow, globalAlpha) {
            if (globalAlpha <= 0.01) return;
            ctx.save();

            for (let f = 0; f < SCREEN_FIREWORKS.length; f++) {
                const fw = SCREEN_FIREWORKS[f];
                const cx = fw.relX * cssW;
                const cy = fw.relY * cssH;
                const cycle = ((timeNow * 0.0014 * fw.speed) + fw.seed) % 1.0;
                const radius = cycle * fw.size;
                const burstAlpha = Math.max(0, 1.0 - cycle * 1.05) * globalAlpha;

                const pCount = 12;
                for (let i = 0; i < pCount; i++) {
                    const angle = (i / pCount) * Math.PI * 2 + fw.seed + (cycle * 0.6);
                    const dist = radius * (0.6 + 0.4 * Math.sin(i * 2.5 + fw.seed));
                    const px = Math.round(cx + Math.cos(angle) * dist);
                    const py = Math.round(cy + Math.sin(angle) * dist + (cycle * cycle * 12)); // hafif yerçekimi

                    ctx.fillStyle = fw.color;
                    ctx.shadowColor = fw.color;
                    ctx.shadowBlur = 8;
                    ctx.globalAlpha = burstAlpha;

                    const pSize = Math.max(0.6, (1.0 - cycle) * 2.6);
                    ctx.beginPath();
                    ctx.arc(px, py, pSize, 0, Math.PI * 2);
                    ctx.fill();

                    // Minik parıldayan altın yıldızlar
                    if (i % 3 === 0 && cycle > 0.15 && cycle < 0.75) {
                        ctx.fillStyle = '#ffffff';
                        ctx.shadowColor = '#fbbf24';
                        ctx.shadowBlur = 10;
                        ctx.fillRect(px - 1, py - 1, 2, 2);
                    }
                }

                // Havai fişek merkez parıltısı
                if (cycle < 0.22) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = fw.color;
                    ctx.shadowBlur = 16;
                    ctx.globalAlpha = Math.max(0, (1.0 - cycle * 4.5)) * globalAlpha;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        // ============================================================
        // 🎯 60/120 FPS GPU SMOOTH LERP ANİMASYON DURUM MOTORU
        // ============================================================
        let hoveredCandleIdx = -1;
        let focusAnim = {
            currentSigIndex: -1,
            progress: 0.0 // 0.0 (normal) -> 1.0 (tam odaklanmış spotlight)
        };

        // ============================================================
        // HiDPI DİNAMİK VEKTÖR TP / SL VE ROZET ÇİZİCİSİ (PÜRÜZSÜZ GPU ODAKLI)
        // ============================================================
        function drawVectorSignalsAndTargets(timeNow) {
            const cssW = canvasContainer.clientWidth;
            const cssH = canvasContainer.clientHeight;

            if (!ctx2d || !layers.signals || totalCandles === 0) {
                ctx2d.clearRect(0, 0, cssW, cssH);
                return;
            }

            ctx2d.clearRect(0, 0, cssW, cssH);

            const visibleCount = viewEnd - viewStart;
            if (visibleCount <= 0) return;

            function getY(price) {
                const diff = maxPrice - minPrice;
                if (diff <= 0.0001) return cssH / 2;
                return Math.round(cssH - ((price - minPrice) / diff) * cssH);
            }

            // 1. Hovered Sinyal ve Smooth Progress Güncellemesi (Lerp)
            const hoveredSig = (hoveredCandleIdx >= 0) ? calculatedSignals.find(s => Math.abs(s.index - hoveredCandleIdx) <= 0.5) : null;
            const targetSigIdx = hoveredSig ? hoveredSig.index : -1;

            if (targetSigIdx !== -1) {
                focusAnim.currentSigIndex = targetSigIdx;
            }

            const targetProgress = (targetSigIdx !== -1) ? 1.0 : 0.0;
            // 60-120 FPS akıcı geçiş için pürüzsüz üssel yaklaşım (Lerp)
            focusAnim.progress += (targetProgress - focusAnim.progress) * 0.14;

            if (focusAnim.progress < 0.002) {
                focusAnim.progress = 0.0;
                if (targetSigIdx === -1) focusAnim.currentSigIndex = -1;
            }

            const activeFocusSig = (focusAnim.currentSigIndex !== -1) ? calculatedSignals.find(s => s.index === focusAnim.currentSigIndex) : null;

            // 2. Smooth Sinematik Arka Plan Karartması (Vignette Fade-in/out)
            if (focusAnim.progress > 0.002) {
                ctx2d.save();
                ctx2d.fillStyle = `rgba(3, 7, 18, ${(focusAnim.progress * 0.76).toFixed(3)})`;
                ctx2d.fillRect(0, 0, cssW, cssH);
                ctx2d.restore();
            }

            // 3. Başarılı İşlemde Ekran Geneli Minik Havai Fişek Patlamaları (Smooth Fade-in)
            if (activeFocusSig && activeFocusSig.btStatus === 'TP' && focusAnim.progress > 0.01) {
                drawScreenWideCelebrationFireworks(ctx2d, cssW, cssH, timeNow, focusAnim.progress * 0.95);
            }

            // 4. Arka Plandaki Diğer Sinyallerin Çizimi (Smooth Karartma Oranıyla)
            const otherAlpha = Math.max(0.12, 1.0 - (focusAnim.progress * 0.84));

            for (const sig of calculatedSignals) {
                if (sig.index < viewStart - 8 || sig.index > viewEnd + 8) continue;
                if (activeFocusSig && sig.index === activeFocusSig.index && focusAnim.progress > 0.01) continue; // Odaktaki sinyali en üstte smooth çizeceğiz

                ctx2d.save();
                ctx2d.globalAlpha = otherAlpha;

                const candleCenter = sig.index + 0.5;
                const screenX = Math.round(((candleCenter - viewStart) / visibleCount) * cssW);
                const candle = candleDataBase[sig.index];
                if (!candle) { ctx2d.restore(); continue; }

                const entryY = getY(sig.price);
                const highY = getY(candle.high);
                const lowY = getY(candle.low);
                const tpY = getY(sig.tp);
                const slY = getY(sig.sl);

                const isBuy = sig.isBuy;
                const isTpWin = sig.btStatus === 'TP';
                const isSlLoss = sig.btStatus === 'SL';

                let badgeColor = isBuy ? '#10b981' : '#ef4444';
                let badgeBg = isBuy ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';

                if (isBacktestActive) {
                    if (isTpWin) {
                        badgeColor = '#10b981';
                        badgeBg = 'rgba(16, 185, 129, 0.95)';
                    } else if (isSlLoss) {
                        badgeColor = '#ef4444';
                        badgeBg = 'rgba(150, 25, 35, 0.85)';
                    }
                }

                const badgeY = isBuy ? lowY + 24 : highY - 24;

                // Sinyal Rozeti
                ctx2d.fillStyle = badgeBg;
                ctx2d.strokeStyle = isTpWin ? '#fef08a' : (isSlLoss ? '#fca5a5' : '#ffffff');
                ctx2d.lineWidth = isTpWin ? 2 : 1;
                ctx2d.shadowColor = badgeColor;
                ctx2d.shadowBlur = isTpWin ? 14 : 6;

                let text = isBuy ? `▲ ${sig.type}` : `▼ ${sig.type}`;
                if (isBacktestActive && isTpWin) text += ' 🏆 TP';

                ctx2d.font = 'bold 10.5px "SF Pro Text", "Segoe UI", sans-serif';
                const textMetrics = ctx2d.measureText(text);
                const textWidth = Math.round(textMetrics.width);
                const rx = Math.round(screenX - textWidth / 2 - 7);
                const ry = Math.round(badgeY - 10);
                const rw = textWidth + 14;
                const rh = 20;

                ctx2d.beginPath();
                ctx2d.roundRect(rx, ry, rw, rh, 5);
                ctx2d.fill();
                ctx2d.stroke();

                ctx2d.fillStyle = '#ffffff';
                ctx2d.textAlign = 'center';
                ctx2d.textBaseline = 'middle';
                ctx2d.fillText(text, screenX, badgeY);

                // Stop Çarpı (X)
                if (isBacktestActive && isSlLoss) {
                    ctx2d.strokeStyle = '#ef4444';
                    ctx2d.lineWidth = 3;
                    const crossSize = 9;
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX - crossSize, badgeY - crossSize);
                    ctx2d.lineTo(screenX + crossSize, badgeY + crossSize);
                    ctx2d.moveTo(screenX + crossSize, badgeY - crossSize);
                    ctx2d.lineTo(screenX - crossSize, badgeY + crossSize);
                    ctx2d.stroke();
                }

                // Normal Modda Uzaktaki TP / SL Çizgileri
                if (visibleCount < 400) {
                    const projDistance = isBacktestActive ? Math.min(sig.exitIndex - sig.index, 25) : 8;
                    const projEndX = Math.round(Math.min(cssW - 90, screenX + (cssW / visibleCount) * Math.max(6, projDistance)));

                    // TP
                    ctx2d.strokeStyle = isTpWin ? '#10b981' : (isSlLoss ? 'rgba(100, 116, 139, 0.4)' : 'rgba(16, 185, 129, 0.8)');
                    ctx2d.lineWidth = isTpWin ? 2 : 1.5;
                    ctx2d.setLineDash(isSlLoss ? [2, 4] : [4, 3]);
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, entryY);
                    ctx2d.lineTo(screenX, tpY);
                    ctx2d.lineTo(projEndX, tpY);
                    ctx2d.stroke();

                    // SL
                    ctx2d.strokeStyle = isSlLoss ? '#ef4444' : (isTpWin ? 'rgba(100, 116, 139, 0.4)' : 'rgba(239, 68, 68, 0.8)');
                    ctx2d.lineWidth = isSlLoss ? 2 : 1.5;
                    ctx2d.setLineDash(isTpWin ? [2, 4] : [4, 3]);
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, entryY);
                    ctx2d.lineTo(screenX, slY);
                    ctx2d.lineTo(projEndX, slY);
                    ctx2d.stroke();
                    ctx2d.setLineDash([]);
                }

                ctx2d.restore();
            }

            // 5. 🌟 SAF GPU SMOOTH ODAK MODU (PÜRÜZSÜZ BÜYÜYEN MUM & YATAYDA MUMU ORTALAYAN TP/SL ROZETLERİ)
            if (activeFocusSig && focusAnim.progress > 0.002) {
                const sig = activeFocusSig;
                const candleCenter = sig.index + 0.5;
                const screenX = Math.round(((candleCenter - viewStart) / visibleCount) * cssW);
                const candle = candleDataBase[sig.index];

                if (candle) {
                    const entryY = getY(sig.price);
                    const highY = getY(candle.high);
                    const lowY = getY(candle.low);
                    const openY = getY(candle.open);
                    const closeY = getY(candle.close);
                    const tpY = getY(sig.tp);
                    const slY = getY(sig.sl);

                    const isBuy = sig.isBuy;
                    const isTpWin = sig.btStatus === 'TP';
                    const isSlLoss = sig.btStatus === 'SL';
                    const prog = focusAnim.progress;

                    ctx2d.save();

                    // A. DİKEY PARLAK IŞIK SÜTUNU (SPOTLIGHT BEAM - SMOOTH FADE)
                    const beamGrad = ctx2d.createLinearGradient(screenX, 0, screenX, cssH);
                    beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.0)');
                    beamGrad.addColorStop(0.3, isBuy ? `rgba(16, 185, 129, ${(0.14 * prog).toFixed(3)})` : `rgba(239, 68, 68, ${(0.14 * prog).toFixed(3)})`);
                    beamGrad.addColorStop(0.5, isBuy ? `rgba(16, 185, 129, ${(0.28 * prog).toFixed(3)})` : `rgba(239, 68, 68, ${(0.28 * prog).toFixed(3)})`);
                    beamGrad.addColorStop(0.7, isBuy ? `rgba(16, 185, 129, ${(0.14 * prog).toFixed(3)})` : `rgba(239, 68, 68, ${(0.14 * prog).toFixed(3)})`);
                    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
                    
                    const beamWidth = Math.max(50, (cssW / visibleCount) * (2.0 + 2.0 * prog));
                    ctx2d.fillStyle = beamGrad;
                    ctx2d.fillRect(screenX - beamWidth / 2, 0, beamWidth, cssH);

                    // B. TP / SL HEDEF ALANLARI VE YATAYDA MUMU ORTALAYAN HAREKETLİ ROZET KONUMU
                    const projDistance = isBacktestActive ? Math.min(sig.exitIndex - sig.index, 35) : 16;
                    const baseProjEndX = Math.round(Math.min(cssW - 20, screenX + (cssW / visibleCount) * Math.max(12, projDistance)));
                    
                    // ✨ Kullanıcı Talebi: TP ve SL yazıları uzaktan başlayıp yavaşça MUMU YATAYDA ORTALAYACAK şekilde kayar!
                    const badgeCenterX = Math.round(baseProjEndX + (screenX - baseProjEndX) * prog);

                    // TP Alanı (Yeşil Kâr Kutusu - Smooth Opaklık)
                    const tpTop = Math.min(entryY, tpY);
                    const tpHeight = Math.max(2, Math.abs(tpY - entryY));
                    ctx2d.fillStyle = `rgba(16, 185, 129, ${(0.24 * prog).toFixed(3)})`;
                    const boxRight = Math.max(screenX + 30, baseProjEndX);
                    ctx2d.fillRect(screenX, tpTop, boxRight - screenX, tpHeight);

                    // SL Alanı (Kırmızı Risk Kutusu - Smooth Opaklık)
                    const slTop = Math.min(entryY, slY);
                    const slHeight = Math.max(2, Math.abs(slY - entryY));
                    ctx2d.fillStyle = `rgba(239, 68, 68, ${(0.24 * prog).toFixed(3)})`;
                    ctx2d.fillRect(screenX, slTop, boxRight - screenX, slHeight);

                    // C. KALIN IŞILDAYAN TP VE SL SEVİYE ÇİZGİLERİ
                    // TP Çizgisi
                    ctx2d.strokeStyle = '#10b981';
                    ctx2d.lineWidth = 2.0 + 1.8 * prog;
                    ctx2d.shadowColor = '#10b981';
                    ctx2d.shadowBlur = 10 + 18 * prog;
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, entryY);
                    ctx2d.lineTo(screenX, tpY);
                    ctx2d.lineTo(boxRight, tpY);
                    ctx2d.stroke();

                    // SL Çizgisi
                    ctx2d.strokeStyle = '#ef4444';
                    ctx2d.lineWidth = 2.0 + 1.8 * prog;
                    ctx2d.shadowColor = '#ef4444';
                    ctx2d.shadowBlur = 10 + 18 * prog;
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, entryY);
                    ctx2d.lineTo(screenX, slY);
                    ctx2d.lineTo(boxRight, slY);
                    ctx2d.stroke();

                    // Giriş Çizgisi (Kesikli Altın)
                    ctx2d.strokeStyle = '#fbbf24';
                    ctx2d.lineWidth = 1.5 + 0.8 * prog;
                    ctx2d.shadowColor = '#fbbf24';
                    ctx2d.shadowBlur = 8 + 10 * prog;
                    ctx2d.setLineDash([5, 4]);
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, entryY);
                    ctx2d.lineTo(boxRight, entryY);
                    ctx2d.stroke();
                    ctx2d.setLineDash([]);

                    // D. PÜRÜZSÜZ (SMOOTH LERP) BÜYÜYEN SİNYAL MUMU (1.0X -> 2.25X)
                    const baseCandleW = (cssW / visibleCount) * 0.8;
                    const candleW = Math.max(10, baseCandleW * (1.0 + 1.35 * prog));
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(5, Math.abs(closeY - openY));
                    const isCandleBull = candle.close >= candle.open;

                    // Fitil (Wick)
                    ctx2d.strokeStyle = isCandleBull ? '#34d399' : '#f87171';
                    ctx2d.lineWidth = 2.0 + 2.2 * prog;
                    ctx2d.shadowColor = ctx2d.strokeStyle;
                    ctx2d.shadowBlur = 8 + 18 * prog;
                    ctx2d.beginPath();
                    ctx2d.moveTo(screenX, highY);
                    ctx2d.lineTo(screenX, lowY);
                    ctx2d.stroke();

                    // Gövde (Body)
                    ctx2d.fillStyle = isCandleBull ? '#10b981' : '#ef4444';
                    ctx2d.strokeStyle = '#ffffff';
                    ctx2d.lineWidth = 1.5 + 1.5 * prog;
                    ctx2d.shadowColor = ctx2d.fillStyle;
                    ctx2d.shadowBlur = 10 + 26 * prog;
                    ctx2d.fillRect(screenX - candleW / 2, bodyTop, candleW, bodyHeight);
                    ctx2d.strokeRect(screenX - candleW / 2, bodyTop, candleW, bodyHeight);

                    // E. YATAYDA MUMU ORTALAYAN DEVASA HOLOGRAFİK TP / SL ROZETLERİ
                    const targetPnlPct = Math.abs((sig.tp - sig.price) / sig.price * 100).toFixed(2);
                    const riskPnlPct = Math.abs((sig.price - sig.sl) / sig.price * 100).toFixed(2);

                    // 1. TP Holografik Rozeti (Mumu Yatayda Ortalar)
                    ctx2d.fillStyle = 'rgba(6, 78, 59, 0.96)';
                    ctx2d.strokeStyle = '#10b981';
                    ctx2d.lineWidth = 2;
                    ctx2d.shadowColor = '#10b981';
                    ctx2d.shadowBlur = 18;
                    const tpText = `🎯 TP HEDEFİ: $${sig.tp.toFixed(1)} (+%${targetPnlPct}) ${isTpWin ? '🏆 KAZANDI' : ''}`;
                    ctx2d.font = 'bold 12.5px "SF Pro Text", "Segoe UI", sans-serif';
                    const tpMetrics = ctx2d.measureText(tpText);
                    const tpW = Math.round(tpMetrics.width) + 18;
                    const tpH = 24;
                    ctx2d.beginPath();
                    ctx2d.roundRect(badgeCenterX - tpW / 2, tpY - tpH / 2, tpW, tpH, 6);
                    ctx2d.fill();
                    ctx2d.stroke();
                    ctx2d.fillStyle = '#ffffff';
                    ctx2d.textAlign = 'center';
                    ctx2d.textBaseline = 'middle';
                    ctx2d.fillText(tpText, badgeCenterX, tpY);

                    // 2. SL Holografik Rozeti (Mumu Yatayda Ortalar)
                    ctx2d.fillStyle = 'rgba(127, 29, 29, 0.96)';
                    ctx2d.strokeStyle = '#ef4444';
                    ctx2d.lineWidth = 2;
                    ctx2d.shadowColor = '#ef4444';
                    ctx2d.shadowBlur = 18;
                    const slText = `🛡️ STOP LOSS: $${sig.sl.toFixed(1)} (-%${riskPnlPct}) ${isSlLoss ? '❌ STOP' : ''}`;
                    ctx2d.font = 'bold 12.5px "SF Pro Text", "Segoe UI", sans-serif';
                    const slMetrics = ctx2d.measureText(slText);
                    const slW = Math.round(slMetrics.width) + 18;
                    const slH = 24;
                    ctx2d.beginPath();
                    ctx2d.roundRect(badgeCenterX - slW / 2, slY - slH / 2, slW, slH, 6);
                    ctx2d.fill();
                    ctx2d.stroke();
                    ctx2d.fillStyle = '#ffffff';
                    ctx2d.textAlign = 'center';
                    ctx2d.textBaseline = 'middle';
                    ctx2d.fillText(slText, badgeCenterX, slY);

                    // 3. Giriş Seviye Rozeti (Mumu Yatayda Ortalar)
                    ctx2d.fillStyle = 'rgba(15, 23, 42, 0.96)';
                    ctx2d.strokeStyle = '#fbbf24';
                    ctx2d.lineWidth = 1.5;
                    ctx2d.shadowColor = '#fbbf24';
                    ctx2d.shadowBlur = 14;
                    const entryText = `⚡ GİRİŞ: $${sig.price.toFixed(1)} | R:R 1 : ${sig.rrRatio.toFixed(2)}`;
                    ctx2d.font = 'bold 11px "SF Pro Text", "Segoe UI", sans-serif';
                    const entryMetrics = ctx2d.measureText(entryText);
                    const entryW = Math.round(entryMetrics.width) + 16;
                    const entryH = 20;
                    ctx2d.beginPath();
                    ctx2d.roundRect(badgeCenterX - entryW / 2, entryY - entryH / 2, entryW, entryH, 5);
                    ctx2d.fill();
                    ctx2d.stroke();
                    ctx2d.fillStyle = '#fef08a';
                    ctx2d.textAlign = 'center';
                    ctx2d.textBaseline = 'middle';
                    ctx2d.fillText(entryText, badgeCenterX, entryY);

                    // F. BÜYÜTÜLMÜŞ SİNYAL ETİKET ROZETİ (MUMUN HEMEN YANINDA / ÜSTÜNDE)
                    const badgeY = isBuy ? lowY + 36 : highY - 36;
                    const badgeColor = isBuy ? '#10b981' : '#ef4444';
                    const badgeBg = isBuy ? 'rgba(16, 185, 129, 1.0)' : 'rgba(239, 68, 68, 1.0)';
                    const badgeText = `⚡ ${sig.label.toUpperCase()}`;

                    ctx2d.fillStyle = badgeBg;
                    ctx2d.strokeStyle = '#ffffff';
                    ctx2d.lineWidth = 2.5;
                    ctx2d.shadowColor = badgeColor;
                    ctx2d.shadowBlur = 14 + 18 * prog;

                    ctx2d.font = 'bold 13px "SF Pro Text", "Segoe UI", sans-serif';
                    const bMetrics = ctx2d.measureText(badgeText);
                    const bW = Math.round(bMetrics.width) + 20;
                    const bH = 26;

                    ctx2d.beginPath();
                    ctx2d.roundRect(screenX - bW / 2, badgeY - bH / 2, bW, bH, 7);
                    ctx2d.fill();
                    ctx2d.stroke();

                    ctx2d.fillStyle = '#ffffff';
                    ctx2d.textAlign = 'center';
                    ctx2d.textBaseline = 'middle';
                    ctx2d.fillText(badgeText, screenX, badgeY);

                    ctx2d.restore();
                }
            }
        }

        // ============================================================
        // 📥 BINANCE MTF ÇOKLU ZAMAN DİLİMİ VERİ ÇEKİCİ
        // ============================================================
        async function fetchKlinesForInterval(symbol, interval, targetCount) {
            let allKlines = [];
            let endTime = null;
            const requestsNeeded = Math.ceil(targetCount / 1000);
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

        let candleDataBase = [];
        let candleDataEma = [];
        let candleDataRegime = [];

        async function fetchAllMultiTimeframeKlines(symbol) {
            const tfCfg = TIMEFRAME_CONFIGS[currentTimeframe] || TIMEFRAME_CONFIGS['1h'];
            loadingOverlay.style.display = 'block';
            loadingOverlay.innerText = `⏳ Binance MTF (${tfCfg.label}) Verileri Çekiliyor...`;

            try {
                const [dataBase, dataEma, dataRegime] = await Promise.all([
                    fetchKlinesForInterval(symbol, tfCfg.baseTf, requestedDepth),
                    fetchKlinesForInterval(symbol, tfCfg.emaTf, 1000),
                    fetchKlinesForInterval(symbol, tfCfg.regimeTf, 500)
                ]);

                candleDataBase = dataBase;
                candleDataEma = dataEma;
                candleDataRegime = dataRegime;

                totalCandles = candleDataBase.length;
                viewStart = Math.max(0, totalCandles - 150);
                viewEnd = totalCandles;

                updateGpuTextures();
                connectWebSocket(symbol);

                if (totalCandles > 0) {
                    const last = candleDataBase[totalCandles - 1];
                    document.getElementById('price-val').innerText = last.close.toLocaleString('en-US', {minimumFractionDigits: 2});
                }
            } catch (err) {
                console.error('MTF Veri Çekme Hatası:', err);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        }

        function connectWebSocket(symbol) {
            if (ws) ws.close();

            const tfCfg = TIMEFRAME_CONFIGS[currentTimeframe] || TIMEFRAME_CONFIGS['1h'];
            const streamName = `${symbol.toLowerCase()}@kline_${tfCfg.baseTf}`;
            ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);

            ws.onopen = () => {
                wsDot.style.background = '#10b981';
                wsDot.style.boxShadow = '0 0 8px #10b981';
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                const k = msg.k;
                if (!k) return;

                const candle = {
                    time: k.t,
                    open: parseFloat(k.o),
                    high: parseFloat(k.h),
                    low: parseFloat(k.l),
                    close: parseFloat(k.c),
                    vol: parseFloat(k.v)
                };

                const lastIdx = candleDataBase.length - 1;
                if (lastIdx >= 0 && candleDataBase[lastIdx].time === candle.time) {
                    candleDataBase[lastIdx] = candle;
                } else {
                    candleDataBase.push(candle);
                    if (viewEnd >= totalCandles - 2) {
                        viewStart++;
                        viewEnd++;
                    }
                }

                updateGpuTextures();
                document.getElementById('price-val').innerText = candle.close.toLocaleString('en-US', {minimumFractionDigits: 2});
            };

            ws.onerror = () => { wsDot.style.background = '#ef4444'; };
            ws.onclose = () => { wsDot.style.background = '#f59e0b'; };
        }

        window.changeSymbol = function(sym) {
            currentSymbol = sym;
            fetchAllMultiTimeframeKlines(currentSymbol);
        };

        window.changeCandleDepth = function(depth) {
            requestedDepth = parseInt(depth);
            fetchAllMultiTimeframeKlines(currentSymbol);
        };

        window.fitAllCandles = function() {
            viewStart = 0;
            viewEnd = totalCandles;
            resetPriceScale();
            updateVisibleBacktestSummary();
        };

        // ==========================================
        // DİKEY FİYAT ÖLÇEĞİ VE ETKİLEŞİM
        // ==========================================
        let minPrice = 0;
        let maxPrice = 0;

        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
        };

        priceAxisElem.addEventListener('mousedown', (e) => {
            isPriceDragging = true;
            priceDragStartY = e.clientY;
            e.preventDefault();
        });

        priceAxisElem.addEventListener('dblclick', () => {
            resetPriceScale();
        });

        timeAxisElem.addEventListener('dblclick', () => {
            fitAllCandles();
        });

        // ==========================================
        // YATAY KAYDIRMA (PAN) VE ZOOM
        // ==========================================
        let isChartDragging = false;
        let chartDragStartX = 0;
        let origViewStart = 0;
        let origViewEnd = 0;

        let mousePixelX = -1000;
        let mousePixelY = -1000;

        const crosshairPriceTag = document.getElementById('crosshair-price-tag');
        const crosshairTimeTag = document.getElementById('crosshair-time-tag');
        const currentPriceBadge = document.getElementById('current-price-badge');
        const priceLabelsContainer = document.getElementById('price-labels-container');
        const timeLabelsContainer = document.getElementById('time-labels-container');
        const ohlcO = document.getElementById('ohlc-o');
        const ohlcH = document.getElementById('ohlc-h');
        const ohlcL = document.getElementById('ohlc-l');
        const ohlcC = document.getElementById('ohlc-c');

        const signalInspector = document.getElementById('signal-inspector-card');
        const inspType = document.getElementById('insp-type');
        const inspRr = document.getElementById('insp-rr');
        const inspBtResult = document.getElementById('insp-bt-result');
        const inspEntry = document.getElementById('insp-entry');
        const inspTp = document.getElementById('insp-tp');
        const inspSl = document.getElementById('insp-sl');
        const inspExtra = document.getElementById('insp-extra');

        function startPan(clientX) {
            isChartDragging = true;
            chartDragStartX = clientX;
            origViewStart = viewStart;
            origViewEnd = viewEnd;
            canvasContainer.classList.add('grabbing');
            timeAxisElem.classList.add('grabbing');
        }

        canvasContainer.addEventListener('mousedown', (e) => {
            startPan(e.clientX);
        });

        timeAxisElem.addEventListener('mousedown', (e) => {
            startPan(e.clientX);
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            isChartDragging = false;
            isPriceDragging = false;
            canvasContainer.classList.remove('grabbing');
            timeAxisElem.classList.remove('grabbing');
            updateVisibleBacktestSummary();
        });

        function formatTimeLabelWithYear(date) {
            const yyyy = date.getFullYear();
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const mon = date.toLocaleString('tr-TR', { month: 'short' });
            return `${dd} ${mon} <b>${yyyy}</b> ${hh}:${mm}`;
        }

        function formatFullTime(date) {
            const yyyy = date.getFullYear();
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const mon = date.toLocaleString('tr-TR', { month: 'short' });
            return `${dd} ${mon} ${yyyy} ${hh}:${mm}`;
        }

        window.addEventListener('mousemove', (e) => {
            if (isPriceDragging) {
                const deltaY = priceDragStartY - e.clientY;
                priceScaleFactor = Math.max(0.05, Math.min(25.0, priceScaleFactor * Math.exp(deltaY * 0.006)));
                priceDragStartY = e.clientY;
                return;
            }

            const rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            mousePixelX = (e.clientX - rect.left) * (canvas.width / rect.width);
            mousePixelY = (rect.bottom - e.clientY) * (canvas.height / rect.height);

            if (isChartDragging && totalCandles > 0) {
                const deltaPx = e.clientX - chartDragStartX;
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                if (nStart < 0) {
                    nStart = 0;
                    nEnd = candleSpan;
                }
                if (nEnd > totalCandles) {
                    nEnd = totalCandles;
                    nStart = Math.max(0, totalCandles - candleSpan);
                }

                viewStart = nStart;
                viewEnd = nEnd;
                updateVisibleBacktestSummary();
            }

            const normX = (e.clientX - rect.left) / rect.width;
            const visibleCount = Math.max(1, viewEnd - viewStart);
            const cIdx = Math.floor(viewStart + normX * visibleCount);
            hoveredCandleIdx = cIdx;

            if (cIdx >= 0 && cIdx < totalCandles && candleDataBase[cIdx]) {
                const c = candleDataBase[cIdx];
                ohlcO.innerText = c.open.toFixed(2);
                ohlcH.innerText = c.high.toFixed(2);
                ohlcL.innerText = c.low.toFixed(2);
                ohlcC.innerText = c.close.toFixed(2);
                ohlcC.className = c.close >= c.open ? 'ohlc-val val-up' : 'ohlc-val val-down';

                const date = new Date(c.time);
                crosshairTimeTag.style.display = 'block';
                crosshairTimeTag.style.left = `${e.clientX - rect.left}px`;
                crosshairTimeTag.innerText = formatFullTime(date);

                const sigAtCandle = calculatedSignals.find(s => s.index === cIdx);
                if (sigAtCandle) {
                    signalInspector.style.display = 'flex';
                    inspType.innerText = `⚡ ${sigAtCandle.label}`;
                    inspType.style.color = sigAtCandle.isBuy ? '#10b981' : '#ef4444';
                    inspRr.innerText = `R:R: 1 : ${sigAtCandle.rrRatio.toFixed(2)}`;

                    if (isBacktestActive) {
                        inspBtResult.style.display = 'block';
                        if (sigAtCandle.btStatus === 'TP') {
                            inspBtResult.innerText = `🏆 BACKTEST: TP BAŞARILI! (+${sigAtCandle.pnlPct.toFixed(2)}%)`;
                            inspBtResult.style.color = '#10b981';
                        } else if (sigAtCandle.btStatus === 'SL') {
                            inspBtResult.innerText = `❌ BACKTEST: STOP OLDU! (${sigAtCandle.pnlPct.toFixed(2)}%)`;
                            inspBtResult.style.color = '#ef4444';
                        } else {
                            inspBtResult.innerText = '⌛ BACKTEST: İŞLEM HALA AÇIK';
                            inspBtResult.style.color = '#38bdf8';
                        }
                    } else {
                        inspBtResult.style.display = 'none';
                    }

                    inspEntry.innerText = `GİRİŞ: $${sigAtCandle.price.toFixed(2)}`;
                    inspTp.innerText = `🎯 TP: $${sigAtCandle.tp.toFixed(2)}`;
                    inspSl.innerText = `🛡️ SL: $${sigAtCandle.sl.toFixed(2)}`;
                    inspExtra.innerText = sigAtCandle.extraInfo || '';
                } else {
                    signalInspector.style.display = 'none';
                }
            }

            if (isFinite(minPrice) && isFinite(maxPrice) && maxPrice > minPrice) {
                const normY = (rect.bottom - e.clientY) / rect.height;
                const hoveredPrice = minPrice + normY * (maxPrice - minPrice);
                crosshairPriceTag.style.display = 'block';
                crosshairPriceTag.style.top = `${e.clientY - rect.top}px`;
                crosshairPriceTag.innerText = hoveredPrice.toFixed(2);
            }
        });

        canvasContainer.addEventListener('mouseleave', () => {
            hoveredCandleIdx = -1;
            if (!isChartDragging && !isPriceDragging) {
                mousePixelX = -1000;
                mousePixelY = -1000;
                crosshairPriceTag.style.display = 'none';
                crosshairTimeTag.style.display = 'none';
                signalInspector.style.display = 'none';
            }
        });

        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            const zoomSpeed = 0.0012;
            const zoomFactor = Math.exp(e.deltaY * zoomSpeed);

            const count = Math.max(1, viewEnd - viewStart);
            const newCount = Math.max(10, Math.min(totalCandles, count * zoomFactor));

            const rect = canvas.getBoundingClientRect();
            const mouseNormX = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
            const mouseCandle = viewStart + mouseNormX * count;

            let nStart = mouseCandle - mouseNormX * newCount;
            let nEnd = mouseCandle + (1.0 - mouseNormX) * newCount;

            if (newCount >= totalCandles - 1 || (nStart <= 0 && nEnd >= totalCandles)) {
                nStart = 0;
                nEnd = totalCandles;
            } else {
                if (nStart < 0) {
                    nStart = 0;
                    nEnd = newCount;
                }
                if (nEnd > totalCandles) {
                    nEnd = totalCandles;
                    nStart = Math.max(0, totalCandles - newCount);
                }
            }

            viewStart = Math.max(0, nStart);
            viewEnd = Math.min(totalCandles, nEnd);
            updateVisibleBacktestSummary();
        }, { passive: false });

        function updateTimeScaleLabels() {
            if (totalCandles === 0) return;
            const count = 6;
            const visibleCount = Math.max(1, viewEnd - viewStart);
            let html = '';

            for (let i = 0; i <= count; i++) {
                const pct = i / count;
                const candleIdx = Math.min(totalCandles - 1, Math.max(0, Math.floor(viewStart + pct * visibleCount)));
                const c = candleDataBase[candleIdx];
                if (c && c.time) {
                    const date = new Date(c.time);
                    const labelStr = formatTimeLabelWithYear(date);
                    const leftPx = Math.round(pct * canvasContainer.clientWidth);
                    html += `<div class="time-scale-label" style="left: ${leftPx}px;">${labelStr}</div>`;
                }
            }
            timeLabelsContainer.innerHTML = html;
        }

        function updatePriceScaleLabels() {
            if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice >= maxPrice) return;
            const levels = 8;
            let html = '';
            for (let i = 0; i <= levels; i++) {
                const pct = i / levels;
                const priceAtLevel = minPrice + pct * (maxPrice - minPrice);
                const topPct = (1 - pct) * 100;
                html += `<div class="price-scale-label" style="top: ${topPct}%;">${priceAtLevel.toFixed(2)}</div>`;
            }
            priceLabelsContainer.innerHTML = html;

            if (totalCandles > 0 && candleDataBase[totalCandles - 1]) {
                const lastClose = candleDataBase[totalCandles - 1].close;
                const lastCloseNorm = (lastClose - minPrice) / (maxPrice - minPrice);
                const lastCloseTop = (1 - lastCloseNorm) * 100;
                currentPriceBadge.style.top = `${lastCloseTop}%`;
                currentPriceBadge.innerText = lastClose.toFixed(2);
            }
        }

        // ==========================================
        // RENDER DÖNGÜSÜ (HiDPI RETINA / 4K)
        // ==========================================
        let lastT = performance.now();
        let frameCount = 0;

        function render(now) {
            frameCount++;
            if (now - lastT >= 500) {
                const fps = Math.round((frameCount * 1000) / (now - lastT));
                const visibleCount = Math.round(viewEnd - viewStart);
                document.getElementById('fps-stat').innerText = fps;
                document.getElementById('visible-candles-stat').innerText = visibleCount;
                frameCount = 0;
                lastT = now;
            }

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            const cssW = canvasContainer.clientWidth;
            const cssH = canvasContainer.clientHeight;
            const w = Math.max(10, Math.floor(cssW * dpr));
            const h = Math.max(10, Math.floor(cssH * dpr));

            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                overlayCanvas.width = w;
                overlayCanvas.height = h;
                ctx2d.resetTransform();
                ctx2d.scale(dpr, dpr);
                ctx2d.imageSmoothingEnabled = true;
                ctx2d.imageSmoothingQuality = 'high';
                gl.viewport(0, 0, w, h);
            }

            if (totalCandles > 0) {
                let minP = Infinity;
                let maxP = -Infinity;
                const startI = Math.max(0, Math.floor(viewStart));
                const endI = Math.min(totalCandles, Math.ceil(viewEnd));

                for (let i = startI; i < endI; i++) {
                    if (candleDataBase[i]) {
                        if (candleDataBase[i].low < minP) minP = candleDataBase[i].low;
                        if (candleDataBase[i].high > maxP) maxP = candleDataBase[i].high;
                    }
                }

                if (!isFinite(minP) || !isFinite(maxP) || minP >= maxP) {
                    minP = 60000;
                    maxP = 70000;
                }

                const baseMid = (minP + maxP) / 2;
                const baseHalfSpan = (maxP - minP) / 2;
                const scaledHalfSpan = (baseHalfSpan / priceScaleFactor) * 1.05;

                minPrice = baseMid - scaledHalfSpan;
                maxPrice = baseMid + scaledHalfSpan;

                updatePriceScaleLabels();
                updateTimeScaleLabels();

                gl.useProgram(prog);
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform2f(uViewRange, viewStart, viewEnd);
                gl.uniform2f(uPriceRange, minPrice, maxPrice);
                gl.uniform2f(uMouse, mousePixelX, mousePixelY);
                gl.uniform1f(uTime, now * 0.001);

                gl.uniform1i(uShowCloud, layers.cloud);
                gl.uniform1i(uShowEma, layers.ema);
                gl.uniform1i(uShowBg, layers.bg);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, candleTex);
                gl.uniform1i(uCandleTex, 0);

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, indTex);
                gl.uniform1i(uIndTex, 1);

                gl.uniform1f(uTotalCandles, totalCandles);

                gl.drawArrays(gl.TRIANGLES, 0, 6);

                drawVectorSignalsAndTargets(now);
            }

            requestAnimationFrame(render);
        }

        document.getElementById('btn-backtest').classList.add('active');

        fetchAllMultiTimeframeKlines('BTCUSDT');
        requestAnimationFrame(render);
    