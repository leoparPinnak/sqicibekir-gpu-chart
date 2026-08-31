import fs from 'fs';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Ensure `uniform float u_candle_growth;` in Fragment Shader (#fs)
    if (!content.includes('uniform float u_candle_growth;')) {
        content = content.replace('uniform int u_is_light_theme;', 'uniform int u_is_light_theme;\n        uniform float u_candle_growth;');
    }

    // 2. Ensure candle mix formula inside #fs
    const candleShaderOld = `vec4 candleData = texture(u_candle_tex, vec2(texCoordX, 0.5));

                float openPrice = candleData.r;
                float highPrice = candleData.g;
                float lowPrice = candleData.b;
                float closePrice = candleData.a;`;

    const candleShaderNew = `vec4 candleData = texture(u_candle_tex, vec2(texCoordX, 0.5));

                float rawOpen = candleData.r;
                float rawHigh = candleData.g;
                float rawLow = candleData.b;
                float rawClose = candleData.a;

                float growthVal = clamp(u_candle_growth, 0.0, 1.0);
                float centerPrice = (rawOpen + rawClose) * 0.5;
                float openPrice = mix(centerPrice, rawOpen, growthVal);
                float highPrice = mix(centerPrice, rawHigh, growthVal);
                float lowPrice = mix(centerPrice, rawLow, growthVal);
                float closePrice = mix(centerPrice, rawClose, growthVal);`;

    if (content.includes(candleShaderOld)) {
        content = content.replace(candleShaderOld, candleShaderNew);
    }

    // 3. Define bloom state and window.triggerCandleBloomAnimation in top global scope (near line 4250)
    const globalBloomCode = `
        // ============================================================
        // 🌸 ORGANİK SİNEMATİK MUM BÜYÜME (BLOOM INCEPTION) MOTORU
        // ============================================================
        window.candleGrowthProgress = 0.0;
        window.isCandleBloomAnimating = false;
        window.candleBloomStartTime = 0;
        window.candleBloomDuration = 1200;
        let uCandleGrowth = null;

        window.triggerCandleBloomAnimation = function(duration = 1200) {
            window.candleGrowthProgress = 0.0;
            window.isCandleBloomAnimating = true;
            window.candleBloomStartTime = performance.now();
            window.candleBloomDuration = duration;
            console.log('🌸 [Candle Bloom] Organik mum büyüme animasyonu başlatıldı (Süre: ' + duration + 'ms)');
        };
    `;

    if (!content.includes('window.triggerCandleBloomAnimation = function')) {
        content = content.replace('let uRes, uViewRange, uPriceRange', globalBloomCode + '\n        let uRes, uViewRange, uPriceRange');
    }

    // 4. Cache uCandleGrowth in initWebGL
    if (content.includes("uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');") && !content.includes("uCandleGrowth = gl.getUniformLocation")) {
        content = content.replace("uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');", "uCandleTex = gl.getUniformLocation(prog, 'u_candle_tex');\n            uCandleGrowth = gl.getUniformLocation(prog, 'u_candle_growth');");
    }

    // 5. Upload uCandleGrowth in render loop
    const renderUploadOld = `gl.uniform1i(uIsLightTheme, currentTheme === 'light' ? 1 : 0);`;
    const renderUploadNew = `gl.uniform1i(uIsLightTheme, currentTheme === 'light' ? 1 : 0);
            if (window.isCandleBloomAnimating) {
                const elapsedBloom = now - window.candleBloomStartTime;
                const pBloom = Math.min(1.0, elapsedBloom / window.candleBloomDuration);
                window.candleGrowthProgress = 1.0 - Math.pow(1.0 - pBloom, 4); // Quartic ease out
                if (pBloom >= 1.0) {
                    window.candleGrowthProgress = 1.0;
                    window.isCandleBloomAnimating = false;
                }
            }
            if (uCandleGrowth) {
                gl.uniform1f(uCandleGrowth, window.candleGrowthProgress !== undefined ? window.candleGrowthProgress : 1.0);
            }`;

    if (content.includes(renderUploadOld) && !content.includes('gl.uniform1f(uCandleGrowth')) {
        content = content.replace(renderUploadOld, renderUploadNew);
    }

    // 6. Clean call in data load
    content = content.replace(/window\.triggerCandleBloomAnimation\(1200\);\s*\/\/[^\n]*/g, 'if (typeof window.triggerCandleBloomAnimation === "function") window.triggerCandleBloomAnimation(1200);');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Upgraded Bloom Inception in ${filePath}`);
}

updateFile('indikator_sablonu.html');
updateFile('index.html');
console.log('BLOOM FIX COMPLETED!');
