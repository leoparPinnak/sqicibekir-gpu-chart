import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Declare global animation state variables
const oldInitData = `        let candleDataBase = [];
        let candleDataEma = [];
        let candleDataRegime = [];`;

const newInitData = `        let candleDataBase = [];
        let candleDataEma = [];
        let candleDataRegime = [];

        let isDataLoading = false;
        let loadAnimStartTime = 0;
        let loadAnimProgress = 1.0;
        const LOAD_ANIM_DURATION = 800;`;

content = content.replace(oldInitData, newInitData);

// 2. Remove the placeholder dummy array that caused null textures and locked prices
content = content.replace(
    /\s*\/\/ Başlangıçta ekranın ortasında 0 boyutta düz çizgi gibi duran başlangıç mumları[\s\S]*?viewEnd = 150;\s*\}\)\(\);/g,
    ''
);

// 3. Update fetchAllMultiTimeframeKlines to trigger bloom
content = content.replace(
    /totalCandles = candleDataBase\.length;\s*viewStart = Math\.max\(0, totalCandles - 130\);\s*viewEnd = totalCandles \+ 25;\s*updateGpuTextures\(\);\s*connectWebSocket\(symbol\);/,
    `totalCandles = candleDataBase.length;
                viewStart = Math.max(0, totalCandles - 130);
                viewEnd = totalCandles + 25;
                updateGpuTextures();
                connectWebSocket(symbol);

                isDataLoading = false;
                loadAnimStartTime = performance.now();
                loadAnimProgress = 0.0;`
);

// 4. Update WebGL uniforms in render()
const oldGpuBlock = `                if (isGpuActive && gl && prog) {
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

const newGpuBlock = `                // 🌟 DOĞAL LOGARİTMİK VE EXPONENTIAL SMOOTH AÇILIŞ HESAPLAMASI
                if (!isDataLoading && loadAnimStartTime > 0) {
                    const elapsed = now - loadAnimStartTime;
                    const rawT = Math.min(1.0, elapsed / LOAD_ANIM_DURATION);
                    // Doğal Logaritmik / Exponential Ease-Out Eğrisi: 1 - 2^(-10 * t)
                    loadAnimProgress = (rawT >= 1.0) ? 1.0 : (1.0 - Math.pow(2, -10 * rawT));
                } else if (!isDataLoading) {
                    loadAnimProgress = 1.0;
                } else {
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

content = content.replace(oldGpuBlock, newGpuBlock);

// 5. Clean up drawVectorSignalsAndTargets save/restore
content = content.replace(
    /if \(!layers\.signals \|\| loadAnimProgress < 0\.05\) return;\s*ctx2d\.save\(\);\s*ctx2d\.globalAlpha = Math\.pow\(loadAnimProgress, 2\.2\);/,
    `if (!layers.signals) return;
            ctx2d.save();
            ctx2d.globalAlpha = Math.max(0.0, Math.min(1.0, Math.pow(loadAnimProgress, 2.0)));`
);

content = content.replace(
    /drawVectorSignalsAndTargets\(now\);\s*ctx2d\.restore\(\);/,
    `drawVectorSignalsAndTargets(now);`
);

// Close save/restore inside drawVectorSignalsAndTargets at its end:
content = content.replace(
    /ctx2d\.restore\(\);\s*\}\s*\}\s*\}\s*\/\/\s*============================================================\s*\/\/\s*BINANCE MTF/,
    `ctx2d.restore();\n            }\n        }\n        }\n\n        // ============================================================\n        //  BINANCE MTF`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed WebGL uniform passing, clean save/restore and instant bloom animation!');
