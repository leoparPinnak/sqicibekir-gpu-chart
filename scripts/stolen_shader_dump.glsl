#version 300 es
    in vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }

/* --- NEXT SHADER --- */

#version 300 es
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_view_range;
    uniform vec2 u_price_range;
    uniform vec2 u_mouse;
    uniform float u_time;

    uniform int u_show_cloud;
    uniform int u_show_ema;
    uniform int u_show_bg;

    uniform sampler2D u_candle_tex;
    uniform sampler2D u_ind_tex;
    uniform float u_total_candles;
        uniform float u_load_anim; // 0.0 -> 1.0 Doğal Logaritmik Açılış Animasyonu
        out vec4 fragColor;

    float priceToY(float price) {
        float diff = u_price_range.y - u_price_range.x;
        if (diff <= 0.0001) diff = 1.0;
        return (price - u_price_range.x) / diff;
    }

    void main() {
        vec2 pixelCoord = gl_FragCoord.xy;
        vec2 uv = pixelCoord / u_resolution;

        float topBound = 0.985;
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
        }

        if (u_mouse.x >= 0.0 && u_mouse.x <= u_resolution.x &&
            u_mouse.y >= 0.0 && u_mouse.y <= u_resolution.y) {
            float crossX = smoothstep(1.2, 0.0, abs(pixelCoord.x - u_mouse.x));
            float crossY = smoothstep(1.2, 0.0, abs(pixelCoord.y - u_mouse.y));
            col += vec3(0.4, 0.6, 0.8) * (crossX + crossY) * 0.35;
        }

        fragColor = vec4(col, 1.0);
    }