import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Update wheel event to start triggerZoomAnimation()
const targetWheel = `            viewStart = nStart;
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

            updateVisibleBacktestSummary();`;

const replacementWheel = `            viewStart = nStart;
            viewEnd = nEnd;

            // ⏱️ Zaman tabanlı ve logaritmik geçiş animasyonunu başlat
            triggerZoomAnimation();

            updateVisibleBacktestSummary();`;

if (content.includes(targetWheel)) {
    content = content.replace(targetWheel, replacementWheel);
    console.log('Successfully updated wheel handler!');
} else {
    console.log('targetWheel block not found!');
}

// 2. Update render loop LERP to use time-based logarithmic duration
const targetRender = `                    } else {
                        // Zoom in/out ve ivmeli serbest kaymada ipeksi LERP animasyonu
                        const priceLerp = 0.32;
                        const viewLerp = 0.35;
                        smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                    }`;

const replacementRender = `                    } else if (isZoomAnimating && zoomDurationSeconds > 0.001) {
                        // ⏱️ ZAMAN TABANLI VE DOĞAL LOGARİTMİK SÜRE MOTORU (0.0s - 1.0s Arası Ayarlanabilir)
                        const elapsed = (now - zoomAnimStartTime) / 1000;
                        const progress = Math.min(1.0, Math.max(0.0, elapsed / zoomDurationSeconds));
                        
                        // İpeksi Yumuşak Easing: easeOutCubic
                        const ease = 1 - Math.pow(1 - progress, 3);

                        // 1. Yatay Zaman Ekseni
                        smoothViewStart = zoomAnimStartViewStart + (viewStart - zoomAnimStartViewStart) * ease;
                        smoothViewEnd = zoomAnimStartViewEnd + (viewEnd - zoomAnimStartViewEnd) * ease;

                        // 2. Dikey Fiyat Ekseni: Doğal Logaritmik (ln) Ortalama Mum Boyutu Geçişi
                        const startSpan = Math.max(0.0001, zoomAnimStartMaxPrice - zoomAnimStartMinPrice);
                        const endSpan = Math.max(0.0001, targetMaxPrice - targetMinPrice);
                        const startMid = (zoomAnimStartMinPrice + zoomAnimStartMaxPrice) / 2;
                        const endMid = (targetMinPrice + targetMaxPrice) / 2;

                        const curMid = startMid + (endMid - startMid) * ease;
                        const logStartSpan = Math.log(startSpan);
                        const logEndSpan = Math.log(endSpan);
                        const curLogSpan = logStartSpan + (logEndSpan - logStartSpan) * ease;
                        const curSpan = Math.exp(curLogSpan);

                        smoothMinPrice = curMid - (curSpan / 2);
                        smoothMaxPrice = curMid + (curSpan / 2);

                        if (progress >= 1.0) {
                            isZoomAnimating = false;
                        }
                    } else {
                        // Durgun durum hafif LERP
                        const alpha = 0.25;
                        smoothViewStart += (viewStart - smoothViewStart) * alpha;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * alpha;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * alpha;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * alpha;
                    }`;

if (content.includes(targetRender)) {
    content = content.replace(targetRender, replacementRender);
    console.log('Successfully updated render LERP handler!');
} else {
    console.log('targetRender block not found!');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Done!');
