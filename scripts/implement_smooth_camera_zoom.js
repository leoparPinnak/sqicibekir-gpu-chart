import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Update wheel event to set target view bounds without hard-forcing instant snap
const targetWheel = `        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            // 🛑 Fare basılı tutulurken veya sürüklenirken tekerlekten gelen kuyruk/momentum eventleri TAMAMEN BLOKE EDİLİR!
            if (isChartDragging || isPriceDragging) {
                return;
            }

            // 🌟 ZOOM ESNASINDA OTO ÖLÇEKLENDİRME AÇILIR
            isAutoPriceScale = true;
            priceOffset = 0;
            origPriceOffset = 0;
            priceScaleFactor = 1.0;
            updateOtoButtonState();

            const rect = canvas.getBoundingClientRect();
            const zoomSpeed = 0.0015;
            const zoomFactor = Math.exp(e.deltaY * zoomSpeed);

            const count = Math.max(1, viewEnd - viewStart);
            const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
            const minAllowedStart = -80;
            const maxAllowedEnd = totalCandles + maxRightSpace;
            const newCount = Math.max(10, Math.min(totalCandles + maxRightSpace, count * zoomFactor));

            // 🎯 İMLECİN SADECE YATAYDAKİ (X EKSENİ) KONUMUNA DOĞRU ZOOM
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
            // 🚀 ANINDA VE KESKİN ZOOM (TradingView Standardı: Asla arkadan sarkan hayalet animasyon kalmaz)
            smoothViewStart = nStart;
            smoothViewEnd = nEnd;

            // ⚡ Anında min/max fiyat güncellemesi (Gecikmesiz, anında kilitlenme)
            let wheelMinP = Infinity, wheelMaxP = -Infinity;
            const wStartI = Math.max(0, Math.floor(nStart));
            const wEndI = Math.min(totalCandles, Math.ceil(nEnd));
            for (let i = wStartI; i < wEndI; i++) {
                const c = candleDataBase[i];
                if (c) {
                    if (c.low < wheelMinP) wheelMinP = c.low;
                    if (c.high > wheelMaxP) wheelMaxP = c.high;
                }
            }
            if (isFinite(wheelMinP) && isFinite(wheelMaxP) && wheelMinP < wheelMaxP) {
                const wPad = (wheelMaxP - wheelMinP) * 0.10;
                minPrice = wheelMinP - wPad;
                maxPrice = wheelMaxP + wPad;
                smoothMinPrice = minPrice;
                smoothMaxPrice = maxPrice;
                manualBaseMinPrice = minPrice;
                manualBaseMaxPrice = maxPrice;
            }

            updateVisibleBacktestSummary();
        }, { passive: false });`;

const replacementWheel = `        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            // 🛑 Fare basılı tutulurken tekerlek eventleri bloke edilir
            if (isChartDragging || isPriceDragging) {
                return;
            }

            // 🌟 ZOOM ESNASINDA OTO ÖLÇEKLENDİRME AKTİF OLUR
            isAutoPriceScale = true;
            priceOffset = 0;
            origPriceOffset = 0;
            priceScaleFactor = 1.0;
            updateOtoButtonState();

            const rect = canvas.getBoundingClientRect();
            const zoomSpeed = 0.0013;
            const zoomFactor = Math.exp(e.deltaY * zoomSpeed);

            const count = Math.max(1, viewEnd - viewStart);
            const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
            const minAllowedStart = -80;
            const maxAllowedEnd = totalCandles + maxRightSpace;
            const newCount = Math.max(10, Math.min(totalCandles + maxRightSpace, count * zoomFactor));

            // 🎯 İMLECİN KONUMUNA ODAKLANAN SİNEMATİK KAMERA HEDEFİ
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

            updateVisibleBacktestSummary();
        }, { passive: false });`;

content = content.replace(targetWheel, replacementWheel);

// 2. Update render loop LERP to have silky smooth synchronized camera easing
const targetLerp = `                    } else {
                        // Zoom in/out ve ivmeli serbest kaymada ipeksi LERP animasyonu
                        const priceLerp = 0.32;
                        const viewLerp = 0.35;
                        smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                    }`;

const replacementLerp = `                    } else {
                        // 🎥 SİNEMATİK KAMERA ODAKLI İPEKSİ ZOOM ANİMASYONU (Smooth Camera Zoom Easing)
                        // İmlece doğru yumuşakça süzülen kamera: Ekrandan çıkan mumlar yavaşça kayar,
                        // büyüyen mumlar ipeksi bir akıcılıkla genişler, hiçbir ani sıçrama veya kopma yaşanmaz.
                        const cameraAlpha = 0.22;
                        smoothViewStart += (viewStart - smoothViewStart) * cameraAlpha;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * cameraAlpha;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * cameraAlpha;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * cameraAlpha;
                    }`;

content = content.replace(targetLerp, replacementLerp);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully implemented smooth cinematic camera zoom!');
