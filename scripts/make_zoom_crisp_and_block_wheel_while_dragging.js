import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const targetWheelBlock = `        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (totalCandles === 0) return;

            // 🌟 ZOOM ESNASINDA KESİNLİKLE OTO ÖLÇEKLENDİRME AÇIKTIR
            isAutoPriceScale = true;
            priceOffset = 0;
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

            // ⚡ Anında min/max fiyat güncellemesi (İlk mousemove anında 0ms gecikmesiz dikey kaydırma için)
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
            }

            updateVisibleBacktestSummary();
        }, { passive: false });`;

const replacementWheelBlock = `        canvasContainer.addEventListener('wheel', (e) => {
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

content = content.replace(targetWheelBlock, replacementWheelBlock);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully made zoom crisp and blocked trailing wheel events while dragging!');
