import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `            if (isPriceDragging) {
                isAutoPriceScale = false;
                updateOtoButtonState();
                const deltaY = priceDragStartY - e.clientY;
                priceScaleFactor = Math.max(0.001, Math.min(1000.0, priceScaleFactor * Math.exp(deltaY * 0.006)));
                priceDragStartY = e.clientY;
                return;
            }`;

const replacement = `            if (isPriceDragging) {
                isAutoPriceScale = false;
                updateOtoButtonState();
                const deltaY = priceDragStartY - e.clientY;
                const factor = Math.exp(deltaY * 0.005);
                priceDragStartY = e.clientY;

                if (!manualBaseMinPrice || manualBaseMinPrice === 0 || !isFinite(manualBaseMinPrice)) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
                const mid = (manualBaseMinPrice + manualBaseMaxPrice) / 2;
                const halfSpan = (manualBaseMaxPrice - manualBaseMinPrice) / 2;
                const newHalfSpan = Math.max(0.0001, halfSpan / factor);
                manualBaseMinPrice = mid - newHalfSpan;
                manualBaseMaxPrice = mid + newHalfSpan;
                smoothMinPrice = manualBaseMinPrice;
                smoothMaxPrice = manualBaseMaxPrice;
                minPrice = manualBaseMinPrice;
                maxPrice = manualBaseMaxPrice;
                priceOffset = 0;
                origPriceOffset = 0;
                return;
            }`;

content = content.replace(target, replacement);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully fixed price axis sidebar scaling!');
