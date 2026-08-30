import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Update startPan to guarantee instant valid minPrice / maxPrice
const targetStartPan = `            // 🛑 ANİMASYON ANINDA TIKLANIP BASILI TUTULDUĞUNDA:
            // 1. Animasyonu o anki karede anında dondur (Freeze Frame)
            if (smoothViewStart && isFinite(smoothViewStart)) {
                viewStart = smoothViewStart;
            }
            if (smoothViewEnd && isFinite(smoothViewEnd)) {
                viewEnd = smoothViewEnd;
            }
            if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                minPrice = smoothMinPrice;
            }
            if (smoothMaxPrice && isFinite(smoothMaxPrice) && smoothMaxPrice !== 0) {
                maxPrice = smoothMaxPrice;
            }`;

const replacementStartPan = `            // 🛑 ANİMASYON ANINDA TIKLANIP BASILI TUTULDUĞUNDA:
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
            }`;

content = content.replace(targetStartPan, replacementStartPan);

// 2. Update wheel handler to immediately update minPrice/maxPrice
const targetWheel = `            viewStart = nStart;
            viewEnd = nEnd;

            updateVisibleBacktestSummary();`;

const replacementWheel = `            viewStart = nStart;
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

            updateVisibleBacktestSummary();`;

content = content.replace(targetWheel, replacementWheel);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully added instant minPrice/maxPrice updates to startPan and wheel!');
