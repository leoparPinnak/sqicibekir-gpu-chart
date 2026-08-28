import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Update mousemove to keep standard chart pan focused on timeline navigation (auto-fitting visible candles)
const oldMouseMovePan = `            if (isChartDragging && totalCandles > 0) {
                const deltaPx = e.clientX - chartDragStartX;
                const deltaPy = e.clientY - chartDragStartY;

                // 1. Yatay Zaman Kaydırma (X-Axis)
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
                const minAllowedStart = -80;
                const maxAllowedEnd = totalCandles + maxRightSpace;

                if (nStart < minAllowedStart) {
                    nStart = minAllowedStart;
                    nEnd = minAllowedStart + candleSpan;
                }
                if (nEnd > maxAllowedEnd) {
                    nEnd = maxAllowedEnd;
                    nStart = maxAllowedEnd - candleSpan;
                }

                viewStart = nStart;
                viewEnd = nEnd;

                // 2. Dikey Kaydırma Mantığı:
                // Kullanıcı belirgin şekilde dikey yönde (>12px) çektiyse Manuel Dikey Moda geçer.
                // Aksi takdirde yatayda gezinirken grafik mevcut görünen mumlara göre otomatik ortalanır.
                if (Math.abs(deltaPy) > 12) {
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }

                updateVisibleBacktestSummary();
            }`;

const newMouseMovePan = `            if (isChartDragging && totalCandles > 0) {
                const deltaPx = e.clientX - chartDragStartX;
                const deltaPy = e.clientY - chartDragStartY;

                // 1. Yatay Zaman Kaydırma (X-Axis) - Sağa/sola pürüzsüz akış
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
                const minAllowedStart = -80;
                const maxAllowedEnd = totalCandles + maxRightSpace;

                if (nStart < minAllowedStart) {
                    nStart = minAllowedStart;
                    nEnd = minAllowedStart + candleSpan;
                }
                if (nEnd > maxAllowedEnd) {
                    nEnd = maxAllowedEnd;
                    nStart = maxAllowedEnd - candleSpan;
                }

                viewStart = nStart;
                viewEnd = nEnd;

                // 2. Dikey Kaydırma Mantığı:
                // Sadece Alt tuşu basılıyken veya sağ fiyat ekseni çekildiğinde manuel dikey ofset uygulanır.
                // Normal fare sürüklemesinde grafik her zaman o an ekranda görünen mumların en yüksek/en düşük iğnesine göre tam otomatik hizalanır.
                if (e.altKey && Math.abs(deltaPy) > 5) {
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }

                updateVisibleBacktestSummary();
            }`;

content = content.replace(oldMouseMovePan, newMouseMovePan);

// 2. Update wheel event to perform mathematically exact cursor-anchored zoom in X and instantaneous Y auto-fit
const oldWheelEvent = `        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            const zoomSpeed = 0.0012;
            const zoomFactor = Math.exp(e.deltaY * zoomSpeed);

            const count = Math.max(1, viewEnd - viewStart);
            const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
            const minAllowedStart = -80;
            const maxAllowedEnd = totalCandles + maxRightSpace;
            const newCount = Math.max(10, Math.min(totalCandles + maxRightSpace, count * zoomFactor));

            const rect = canvas.getBoundingClientRect();
            const mouseNormX = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
            const mouseCandle = viewStart + mouseNormX * count;

            let nStart = mouseCandle - mouseNormX * newCount;
            let nEnd = mouseCandle + (1.0 - mouseNormX) * newCount;

            if (nStart < minAllowedStart) {
                nStart = minAllowedStart;
                nEnd = nStart + newCount;
            }
            if (nEnd > maxAllowedEnd) {
                nEnd = maxAllowedEnd;
                nStart = nEnd - newCount;
            }

            viewStart = nStart;
            viewEnd = nEnd;

            // Yakınlaşırken hedeflenen noktanın ekran altına/üstüne fırlamaması için orantısal ölçekle
            // Keep priceOffset intact during wheel zooming

            updateVisibleBacktestSummary();
        }, { passive: false });`;

const newWheelEvent = `        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            const rect = canvas.getBoundingClientRect();
            const zoomSpeed = 0.0015;
            const zoomFactor = Math.exp(e.deltaY * zoomSpeed);

            const count = Math.max(1, viewEnd - viewStart);
            const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
            const minAllowedStart = -80;
            const maxAllowedEnd = totalCandles + maxRightSpace;
            const newCount = Math.max(10, Math.min(totalCandles + maxRightSpace, count * zoomFactor));

            // 🎯 İMLECİN DURDUĞU NOKTAYI REFERANS ALAN HASSAS YAKINLAŞTIRMA (Cursor-Anchored Zoom)
            const mouseNormX = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
            const mouseCandle = viewStart + mouseNormX * count;

            let nStart = mouseCandle - mouseNormX * newCount;
            let nEnd = mouseCandle + (1.0 - mouseNormX) * newCount;

            if (nStart < minAllowedStart) {
                nStart = minAllowedStart;
                nEnd = nStart + newCount;
            }
            if (nEnd > maxAllowedEnd) {
                nEnd = maxAllowedEnd;
                nStart = nEnd - newCount;
            }

            viewStart = nStart;
            viewEnd = nEnd;

            // Tekerlek yakınlaştırmasında doğrudan görünen mum aralığına göre hızlı odaklan
            updateVisibleBacktestSummary();
        }, { passive: false });`;

content = content.replace(oldWheelEvent, newWheelEvent);

// 3. In render loop: Ensure visible minP & maxP are strictly calculated from currently visible candle wicks with ideal padding (0.08)
const oldRenderMinMax = `                let minP = Infinity;
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
                    if (totalCandles > 0 && candleDataBase[totalCandles - 1]) {
                        const lastP = candleDataBase[totalCandles - 1].close;
                        minP = lastP * 0.985;
                        maxP = lastP * 1.015;
                    } else {
                        minP = 60000;
                        maxP = 70000;
                    }
                }

                const span = Math.max(0.0001, maxP - minP);
                const pad = span * 0.12;
                const midP = (minP + maxP) / 2;

                let targetMinPrice, targetMaxPrice;

                if (isAutoPriceScale) {
                    // 🌟 OTO MODU (Auto-Fit): Yatayda gezinirken ekran TAMAMEN görünen mumlara göre otomatik ortalanır
                    targetMinPrice = minP - pad;
                    targetMaxPrice = maxP + pad;
                } else {
                    // 🌟 MANUEL MOD: Kullanıcının dikey ofseti ve ölçeği uygulanır
                    const baseHalfSpan = (span / 2) + pad;
                    const scaledHalfSpan = baseHalfSpan / priceScaleFactor;
                    targetMinPrice = midP - scaledHalfSpan + priceOffset;
                    targetMaxPrice = midP + scaledHalfSpan + priceOffset;
                }`;

const newRenderMinMax = `                // 🌟 GÖRÜNÜR ALANDAKİ MUMLARIN MİNİMUM DİP VE MAKSİMUM TEPE İĞNELERİ (WICKS)
                let minP = Infinity;
                let maxP = -Infinity;
                const curStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
                const curEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
                const startI = Math.max(0, Math.floor(curStart));
                const endI = Math.min(totalCandles, Math.ceil(curEnd));

                for (let i = startI; i < endI; i++) {
                    const c = candleDataBase[i];
                    if (c) {
                        if (c.low < minP) minP = c.low;
                        if (c.high > maxP) maxP = c.high;
                    }
                }

                if (!isFinite(minP) || !isFinite(maxP) || minP >= maxP) {
                    if (totalCandles > 0 && candleDataBase[totalCandles - 1]) {
                        const lastP = candleDataBase[totalCandles - 1].close;
                        minP = lastP * 0.985;
                        maxP = lastP * 1.015;
                    } else {
                        minP = 60000;
                        maxP = 70000;
                    }
                }

                const span = Math.max(0.0001, maxP - minP);
                const pad = span * 0.08; // %8 üst/alt konfor payı (Tüm mumlar ve iğneler %100 ekranda görünür)
                const midP = (minP + maxP) / 2;

                let targetMinPrice, targetMaxPrice;

                if (isAutoPriceScale) {
                    // 🌟 TAM OTOMATİK HİZALAMA: Fiyat ölçeği daima o an görünen min/max mum iğnelerini içine alır
                    targetMinPrice = minP - pad;
                    targetMaxPrice = maxP + pad;
                } else {
                    // 🌟 MANUEL DİKEY MOD:
                    const baseHalfSpan = (span / 2) + pad;
                    const scaledHalfSpan = baseHalfSpan / priceScaleFactor;
                    targetMinPrice = midP - scaledHalfSpan + priceOffset;
                    targetMaxPrice = midP + scaledHalfSpan + priceOffset;
                }`;

content = content.replace(oldRenderMinMax, newRenderMinMax);

// 4. Optimize Lerp speed for super responsive smooth tracking
content = content.replace(
    /const priceLerp = isChartDragging \? 0\.32 : 0\.16;\s*const viewLerp = isChartDragging \? 0\.40 : 0\.20;/,
    `const priceLerp = isChartDragging ? 0.45 : 0.28;
                    const viewLerp = isChartDragging ? 0.50 : 0.35;`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied perfect visible candle wick auto-fit and cursor-anchored zoom!');
