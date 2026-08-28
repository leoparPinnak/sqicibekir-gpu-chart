import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Initial active class on OTO button
content = content.replace(
    /<div class="axis-corner-reset" onclick="resetPriceScale\(\)" title="Fiyat ölçeğini otomatik sıfırla">\s*OTO\s*<\/div>/,
    `<div class="axis-corner-reset active" onclick="resetPriceScale()" title="Fiyat ölçeğini otomatik sıfırla">\n                    OTO\n                </div>`
);

// 2. In wheel event: Instantaneous snap of smoothMinPrice & smoothMaxPrice to visible candle wicks
const oldWheelEvent = `            // Dikey kısım render döngüsünde görünen mum iğnelerine göre otomatik ölçeklenir
            updateVisibleBacktestSummary();
        }, { passive: false });`;

const newWheelEvent = `            // 🌟 DİKEY EKSEN ANINDA GÖRÜNEN MUM İĞNELERİNE KİLİTLENİR (SIFIR GECİKME / SIFIR SAPITMA)
            const curStartI = Math.max(0, Math.floor(viewStart));
            const curEndI = Math.min(totalCandles, Math.ceil(viewEnd));
            let vMinP = Infinity, vMaxP = -Infinity;
            for (let i = curStartI; i < curEndI; i++) {
                const c = candleDataBase[i];
                if (c) {
                    if (c.low < vMinP) vMinP = c.low;
                    if (c.high > vMaxP) vMaxP = c.high;
                }
            }
            if (isFinite(vMinP) && isFinite(vMaxP) && vMinP < vMaxP) {
                const vSpan = vMaxP - vMinP;
                const vPad = vSpan * 0.08;
                smoothMinPrice = vMinP - vPad;
                smoothMaxPrice = vMaxP + vPad;
                minPrice = smoothMinPrice;
                maxPrice = smoothMaxPrice;
            }

            updateVisibleBacktestSummary();
        }, { passive: false });`;

content = content.replace(oldWheelEvent, newWheelEvent);

// 3. In resetPriceScale: Also immediately snap smoothMinPrice & smoothMaxPrice
content = content.replace(
    /window\.resetPriceScale = function\(\) \{\s*priceScaleFactor = 1\.0;\s*priceOffset = 0;\s*isAutoPriceScale = true;\s*dragAxisLocked = null;\s*updateOtoButtonState\(\);\s*\};/,
    `window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
            isAutoPriceScale = true;
            dragAxisLocked = null;
            updateOtoButtonState();

            const curStartI = Math.max(0, Math.floor(viewStart));
            const curEndI = Math.min(totalCandles, Math.ceil(viewEnd));
            let vMinP = Infinity, vMaxP = -Infinity;
            for (let i = curStartI; i < curEndI; i++) {
                const c = candleDataBase[i];
                if (c) {
                    if (c.low < vMinP) vMinP = c.low;
                    if (c.high > vMaxP) vMaxP = c.high;
                }
            }
            if (isFinite(vMinP) && isFinite(vMaxP) && vMinP < vMaxP) {
                const vSpan = vMaxP - vMinP;
                const vPad = vSpan * 0.08;
                smoothMinPrice = vMinP - vPad;
                smoothMaxPrice = vMaxP + vPad;
                minPrice = smoothMinPrice;
                maxPrice = smoothMaxPrice;
            }
        };`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied instantaneous auto-fit snap on wheel zoom and price scale reset!');
