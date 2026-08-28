import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Close ctx2d.restore() at the end of drawVectorSignalsAndTargets
const oldEndOfSignals = `                    ctx2d.restore();
            }
        }
        }`;

const newEndOfSignals = `                    ctx2d.restore();
                }
            }
            ctx2d.restore(); // 🛡️ Close ctx2d.save() from line 2653
        }`;

content = content.replace(oldEndOfSignals, newEndOfSignals);

// 2. Close ctx.restore() at the end of TradingViewDrawingEngine.render
const oldEndOfDrawingRender = `                    ctx.restore();
                }
            }
        }`;

const newEndOfDrawingRender = `                    ctx.restore();
                }
                ctx.restore(); // 🛡️ Close ctx.save() from line 4146 (clipping path)
            }
        }`;

content = content.replace(oldEndOfDrawingRender, newEndOfDrawingRender);

// 3. Add WebSocket tick throttling and Float32Array buffer pooling
let oldUpdateGpuTextures = `        function updateGpuTextures() {
            totalCandles = candleDataBase.length;
            if (totalCandles === 0) return;

            const ind = calculateTradeChart_MultiStrategy(candleDataBase, candleDataEma, candleDataRegime, activeStrategy, currentTimeframe);
            calculatedSignals = ind.signals;
            calculatedInd = ind;
            const tfCfg = ind.tfCfg || TIMEFRAME_CONFIGS['1h'];

            if (isGpuActive && gl) {
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
            }`;

let newUpdateGpuTextures = `        let cachedCandleBuffer = null;
        let cachedIndBuffer = null;
        let pendingGpuUpdate = false;

        function scheduleGpuTextureUpdate() {
            if (pendingGpuUpdate) return;
            pendingGpuUpdate = true;
            requestAnimationFrame(() => {
                pendingGpuUpdate = false;
                updateGpuTextures();
            });
        }

        function updateGpuTextures() {
            totalCandles = candleDataBase.length;
            if (totalCandles === 0) return;

            const ind = calculateTradeChart_MultiStrategy(candleDataBase, candleDataEma, candleDataRegime, activeStrategy, currentTimeframe);
            calculatedSignals = ind.signals;
            calculatedInd = ind;
            const tfCfg = ind.tfCfg || TIMEFRAME_CONFIGS['1h'];

            if (isGpuActive && gl) {
                const requiredLen = totalCandles * 4;
                if (!cachedCandleBuffer || cachedCandleBuffer.length < requiredLen) {
                    cachedCandleBuffer = new Float32Array(requiredLen);
                    cachedIndBuffer = new Float32Array(requiredLen);
                }

                for (let i = 0; i < totalCandles; i++) {
                    const idx = i * 4;
                    cachedCandleBuffer[idx + 0] = candleDataBase[i].open;
                    cachedCandleBuffer[idx + 1] = candleDataBase[i].high;
                    cachedCandleBuffer[idx + 2] = candleDataBase[i].low;
                    cachedCandleBuffer[idx + 3] = candleDataBase[i].close;

                    cachedIndBuffer[idx + 0] = ind.regime1D[i];
                    cachedIndBuffer[idx + 1] = ind.sa[i];
                    cachedIndBuffer[idx + 2] = ind.sb[i];
                    cachedIndBuffer[idx + 3] = ind.ema4H[i];
                }

                if (!candleTex) candleTex = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, candleTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, totalCandles, 1, 0, gl.RGBA, gl.FLOAT, cachedCandleBuffer);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                if (!indTex) indTex = gl.createTexture();
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, indTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, totalCandles, 1, 0, gl.RGBA, gl.FLOAT, cachedIndBuffer);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }`;

content = content.replace(oldUpdateGpuTextures, newUpdateGpuTextures);

// 4. In ws.onmessage use scheduleGpuTextureUpdate
content = content.replace(
    /updateGpuTextures\(\);\s*document\.getElementById\('price-val'\)/g,
    `scheduleGpuTextureUpdate();\n                document.getElementById('price-val')`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed all canvas save/restore balance, added Float32Array pooling, and throttled WebSocket GPU updates!');
