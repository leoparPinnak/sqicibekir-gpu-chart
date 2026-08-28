import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add isAutoPriceScale variable and update resetPriceScale
const oldPriceScaleVars = `        let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;

        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
        };`;

const newPriceScaleVars = `        let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;
        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)

        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
            isAutoPriceScale = true;
            updateOtoButtonState();
        };

        function updateOtoButtonState() {
            const otoBtn = document.querySelector('.axis-corner-reset');
            if (otoBtn) {
                otoBtn.classList.toggle('active', isAutoPriceScale);
            }
        }`;

content = content.replace(oldPriceScaleVars, newPriceScaleVars);

// 2. Update CSS for .axis-corner-reset.active
const oldCornerResetCss = `        .axis-corner-reset {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 58px;
            height: 24px;
            background: #1e222d;
            border-top: 1px solid #2a2e39;
            border-left: 1px solid #2a2e39;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: #787b86;
            cursor: pointer;
            z-index: 20;
            transition: all 0.15s ease;
            user-select: none;
        }
        .axis-corner-reset:hover {
            background: #2a2e39;
            color: #2962ff;
        }`;

const newCornerResetCss = `        .axis-corner-reset {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 58px;
            height: 24px;
            background: #1e222d;
            border-top: 1px solid #2a2e39;
            border-left: 1px solid #2a2e39;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: #787b86;
            cursor: pointer;
            z-index: 20;
            transition: all 0.15s ease;
            user-select: none;
        }
        .axis-corner-reset:hover {
            background: #2a2e39;
            color: #38bdf8;
        }
        .axis-corner-reset.active {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.15);
            border-color: #38bdf8;
        }`;

content = content.replace(oldCornerResetCss, newCornerResetCss);

// 3. Update mousemove dragging logic to distinguish horizontal timeline pan vs intentional vertical drag
const oldMouseMovePan = `            if (isChartDragging && totalCandles > 0) {
                // 1. Yatay Zaman Kaydırma (X-Axis) - Sağa doğru boş alana serbestçe kayabilme
                const deltaPx = e.clientX - chartDragStartX;
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                // Sağa doğru geniş boş alan (en az 400 mum veya %100 boşluk)
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

                // 2. Dikey Fiyat Serbest Kaydırma (Y-Axis Free Pan - Doğal El Hareketi Yönü)
                const deltaPy = e.clientY - chartDragStartY;
                const currentPriceSpan = maxPrice - minPrice;
                if (currentPriceSpan > 0 && rect.height > 0) {
                    const pricePerPixel = currentPriceSpan / rect.height;
                    priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                }

                updateVisibleBacktestSummary();
            }`;

const newMouseMovePan = `            if (isChartDragging && totalCandles > 0) {
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

content = content.replace(oldMouseMovePan, newMouseMovePan);

// 4. Update isPriceDragging to disable auto mode
content = content.replace(
    /if \(isPriceDragging\) \{\s*const deltaY = priceDragStartY - e\.clientY;/g,
    `if (isPriceDragging) {
                isAutoPriceScale = false;
                updateOtoButtonState();
                const deltaY = priceDragStartY - e.clientY;`
);

// 5. In render loop: When isAutoPriceScale is true, fit 100% smoothly to visible candles
const oldRenderPriceMath = `                const span = Math.max(0.0001, maxP - minP);
                const pad = span * 0.12;
                const baseHalfSpan = (span / 2) + pad;
                const scaledHalfSpan = baseHalfSpan / priceScaleFactor;

                // 🌟 SINIRSIZ DİKEY KAYDIRMA: maxAllowedOffset tamamen kaldırıldı

                const midP = (minP + maxP) / 2;
                const targetMinPrice = midP - scaledHalfSpan + priceOffset;
                const targetMaxPrice = midP + scaledHalfSpan + priceOffset;`;

const newRenderPriceMath = `                const span = Math.max(0.0001, maxP - minP);
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

content = content.replace(oldRenderPriceMath, newRenderPriceMath);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully implemented dynamic Auto-Fit for visible candles during horizontal timeline navigation!');
