#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_view_range;
uniform vec2 u_price_range;
uniform vec2 u_mouse;
uniform float u_time;

// Katman Bayrakları
uniform int u_show_bg;
uniform int u_show_cloud;
uniform int u_show_ema;
uniform int u_show_signals;
uniform int u_show_cross;

// Dokular
uniform sampler2D u_candle_tex;     // R=Open, G=High, B=Low, A=Close
uniform sampler2D u_cloud_tex;      // R=SenkouA, G=SenkouB, B=LiveEMA_4H, A=Volume
uniform sampler2D u_signals_tex;    // R=SignalCode, G=SL, B=TP, A=LastRegime1D
uniform sampler2D u_cross_tex;      // R=CrossUp4H, G=CrossDown4H

uniform float u_total_candles;

out vec4 fragColor;

float priceToY(float price) {
    float diff = u_price_range.y - u_price_range.x;
    if (diff <= 0.00001) diff = 1.0;
    return (price - u_price_range.x) / diff;
}

void main() {
    vec2 pixelCoord = gl_FragCoord.xy;
    vec2 uv = pixelCoord / u_resolution;

    float topBound = 0.985;
    float bottomBound = 0.015;

    // Koyu lacivert arka plan
    vec3 col = vec3(0.04, 0.055, 0.095);

    if (u_total_candles < 1.0) {
        fragColor = vec4(col, 1.0);
        return;
    }

    float visibleCount = max(1.0, u_view_range.y - u_view_range.x);
    float currentCandleIdx = u_view_range.x + uv.x * visibleCount;
    float candleCenterIdx = floor(currentCandleIdx) + 0.5;
    float texCoordX = clamp(candleCenterIdx / u_total_candles, 0.0, 1.0);

    vec4 sigData = texture(u_signals_tex, vec2(texCoordX, 0.5));
    float regime1D = sigData.a; // +1: Boğa, -1: Ayı

    // 1. 1D Ichimoku Rejim Arka Planı (Soft Glow)
    if (u_show_bg == 1) {
        if (regime1D > 0.5) {
            col = mix(col, vec3(0.06, 0.75, 0.35), 0.08);
        } else if (regime1D < -0.5) {
            col = mix(col, vec3(0.85, 0.15, 0.25), 0.08);
        }
    }

    // Izgara Çizgileri
    float gridY = fract(uv.y * 8.0);
    float hLine = smoothstep(0.025, 0.0, abs(gridY - 0.5) * 2.0);
    col += vec3(0.12, 0.18, 0.28) * hLine * 0.35;

    float gridX = fract(uv.x * 10.0);
    float vLine = smoothstep(0.025, 0.0, abs(gridX - 0.5) * 2.0);
    col += vec3(0.12, 0.18, 0.28) * vLine * 0.25;

    // 2. Çizim Alanı
    if (uv.y >= bottomBound && uv.y <= topBound) {
        
        if (candleCenterIdx >= 0.0 && candleCenterIdx <= u_total_candles) {
            
            float candleScreenU = (candleCenterIdx - u_view_range.x) / visibleCount;
            float candleDistX = abs(uv.x - candleScreenU) * u_resolution.x;

            float candleSlotPx = u_resolution.x / visibleCount;
            float candleWidth = max(0.55, candleSlotPx * 0.72);
            float wickThreshold = max(0.4, min(1.2, candleSlotPx * 0.35));

            vec4 candleData = texture(u_candle_tex, vec2(texCoordX, 0.5));
            vec4 cloudData = texture(u_cloud_tex, vec2(texCoordX, 0.5));
            vec4 crossData = texture(u_cross_tex, vec2(texCoordX, 0.5));

            float openPrice = candleData.r;
            float highPrice = candleData.g;
            float lowPrice = candleData.b;
            float closePrice = candleData.a;

            float sa1H = cloudData.r;
            float sb1H = cloudData.g;
            float ema4HLive = cloudData.b;
            float volume = cloudData.a;

            float signalType = sigData.r;
            float slPrice = sigData.g;
            float tpPrice = sigData.b;

            float crossUp4H = crossData.r;
            float crossDown4H = crossData.g;

            bool isBull = closePrice >= openPrice;
            vec3 bullColor = vec3(0.06, 0.85, 0.55);
            vec3 bearColor = vec3(0.96, 0.24, 0.38);
            vec3 candleCol = isBull ? bullColor : bearColor;

            // A) 4H EMA Kırılım Dikey Çizgileri
            if (u_show_cross == 1) {
                if (crossUp4H > 0.5 && candleDistX <= 1.0) {
                    col = mix(col, vec3(0.1, 1.0, 0.5), 0.6);
                }
                if (crossDown4H > 0.5 && candleDistX <= 1.0) {
                    col = mix(col, vec3(1.0, 0.2, 0.3), 0.6);
                }
            }

            // B) 1H Ichimoku Bulutu
            if (u_show_cloud == 1 && sa1H > 0.0 && sb1H > 0.0) {
                float saY = clamp(priceToY(sa1H), bottomBound, topBound);
                float sbY = clamp(priceToY(sb1H), bottomBound, topBound);

                float cloudTop = max(saY, sbY);
                float cloudBot = min(saY, sbY);

                if (uv.y >= cloudBot && uv.y <= cloudTop) {
                    vec3 cloudFill = saY >= sbY ? vec3(0.06, 0.85, 0.45) : vec3(0.95, 0.2, 0.35);
                    col = mix(col, cloudFill, 0.12);
                }

                float distSa = abs(uv.y - saY) * u_resolution.y;
                col += vec3(0.1, 0.9, 0.5) * smoothstep(1.5, 0.0, distSa) * 0.7;

                float distSb = abs(uv.y - sbY) * u_resolution.y;
                col += vec3(0.95, 0.25, 0.35) * smoothstep(1.5, 0.0, distSb) * 0.7;
            }

            // C) Hacim Barı
            float volHeight = bottomBound + volume * 0.16;
            if (uv.y <= volHeight && candleDistX < candleWidth * 0.5) {
                col = mix(col, candleCol, 0.2);
            }

            // D) Fitil (Wick)
            float highY = clamp(priceToY(highPrice), bottomBound, topBound);
            float lowY = clamp(priceToY(lowPrice), bottomBound, topBound);
            if (uv.y >= lowY && uv.y <= highY && candleDistX <= wickThreshold) {
                col = mix(col, candleCol, 0.9);
                col += candleCol * 0.2;
            }

            // E) Gövde (Body)
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

            // F) Canlı 4H EMA26 Çizgisi (Neon Turuncu)
            if (u_show_ema == 1 && ema4HLive > 0.0) {
                float emaY = clamp(priceToY(ema4HLive), bottomBound, topBound);
                float distEma = abs(uv.y - emaY) * u_resolution.y;
                float lineEma = smoothstep(2.0, 0.0, distEma);
                col += vec3(1.0, 0.55, 0.0) * (lineEma + (0.06 / (distEma + 0.5)) * 0.5);
            }

            // G) Sinyaller & SL / TP
            if (u_show_signals == 1 && signalType > 0.5) {
                if (slPrice > 0.0) {
                    float slY = clamp(priceToY(slPrice), bottomBound, topBound);
                    float distSl = length(vec2(candleDistX, (uv.y - slY) * u_resolution.y));
                    if (distSl < 5.0) {
                        col = mix(col, vec3(1.0, 0.15, 0.25), 0.9);
                    }
                }

                if (tpPrice > 0.0) {
                    float tpY = clamp(priceToY(tpPrice), bottomBound, topBound);
                    float distTp = length(vec2(candleDistX, (uv.y - tpY) * u_resolution.y));
                    if (distTp < 5.0) {
                        col = mix(col, vec3(0.1, 1.0, 0.45), 0.9);
                    }
                }

                vec3 sigCol = (signalType == 1.0) ? vec3(0.0, 1.0, 0.5) :
                              (signalType == 2.0) ? vec3(1.0, 0.2, 0.3) :
                              (signalType == 3.0) ? vec3(0.0, 0.85, 1.0) :
                                                    vec3(1.0, 0.6, 0.1);

                float sigTargetY = (signalType == 1.0 || signalType == 3.0) ? lowY - 0.025 : highY + 0.025;
                float distSig = length(vec2(candleDistX, (uv.y - sigTargetY) * u_resolution.y));
                if (distSig < 6.5) {
                    col = mix(col, sigCol, 0.95);
                    col += vec3(1.0) * smoothstep(6.5, 0.0, distSig) * 0.4;
                }
            }

        }
    }

    // Crosshair İmleci
    if (u_mouse.x >= 0.0 && u_mouse.x <= u_resolution.x &&
        u_mouse.y >= 0.0 && u_mouse.y <= u_resolution.y) {
        float crossX = smoothstep(1.2, 0.0, abs(pixelCoord.x - u_mouse.x));
        float crossY = smoothstep(1.2, 0.0, abs(pixelCoord.y - u_mouse.y));
        col += vec3(0.4, 0.6, 0.8) * (crossX + crossY) * 0.35;
    }

    fragColor = vec4(col, 1.0);
}
