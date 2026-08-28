import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Remove all clamping from WebGL Fragment Shader
const oldShaderSection = `        float topBound = 0.985;
        float bottomBound = 0.015;

        // Koyu Uzay Arka Planı
        vec3 col = vec3(0.042, 0.062, 0.105);

        float visibleCount = max(1.0, u_view_range.y - u_view_range.x);
        float currentCandleIdx = u_view_range.x + uv.x * visibleCount;
        float candleCenterIdx = floor(currentCandleIdx) + 0.5;
        float texCoordX = clamp(candleCenterIdx / max(1.0, u_total_candles), 0.0, 1.0);

        vec4 indData = texture(u_ind_tex, vec2(texCoordX, 0.5));
        float htfRegime = indData.r;
        float sa1H = indData.g;
        float sb1H = indData.b;
        float ema4HLive = indData.a;

        if (u_show_bg == 1 && u_total_candles > 0.0) {
            if (htfRegime > 0.5) {
                col = mix(col, vec3(0.06, 0.85, 0.35), 0.07);
            } else if (htfRegime < -0.5) {
                col = mix(col, vec3(0.95, 0.15, 0.25), 0.07);
            }
        }

        float gridY = fract(uv.y * 8.0);
        float hLine = smoothstep(0.025, 0.0, abs(gridY - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * hLine * 0.4;

        float gridX = fract(uv.x * 10.0);
        float vLine = smoothstep(0.025, 0.0, abs(gridX - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * vLine * 0.25;

        if (uv.y >= bottomBound && uv.y <= topBound) {
            if (u_show_cloud == 1 && sa1H > 0.0 && sb1H > 0.0) {
                float saY = clamp(priceToY(sa1H), bottomBound, topBound);
                float sbY = clamp(priceToY(sb1H), bottomBound, topBound);

                float cloudTop = max(saY, sbY);
                float cloudBot = min(saY, sbY);

                if (uv.y >= cloudBot && uv.y <= cloudTop) {
                    float relY = (uv.y - cloudBot) / max(0.001, cloudTop - cloudBot);
                    bool isBullCloud = sa1H >= sb1H;

                    float diag1 = sin(pixelCoord.x * 0.06 + pixelCoord.y * 0.06 - u_time * 3.5);
                    float diag2 = cos(pixelCoord.x * 0.04 - pixelCoord.y * 0.04 + u_time * 2.2);
                    float plasmaWave = sin(uv.x * 45.0 + sin(uv.y * 30.0 + u_time * 2.5) * 3.0 + u_time * 2.0);

                    float pattern = smoothstep(-0.2, 0.8, diag1 * 0.5 + diag2 * 0.3 + plasmaWave * 0.2);
                    float pulse = 0.5 + 0.5 * sin(u_time * 2.2 + uv.x * 15.0);
                    float edgeAura = pow(1.0 - abs(relY - 0.5) * 2.0, 0.65);

                    if (isBullCloud) {
                        vec3 deepGreen = vec3(0.02, 0.45, 0.25);
                        vec3 neonGreen = vec3(0.0, 1.0, 0.55);
                        vec3 electricCyan = vec3(0.1, 0.9, 0.95);

                        vec3 plasmaCol = mix(deepGreen, neonGreen, pattern);
                        plasmaCol = mix(plasmaCol, electricCyan, diag1 * 0.35 + 0.35);

                        float fillAlpha = 0.18 + pattern * 0.14 + pulse * 0.06 + (1.0 - edgeAura) * 0.08;
                        col = mix(col, plasmaCol, fillAlpha);
                        col += neonGreen * (0.05 * pattern);
                    } else {
                        vec3 deepRuby = vec3(0.5, 0.05, 0.15);
                        vec3 neonRed = vec3(1.0, 0.15, 0.3);
                        vec3 lavaOrange = vec3(1.0, 0.45, 0.1);

                        vec3 plasmaCol = mix(deepRuby, neonRed, pattern);
                        plasmaCol = mix(plasmaCol, lavaOrange, diag2 * 0.35 + 0.35);

                        float fillAlpha = 0.18 + pattern * 0.14 + pulse * 0.06 + (1.0 - edgeAura) * 0.08;
                        col = mix(col, plasmaCol, fillAlpha);
                        col += neonRed * (0.05 * pattern);
                    }
                }

                float dSa = abs(uv.y - saY) * u_resolution.y;
                float dSb = abs(uv.y - sbY) * u_resolution.y;
                float laserA = smoothstep(1.8, 0.0, dSa) * 0.8 + (0.06 / (dSa + 0.5)) * 0.4;
                float laserB = smoothstep(1.8, 0.0, dSb) * 0.8 + (0.06 / (dSb + 0.5)) * 0.4;

                col += vec3(0.1, 1.0, 0.55) * laserA;
                col += vec3(1.0, 0.2, 0.35) * laserB;
            }

            if (candleCenterIdx >= 0.0 && candleCenterIdx <= u_total_candles) {
                float candleScreenU = (candleCenterIdx - u_view_range.x) / visibleCount;
                float candleDistX = abs(uv.x - candleScreenU) * u_resolution.x;

                float candleSlotPx = u_resolution.x / visibleCount;
                float candleWidth = max(0.55, candleSlotPx * 0.72);
                float wickThreshold = max(0.4, min(1.2, candleSlotPx * 0.35));

                vec4 candleData = texture(u_candle_tex, vec2(texCoordX, 0.5));

                float openPrice = candleData.r;
                float highPrice = candleData.g;
                float lowPrice = candleData.b;
                float closePrice = candleData.a;

                bool isBull = closePrice >= openPrice;
                vec3 bullColor = vec3(0.06, 0.85, 0.55);
                vec3 bearColor = vec3(0.96, 0.24, 0.38);
                vec3 candleCol = isBull ? bullColor : bearColor;

                float highY = clamp(priceToY(highPrice), bottomBound, topBound);
                float lowY = clamp(priceToY(lowPrice), bottomBound, topBound);
                if (uv.y >= lowY && uv.y <= highY && candleDistX <= wickThreshold) {
                    col = mix(col, candleCol, 0.9);
                    col += candleCol * 0.2;
                }

                float bodyTop = clamp(priceToY(max(openPrice, closePrice)), bottomBound, topBound);
                float bodyBottom = clamp(priceToY(min(openPrice, closePrice)), bottomBound, topBound);
                bodyTop = max(bodyTop, bodyBottom + 0.0015);

                if (uv.y >= bodyBottom && uv.y <= bodyTop && candleDistX < candleWidth * 0.5) {
                    col = mix(col, candleCol, 0.95);
                    if (candleSlotPx > 6.0) {
                        float edge = smoothstep(candleWidth * 0.5, candleWidth * 0.4, candleDistX);
                        col += vec3(1.0) * (1.0 - edge) * 0.15;
                    }
                }

                if (u_show_ema == 1 && ema4HLive > 0.0) {
                    float emaY = clamp(priceToY(ema4HLive), bottomBound, topBound);
                    float distEma = abs(uv.y - emaY) * u_resolution.y;
                    float lineEma = smoothstep(2.0, 0.0, distEma);
                    col += vec3(1.0, 0.55, 0.0) * (lineEma + (0.06 / (distEma + 0.5)) * 0.6);
                }
            }
        }`;

const newShaderSection = `        // Koyu Uzay Arka Planı
        vec3 col = vec3(0.042, 0.062, 0.105);

        float visibleCount = max(1.0, u_view_range.y - u_view_range.x);
        float currentCandleIdx = u_view_range.x + uv.x * visibleCount;
        float candleCenterIdx = floor(currentCandleIdx) + 0.5;
        float texCoordX = clamp(candleCenterIdx / max(1.0, u_total_candles), 0.0, 1.0);

        vec4 indData = texture(u_ind_tex, vec2(texCoordX, 0.5));
        float htfRegime = indData.r;
        float sa1H = indData.g;
        float sb1H = indData.b;
        float ema4HLive = indData.a;

        if (u_show_bg == 1 && u_total_candles > 0.0) {
            if (htfRegime > 0.5) {
                col = mix(col, vec3(0.06, 0.85, 0.35), 0.07);
            } else if (htfRegime < -0.5) {
                col = mix(col, vec3(0.95, 0.15, 0.25), 0.07);
            }
        }

        float gridY = fract(uv.y * 8.0);
        float hLine = smoothstep(0.025, 0.0, abs(gridY - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * hLine * 0.4;

        float gridX = fract(uv.x * 10.0);
        float vLine = smoothstep(0.025, 0.0, abs(gridX - 0.5) * 2.0);
        col += vec3(0.12, 0.18, 0.28) * vLine * 0.25;

        // 🌟 100% SINIRSIZ DOĞAL GPU RENDERING (Tavan / Taban Kelepçesi Kaldırıldı)
        if (u_show_cloud == 1 && sa1H > 0.0 && sb1H > 0.0) {
            float saY = priceToY(sa1H);
            float sbY = priceToY(sb1H);

            float cloudTop = max(saY, sbY);
            float cloudBot = min(saY, sbY);

            if (uv.y >= cloudBot && uv.y <= cloudTop) {
                float relY = (uv.y - cloudBot) / max(0.001, cloudTop - cloudBot);
                bool isBullCloud = sa1H >= sb1H;

                float diag1 = sin(pixelCoord.x * 0.06 + pixelCoord.y * 0.06 - u_time * 3.5);
                float diag2 = cos(pixelCoord.x * 0.04 - pixelCoord.y * 0.04 + u_time * 2.2);
                float plasmaWave = sin(uv.x * 45.0 + sin(uv.y * 30.0 + u_time * 2.5) * 3.0 + u_time * 2.0);

                float pattern = smoothstep(-0.2, 0.8, diag1 * 0.5 + diag2 * 0.3 + plasmaWave * 0.2);
                float pulse = 0.5 + 0.5 * sin(u_time * 2.2 + uv.x * 15.0);
                float edgeAura = pow(1.0 - abs(relY - 0.5) * 2.0, 0.65);

                if (isBullCloud) {
                    vec3 deepGreen = vec3(0.02, 0.45, 0.25);
                    vec3 neonGreen = vec3(0.0, 1.0, 0.55);
                    vec3 electricCyan = vec3(0.1, 0.9, 0.95);

                    vec3 plasmaCol = mix(deepGreen, neonGreen, pattern);
                    plasmaCol = mix(plasmaCol, electricCyan, diag1 * 0.35 + 0.35);

                    float fillAlpha = 0.18 + pattern * 0.14 + pulse * 0.06 + (1.0 - edgeAura) * 0.08;
                    col = mix(col, plasmaCol, fillAlpha);
                    col += neonGreen * (0.05 * pattern);
                } else {
                    vec3 deepRuby = vec3(0.5, 0.05, 0.15);
                    vec3 neonRed = vec3(1.0, 0.15, 0.3);
                    vec3 lavaOrange = vec3(1.0, 0.45, 0.1);

                    vec3 plasmaCol = mix(deepRuby, neonRed, pattern);
                    plasmaCol = mix(plasmaCol, lavaOrange, diag2 * 0.35 + 0.35);

                    float fillAlpha = 0.18 + pattern * 0.14 + pulse * 0.06 + (1.0 - edgeAura) * 0.08;
                    col = mix(col, plasmaCol, fillAlpha);
                    col += neonRed * (0.05 * pattern);
                }
            }

            float dSa = abs(uv.y - saY) * u_resolution.y;
            float dSb = abs(uv.y - sbY) * u_resolution.y;
            float laserA = smoothstep(1.8, 0.0, dSa) * 0.8 + (0.06 / (dSa + 0.5)) * 0.4;
            float laserB = smoothstep(1.8, 0.0, dSb) * 0.8 + (0.06 / (dSb + 0.5)) * 0.4;

            col += vec3(0.1, 1.0, 0.55) * laserA;
            col += vec3(1.0, 0.2, 0.35) * laserB;
        }

        if (candleCenterIdx >= 0.0 && candleCenterIdx <= u_total_candles) {
            float candleScreenU = (candleCenterIdx - u_view_range.x) / visibleCount;
            float candleDistX = abs(uv.x - candleScreenU) * u_resolution.x;

            float candleSlotPx = u_resolution.x / visibleCount;
            float candleWidth = max(0.55, candleSlotPx * 0.72);
            float wickThreshold = max(0.4, min(1.2, candleSlotPx * 0.35));

            vec4 candleData = texture(u_candle_tex, vec2(texCoordX, 0.5));

            float openPrice = candleData.r;
            float highPrice = candleData.g;
            float lowPrice = candleData.b;
            float closePrice = candleData.a;

            bool isBull = closePrice >= openPrice;
            vec3 bullColor = vec3(0.06, 0.85, 0.55);
            vec3 bearColor = vec3(0.96, 0.24, 0.38);
            vec3 candleCol = isBull ? bullColor : bearColor;

            float highY = priceToY(highPrice);
            float lowY = priceToY(lowPrice);
            if (uv.y >= lowY && uv.y <= highY && candleDistX <= wickThreshold) {
                col = mix(col, candleCol, 0.9);
                col += candleCol * 0.2;
            }

            float bodyTop = priceToY(max(openPrice, closePrice));
            float bodyBottom = priceToY(min(openPrice, closePrice));
            bodyTop = max(bodyTop, bodyBottom + 0.0015);

            if (uv.y >= bodyBottom && uv.y <= bodyTop && candleDistX < candleWidth * 0.5) {
                col = mix(col, candleCol, 0.95);
                if (candleSlotPx > 6.0) {
                    float edge = smoothstep(candleWidth * 0.5, candleWidth * 0.4, candleDistX);
                    col += vec3(1.0) * (1.0 - edge) * 0.15;
                }
            }

            if (u_show_ema == 1 && ema4HLive > 0.0) {
                float emaY = priceToY(ema4HLive);
                float distEma = abs(uv.y - emaY) * u_resolution.y;
                float lineEma = smoothstep(2.0, 0.0, distEma);
                col += vec3(1.0, 0.55, 0.0) * (lineEma + (0.06 / (distEma + 0.5)) * 0.6);
            }
        }`;

content = content.replace(oldShaderSection, newShaderSection);

// 2. Remove priceOffset reduction on mouse wheel zoom
content = content.replace(
    /const ratio = newCount \/ count;\s*priceOffset \*= Math\.min\(1\.0, ratio\);/,
    `// Keep priceOffset intact during wheel zooming`
);

// 3. Expand priceScaleFactor range for extreme vertical zooming
content = content.replace(
    /priceScaleFactor = Math\.max\(0\.05, Math\.min\(25\.0, priceScaleFactor \* Math\.exp\(deltaY \* 0\.006\)\)\);/,
    `priceScaleFactor = Math.max(0.001, Math.min(1000.0, priceScaleFactor * Math.exp(deltaY * 0.006)));`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Completely removed all shader clamp boundaries, wheel attenuation and price scale limits!');
