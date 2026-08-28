import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Declare isAutoPriceScale and dragAxisLocked cleanly
const oldStateBlock = `        let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;

        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
        };`;

const newStateBlock = `        let priceOffset = 0; // Dikey serbest kaydırma ofseti
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
        }`;

content = content.replace(oldStateBlock, newStateBlock);

// 2. In startPan reset dragAxisLocked
content = content.replace(
    /function startPan\(clientX, clientY\) \{\s*isChartDragging = true;\s*chartDragStartX = clientX;\s*chartDragStartY = clientY;\s*origViewStart = viewStart;\s*origViewEnd = viewEnd;\s*origPriceOffset = priceOffset;\s*canvasContainer\.classList\.add\('grabbing'\);\s*timeAxisElem\.classList\.add\('grabbing'\);\s*\}/,
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

// 3. In window mouseup reset dragAxisLocked
content = content.replace(
    /window\.addEventListener\('mouseup', \(\) => \{\s*isChartDragging = false;\s*isPriceDragging = false;\s*canvasContainer\.classList\.remove\('grabbing'\);\s*timeAxisElem\.classList\.remove\('grabbing'\);\s*updateVisibleBacktestSummary\(\);\s*\}\);/,
    `window.addEventListener('mouseup', () => {
            isChartDragging = false;
            isPriceDragging = false;
            dragAxisLocked = null;
            canvasContainer.classList.remove('grabbing');
            timeAxisElem.classList.remove('grabbing');
            updateVisibleBacktestSummary();
        });`
);

// 4. Update mousemove dragging with axis lock discrimination
const oldMouseMoveDragging = `            if (isChartDragging && totalCandles > 0) {
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

const newMouseMoveDragging = `            if (isChartDragging && totalCandles > 0) {
                const deltaPx = e.clientX - chartDragStartX;
                const deltaPy = e.clientY - chartDragStartY;
                const absX = Math.abs(deltaPx);
                const absY = Math.abs(deltaPy);

                // 🎯 HAREKET YÖNÜ AYRIMI (Axis Discrimination):
                // Başlangıçta serbestçe başlar. Yatay hareket kesinleşirse (absX > 15 ve absX > absY) otomatik ölçekleme kilitlenir.
                if (!dragAxisLocked) {
                    if (absX > 15 && absX >= absY * 1.1) {
                        dragAxisLocked = 'horizontal';
                        isAutoPriceScale = true;
                        updateOtoButtonState();
                    } else if (absY > 15 && absY > absX * 1.1) {
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
                    // Yatay hareket kesinleştiğinde dikey ofset yumuşakça 0'a çekilir ve görünen mumlara kilitlenir
                    priceOffset += (0 - priceOffset) * 0.25;
                    if (Math.abs(priceOffset) < 0.5) priceOffset = 0;
                } else if (dragAxisLocked === 'vertical' || !isAutoPriceScale) {
                    // Dikey hareket yapılıyorsa serbest manuel dikey ofset uygulanır
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }

                updateVisibleBacktestSummary();
            }`;

content = content.replace(oldMouseMoveDragging, newMouseMoveDragging);

// 5. Update wheel event to force Auto Mode and cursor X anchoring
const oldWheel = `        canvasContainer.addEventListener('wheel', (e) => {
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

const newWheel = `        canvasContainer.addEventListener('wheel', (e) => {
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

            // Dikey kısım render döngüsünde görünen mum iğnelerine göre otomatik ölçeklenir
            updateVisibleBacktestSummary();
        }, { passive: false });`;

content = content.replace(oldWheel, newWheel);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied smart axis lock discrimination and dedicated cursor-X auto-zoom!');
