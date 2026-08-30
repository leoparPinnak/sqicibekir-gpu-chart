import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Declare manualBaseMinPrice and manualBaseMaxPrice
const targetDecl = `        let minPrice = 0;
        let maxPrice = 0;
        let smoothMinPrice = 0;
        let smoothMaxPrice = 0;
        let smoothViewStart = 0;
        let smoothViewEnd = 0;

        let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;
        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)`;

const replacementDecl = `        let minPrice = 0;
        let maxPrice = 0;
        let smoothMinPrice = 0;
        let smoothMaxPrice = 0;
        let manualBaseMinPrice = 0;
        let manualBaseMaxPrice = 0;
        let smoothViewStart = 0;
        let smoothViewEnd = 0;

        let priceOffset = 0; // Dikey serbest kaydırma ofseti
        let origPriceOffset = 0;
        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)`;

content = content.replace(targetDecl, replacementDecl);

// 2. Update startPan
const targetStartPan = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            dragAxisLocked = null;
            chartDragStartX = clientX;
            chartDragStartY = clientY;
            lastDragX = clientX;
            lastDragY = clientY;
            lastDragTime = performance.now();
            dragVelocityX = 0;
            dragVelocityY = 0;
            momentumVelocityX = 0;

            // 🛑 ANİMASYON ANINDA TIKLANIP BASILI TUTULDUĞUNDA:
            // 1. Animasyonu o anki karede anında dondur (Freeze Frame)
            if (smoothViewStart && isFinite(smoothViewStart)) {
                viewStart = smoothViewStart;
            }
            if (smoothViewEnd && isFinite(smoothViewEnd)) {
                viewEnd = smoothViewEnd;
            }
            if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                minPrice = smoothMinPrice;
                maxPrice = smoothMaxPrice;
            } else if (totalCandles > 0) {
                let mP = Infinity, xP = -Infinity;
                const sI = Math.max(0, Math.floor(viewStart));
                const eI = Math.min(totalCandles, Math.ceil(viewEnd));
                for (let i = sI; i < eI; i++) {
                    const c = candleDataBase[i];
                    if (c) {
                        if (c.low < mP) mP = c.low;
                        if (c.high > xP) xP = c.high;
                    }
                }
                if (isFinite(mP) && isFinite(xP) && mP < xP) {
                    const pad = (xP - mP) * 0.10;
                    minPrice = mP - pad;
                    maxPrice = xP + pad;
                    smoothMinPrice = minPrice;
                    smoothMaxPrice = maxPrice;
                }
            }

            // 2. Dikey kilidi ANINDA AÇ ve serbest 2D kaydırma moduna geç
            isAutoPriceScale = false;
            priceOffset = 0;
            origPriceOffset = 0;
            updateOtoButtonState();

            origViewStart = viewStart;
            origViewEnd = viewEnd;`;

const replacementStartPan = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            dragAxisLocked = null;
            chartDragStartX = clientX;
            chartDragStartY = clientY;
            lastDragX = clientX;
            lastDragY = clientY;
            lastDragTime = performance.now();
            dragVelocityX = 0;
            dragVelocityY = 0;
            momentumVelocityX = 0;

            // 🛑 ANİMASYON ANINDA TIKLANIP BASILI TUTULDUĞUNDA:
            // 1. Yatay ve dikey animasyonu o anki karede anında dondur (Freeze Frame)
            if (smoothViewStart && isFinite(smoothViewStart)) {
                viewStart = smoothViewStart;
            }
            if (smoothViewEnd && isFinite(smoothViewEnd)) {
                viewEnd = smoothViewEnd;
            }
            if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                manualBaseMinPrice = smoothMinPrice;
                manualBaseMaxPrice = smoothMaxPrice;
            } else if (totalCandles > 0) {
                let mP = Infinity, xP = -Infinity;
                const sI = Math.max(0, Math.floor(viewStart));
                const eI = Math.min(totalCandles, Math.ceil(viewEnd));
                for (let i = sI; i < eI; i++) {
                    const c = candleDataBase[i];
                    if (c) {
                        if (c.low < mP) mP = c.low;
                        if (c.high > xP) xP = c.high;
                    }
                }
                if (isFinite(mP) && isFinite(xP) && mP < xP) {
                    const pad = (xP - mP) * 0.10;
                    manualBaseMinPrice = mP - pad;
                    manualBaseMaxPrice = xP + pad;
                }
            }
            minPrice = manualBaseMinPrice;
            maxPrice = manualBaseMaxPrice;
            smoothMinPrice = manualBaseMinPrice;
            smoothMaxPrice = manualBaseMaxPrice;

            // 2. Dikey kilidi ANINDA AÇ ve serbest 2D kaydırma moduna geç
            isAutoPriceScale = false;
            priceOffset = 0;
            origPriceOffset = 0;
            updateOtoButtonState();

            origViewStart = viewStart;
            origViewEnd = viewEnd;`;

content = content.replace(targetStartPan, replacementStartPan);

// 3. Update mousemove vertical calculation
const targetMouseMoveVert = `                // 2. Dikey Eksen Yönetimi
                if (isAutoPriceScale) {
                    priceOffset = 0;
                } else {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + ((e.clientY - chartDragStartY) * pricePerPixel);
                    }
                }`;

const replacementMouseMoveVert = `                // 2. Dikey Eksen Yönetimi (Manuel Fiyat Çapası - 0ms Gecikme)
                if (isAutoPriceScale) {
                    priceOffset = 0;
                } else {
                    const currentPriceSpan = (manualBaseMaxPrice - manualBaseMinPrice) || (maxPrice - minPrice);
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + ((e.clientY - chartDragStartY) * pricePerPixel);
                    }
                }`;

content = content.replace(targetMouseMoveVert, replacementMouseMoveVert);

// 4. Update render loop price calculation
const targetRenderPrices = `                if (isAutoPriceScale) {
                    targetMinPrice = minP - pad;
                    targetMaxPrice = maxP + pad;
                } else {
                    const midP = (minP + maxP) / 2;
                    const baseHalfSpan = (span / 2) + pad;
                    const scaledHalfSpan = baseHalfSpan / priceScaleFactor;
                    targetMinPrice = midP - scaledHalfSpan + priceOffset;
                    targetMaxPrice = midP + scaledHalfSpan + priceOffset;
                }`;

const replacementRenderPrices = `                if (isAutoPriceScale) {
                    targetMinPrice = minP - pad;
                    targetMaxPrice = maxP + pad;
                    manualBaseMinPrice = targetMinPrice;
                    manualBaseMaxPrice = targetMaxPrice;
                } else {
                    // 🌟 MANUEL MODDA GÖRÜNÜR MUMLARA GÖRE OTO-ÖLÇEKLENDİRME YAPILMAZ!
                    // Fiyat ekseni tamamen serbest dünya koordinatlarında hareket eder (Sıfır takılma).
                    if (!manualBaseMinPrice || manualBaseMinPrice === 0) {
                        manualBaseMinPrice = minP - pad;
                        manualBaseMaxPrice = maxP + pad;
                    }
                    targetMinPrice = manualBaseMinPrice + priceOffset;
                    targetMaxPrice = manualBaseMaxPrice + priceOffset;
                }`;

content = content.replace(targetRenderPrices, replacementRenderPrices);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully applied manual base price architecture!');
