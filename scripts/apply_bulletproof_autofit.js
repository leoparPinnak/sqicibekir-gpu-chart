import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Ensure state variables are declared cleanly
content = content.replace(
    /let priceOffset = 0;[\s\S]*?window\.resetPriceScale = function\(\) \{[\s\S]*?\};/m,
    `let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;
        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)
        let dragAxisLocked = null; // 'horizontal' | 'vertical' | null

        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
            isAutoPriceScale = true;
            dragAxisLocked = null;
            updateOtoButtonState();
        };

        function updateOtoButtonState() {
            const otoBtn = document.querySelector('.axis-corner-reset');
            if (otoBtn) {
                otoBtn.classList.toggle('active', isAutoPriceScale);
            }
        }`
);

// 2. In startPan and mouseup
content = content.replace(
    /function startPan\(clientX, clientY\) \{[\s\S]*?\}/m,
    `function startPan(clientX, clientY) {
            isChartDragging = true;
            dragAxisLocked = null;
            chartDragStartX = clientX;
            chartDragStartY = clientY;
            origViewStart = viewStart;
            origViewEnd = viewEnd;
            origPriceOffset = priceOffset;
            canvasContainer.classList.add('grabbing');
            timeAxisElem.classList.add('grabbing');
        }`
);

content = content.replace(
    /window\.addEventListener\('mouseup', \(\) => \{[\s\S]*?\}\);/m,
    `window.addEventListener('mouseup', () => {
            isChartDragging = false;
            isPriceDragging = false;
            dragAxisLocked = null;
            canvasContainer.classList.remove('grabbing');
            timeAxisElem.classList.remove('grabbing');
            updateVisibleBacktestSummary();
        });`
);

// 3. In mousemove: smart axis lock with horizontal auto-fit
content = content.replace(
    /if \(isChartDragging && totalCandles > 0\) \{[\s\S]*?updateVisibleBacktestSummary\(\);\s*\}/m,
    `if (isChartDragging && totalCandles > 0) {
                const deltaPx = e.clientX - chartDragStartX;
                const deltaPy = e.clientY - chartDragStartY;
                const absX = Math.abs(deltaPx);
                const absY = Math.abs(deltaPy);

                // 🎯 HAREKET YÖNÜ AYRIMI (Axis Discrimination):
                // Başlangıçta serbestçe başlar. Yatay hareket kesinleşirse (absX >= 8 ve absX >= absY) otomatik ölçekleme kilitlenir.
                if (!dragAxisLocked) {
                    if (absX >= 8 && absX >= absY) {
                        dragAxisLocked = 'horizontal';
                        isAutoPriceScale = true;
                        priceOffset = 0;
                        updateOtoButtonState();
                    } else if (absY >= 15 && absY > absX * 1.5) {
                        dragAxisLocked = 'vertical';
                        isAutoPriceScale = false;
                        updateOtoButtonState();
                    }
                }

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

                // 2. Dikey Eksen Yönetimi
                if (dragAxisLocked === 'horizontal' || isAutoPriceScale) {
                    priceOffset = 0;
                } else if (dragAxisLocked === 'vertical' || !isAutoPriceScale) {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }

                updateVisibleBacktestSummary();
            }`
);

// 4. In wheel event: always in auto mode and cursor-X anchor
content = content.replace(
    /canvasContainer\.addEventListener\('wheel', \(e\) => \{[\s\S]*?\}, \{ passive: false \}\);/m,
    `canvasContainer.addEventListener('wheel', (e) => {
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

            updateVisibleBacktestSummary();
        }, { passive: false });`
);

// 5. In render(): Bulletproof envelope price calculation guaranteeing 100% wick visibility
content = content.replace(
    /if \(totalCandles > 0\) \{\s*let minP = Infinity;[\s\S]*?minPrice = smoothMinPrice;\s*maxPrice = smoothMaxPrice;/m,
    `if (totalCandles > 0) {
                // 🌟 KESİN VE NET GÖRÜNÜR İĞNE FİYAT ÖLÇEĞİ (Tüm iğneler %100 ekranda kalır)
                const curVStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
                const curVEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
                const startI = Math.max(0, Math.floor(Math.min(viewStart, curVStart)));
                const endI = Math.min(totalCandles, Math.ceil(Math.max(viewEnd, curVEnd)));

                let minP = Infinity;
                let maxP = -Infinity;

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
                const pad = span * 0.10; // %10 üst ve alt tampon payı

                let targetMinPrice, targetMaxPrice;

                if (isAutoPriceScale) {
                    targetMinPrice = minP - pad;
                    targetMaxPrice = maxP + pad;
                } else {
                    const midP = (minP + maxP) / 2;
                    const baseHalfSpan = (span / 2) + pad;
                    const scaledHalfSpan = baseHalfSpan / priceScaleFactor;
                    targetMinPrice = midP - scaledHalfSpan + priceOffset;
                    targetMaxPrice = midP + scaledHalfSpan + priceOffset;
                }

                if (!smoothMinPrice || !isFinite(smoothMinPrice) || smoothMinPrice === 0) {
                    smoothMinPrice = targetMinPrice;
                    smoothMaxPrice = targetMaxPrice;
                    smoothViewStart = viewStart;
                    smoothViewEnd = viewEnd;
                } else {
                    const priceLerp = isChartDragging ? 0.45 : 0.32;
                    const viewLerp = isChartDragging ? 0.48 : 0.35;
                    smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                    smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                    smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                    smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                }

                minPrice = smoothMinPrice;
                maxPrice = smoothMaxPrice;`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully applied bulletproof visible wick auto-fit and envelope zoom math!');
