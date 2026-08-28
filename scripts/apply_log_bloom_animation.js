import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add u_load_anim uniform to Fragment Shader
content = content.replace(
    /uniform float u_total_candles;\s*out vec4 fragColor;/,
    `uniform float u_total_candles;
        uniform float u_load_anim; // 0.0 -> 1.0 Doğal Logaritmik Açılış Animasyonu
        out vec4 fragColor;`
);

// 2. Scale prices in Fragment Shader based on u_load_anim from center midPrice
const oldFsMainInit = `        float htfRegime = indData.r;
        float sa1H = indData.g;
        float sb1H = indData.b;
        float ema4HLive = indData.a;`;

const newFsMainInit = `        float htfRegime = indData.r;
        float midP = (u_price_range.x + u_price_range.y) * 0.5;
        float animF = clamp(u_load_anim, 0.0, 1.0);

        float sa1H = (indData.g > 0.0) ? (midP + (indData.g - midP) * animF) : 0.0;
        float sb1H = (indData.b > 0.0) ? (midP + (indData.b - midP) * animF) : 0.0;
        float ema4HLive = (indData.a > 0.0) ? (midP + (indData.a - midP) * animF) : 0.0;`;

content = content.replace(oldFsMainInit, newFsMainInit);

const oldFsCandleData = `                float openPrice = candleData.r;
                float highPrice = candleData.g;
                float lowPrice = candleData.b;
                float closePrice = candleData.a;`;

const newFsCandleData = `                float rawOpen = candleData.r;
                float rawHigh = candleData.g;
                float rawLow = candleData.b;
                float rawClose = candleData.a;

                float openPrice = midP + (rawOpen - midP) * animF;
                float highPrice = midP + (rawHigh - midP) * animF;
                float lowPrice = midP + (rawLow - midP) * animF;
                float closePrice = midP + (rawClose - midP) * animF;`;

content = content.replace(oldFsCandleData, newFsCandleData);

// 3. WebGL uniform location for u_load_anim
content = content.replace(
    /uTotalCandles = gl\.getUniformLocation\(prog, 'u_total_candles'\);/,
    `uTotalCandles = gl.getUniformLocation(prog, 'u_total_candles');
                uLoadAnim = gl.getUniformLocation(prog, 'u_load_anim');`
);

content = content.replace(
    /let uCandleTex, uIndTex, uTotalCandles;/,
    `let uCandleTex, uIndTex, uTotalCandles, uLoadAnim;`
);

// 4. Update draw2DTurboFallback with organic logarithmic opening
const oldTurboCandles = `            // 1. Ichimoku Bulutu
            if (layers.cloud && calculatedInd && calculatedInd.sa && calculatedInd.sb) {
                for (let i = startI; i < endI - 1; i++) {
                    const nextI = i + 1;
                    const x1 = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                    const x2 = Math.round(((nextI + 0.5 - curStart) / visibleCount) * w);

                    const sa1 = getY(calculatedInd.sa[i]);
                    const sb1 = getY(calculatedInd.sb[i]);
                    const sa2 = getY(calculatedInd.sa[nextI]);
                    const sb2 = getY(calculatedInd.sb[nextI]);

                    ctx.beginPath();
                    ctx.moveTo(x1, sa1);
                    ctx.lineTo(x2, sa2);
                    ctx.lineTo(x2, sb2);
                    ctx.lineTo(x1, sb1);
                    ctx.closePath();

                    if (calculatedInd.sa[i] >= calculatedInd.sb[i]) {
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
                    } else {
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
                    }
                    ctx.fill();
                }
            }

            // 2. EMA Çizgisi
            if (layers.ema && calculatedInd && calculatedInd.ema4H) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                let started = false;
                for (let i = startI; i < endI; i++) {
                    const x = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                    const y = getY(calculatedInd.ema4H[i]);
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // 3. Mum Çubukları
            for (let i = startI; i < endI; i++) {
                const c = candleDataBase[i];
                if (!c) continue;

                const x = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);

                const isUp = c.close >= c.open;
                const color = isUp ? '#10b981' : '#ef4444';

                // Fitil
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, Math.min(2, Math.floor(candleW * 0.15)));
                ctx.beginPath();
                ctx.moveTo(x, highY);
                ctx.lineTo(x, lowY);
                ctx.stroke();

                // Gövde
                const topY = Math.min(openY, closeY);
                const bodyH = Math.max(1.5, Math.abs(closeY - openY));
                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(x - bodyW / 2), Math.round(topY), Math.max(1, bodyW), Math.max(1, Math.round(bodyH)));
            }`;

const newTurboCandles = `            const midP = (minP + maxP) / 2;
            const animF = Math.max(0.0, Math.min(1.0, loadAnimProgress));

            // 1. Ichimoku Bulutu (Merkezden Dışarı Açılan)
            if (layers.cloud && calculatedInd && calculatedInd.sa && calculatedInd.sb) {
                for (let i = startI; i < endI - 1; i++) {
                    const nextI = i + 1;
                    const x1 = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                    const x2 = Math.round(((nextI + 0.5 - curStart) / visibleCount) * w);

                    const sa1 = getY(midP + (calculatedInd.sa[i] - midP) * animF);
                    const sb1 = getY(midP + (calculatedInd.sb[i] - midP) * animF);
                    const sa2 = getY(midP + (calculatedInd.sa[nextI] - midP) * animF);
                    const sb2 = getY(midP + (calculatedInd.sb[nextI] - midP) * animF);

                    ctx.beginPath();
                    ctx.moveTo(x1, sa1);
                    ctx.lineTo(x2, sa2);
                    ctx.lineTo(x2, sb2);
                    ctx.lineTo(x1, sb1);
                    ctx.closePath();

                    if (calculatedInd.sa[i] >= calculatedInd.sb[i]) {
                        ctx.fillStyle = \`rgba(16, 185, 129, \${0.12 * animF})\`;
                    } else {
                        ctx.fillStyle = \`rgba(239, 68, 68, \${0.12 * animF})\`;
                    }
                    ctx.fill();
                }
            }

            // 2. EMA Çizgisi
            if (layers.ema && calculatedInd && calculatedInd.ema4H) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                let started = false;
                for (let i = startI; i < endI; i++) {
                    const x = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                    const y = getY(midP + (calculatedInd.ema4H[i] - midP) * animF);
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // 3. Mum Çubukları (Merkez Çizgiden Doğal Logaritmik Olarak Büyüyen)
            for (let i = startI; i < endI; i++) {
                const c = candleDataBase[i];
                if (!c) continue;

                const x = Math.round(((i + 0.5 - curStart) / visibleCount) * w);
                const openY = getY(midP + (c.open - midP) * animF);
                const closeY = getY(midP + (c.close - midP) * animF);
                const highY = getY(midP + (c.high - midP) * animF);
                const lowY = getY(midP + (c.low - midP) * animF);

                const isUp = c.close >= c.open;
                const color = isUp ? '#10b981' : '#ef4444';

                // Fitil
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(1, Math.min(2, Math.floor(candleW * 0.15)));
                ctx.beginPath();
                ctx.moveTo(x, highY);
                ctx.lineTo(x, lowY);
                ctx.stroke();

                // Gövde
                const topY = Math.min(openY, closeY);
                const bodyH = Math.max(1.0, Math.abs(closeY - openY));
                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(x - bodyW / 2), Math.round(topY), Math.max(1, bodyW), Math.max(1, Math.round(bodyH)));
            }`;

content = content.replace(oldTurboCandles, newTurboCandles);

// 5. Add loading state variables & logarithmic bloom animation loop
const oldFetchAllKlines = `        async function fetchAllMultiTimeframeKlines(symbol) {
            const tfCfg = TIMEFRAME_CONFIGS[currentTimeframe] || TIMEFRAME_CONFIGS['1h'];
            loadingOverlay.style.display = 'block';
            loadingOverlay.innerText = \`⏳ Binance MTF (\${tfCfg.label}) Verileri Çekiliyor...\`;

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
                viewStart = Math.max(0, totalCandles - 130);
                viewEnd = totalCandles + 25; // Sağa doğru 25 mumluk modern TradingView boşluk payı

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
        }`;

const newFetchAllKlines = `        let isDataLoading = true;
        let loadAnimStartTime = 0;
        let loadAnimProgress = 0.0;
        const LOAD_ANIM_DURATION = 850; // ms pürüzsüz logaritmik açılış

        async function fetchAllMultiTimeframeKlines(symbol) {
            const tfCfg = TIMEFRAME_CONFIGS[currentTimeframe] || TIMEFRAME_CONFIGS['1h'];
            isDataLoading = true;
            loadAnimProgress = 0.0;
            loadingOverlay.style.display = 'block';
            loadingOverlay.innerText = \`⏳ Binance MTF (\${tfCfg.label}) Verileri Çekiliyor...\`;

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
                viewStart = Math.max(0, totalCandles - 130);
                viewEnd = totalCandles + 25;

                updateGpuTextures();
                connectWebSocket(symbol);

                if (totalCandles > 0) {
                    const last = candleDataBase[totalCandles - 1];
                    document.getElementById('price-val').innerText = last.close.toLocaleString('en-US', {minimumFractionDigits: 2});
                }

                // 🌟 DOĞAL LOGARİTMİK AÇILIŞ ANİMASYONU BAŞLAT
                isDataLoading = false;
                loadAnimStartTime = performance.now();
                loadAnimProgress = 0.0;
            } catch (err) {
                console.error('MTF Veri Çekme Hatası:', err);
            } finally {
                loadingOverlay.style.display = 'none';
            }
        }`;

content = content.replace(oldFetchAllKlines, newFetchAllKlines);

// 6. In render(now), calculate loadAnimProgress via natural logarithmic/exponential ease-out and pass to uniforms
const oldRenderLoopUniforms = `                if (isGpuActive && gl && prog) {
                    gl.useProgram(prog);
                    gl.uniform2f(uRes, canvas.width, canvas.height);
                    gl.uniform2f(uViewRange, smoothViewStart, smoothViewEnd);
                    gl.uniform2f(uPriceRange, smoothMinPrice, smoothMaxPrice);
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
                }`;

const newRenderLoopUniforms = `                // 🌟 DOĞAL LOGARİTMİK VE EXPONENTIAL SMOOTH AÇILIŞ HESAPLAMASI
                if (!isDataLoading && loadAnimStartTime > 0) {
                    const elapsed = now - loadAnimStartTime;
                    const rawT = Math.min(1.0, elapsed / LOAD_ANIM_DURATION);
                    // Doğal Logaritmik / Exponential Ease-Out Eğrisi: 1 - 2^(-10 * t)
                    loadAnimProgress = (rawT >= 1.0) ? 1.0 : (1.0 - Math.pow(2, -10 * rawT));
                } else if (isDataLoading) {
                    loadAnimProgress = 0.0;
                }

                if (isGpuActive && gl && prog) {
                    gl.useProgram(prog);
                    gl.uniform2f(uRes, canvas.width, canvas.height);
                    gl.uniform2f(uViewRange, smoothViewStart, smoothViewEnd);
                    gl.uniform2f(uPriceRange, smoothMinPrice, smoothMaxPrice);
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
                    if (uLoadAnim) gl.uniform1f(uLoadAnim, loadAnimProgress);

                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }`;

content = content.replace(oldRenderLoopUniforms, newRenderLoopUniforms);

// 7. In drawVectorSignalsAndTargets, fade in smoothly during bloom animation
content = content.replace(
    /if \(!layers\.signals\) return;/,
    `if (!layers.signals || loadAnimProgress < 0.05) return;
            ctx2d.save();
            ctx2d.globalAlpha = Math.pow(loadAnimProgress, 2.2);`
);

content = content.replace(
    /drawVectorSignalsAndTargets\(now\);/,
    `drawVectorSignalsAndTargets(now);\n                ctx2d.restore();`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Organic logarithmic candle bloom animation applied successfully!');
