import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add capture-phase mousedown to canvasContainer to immediately turn off auto price scale
const targetMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            // Mousedown ve Pan yönetimi tamamen drawingEngine içindeki handleMouseDown tarafından yapılır
        });`;

const replacementMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // 🛑 CLICK TUŞUNA BASILDIĞI AN OTO ÖLÇEKLENDİRMEYİ ANINDA KAPAT!
                isAutoPriceScale = false;
                updateOtoButtonState();
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
                priceOffset = 0;
                origPriceOffset = 0;
            }
        }, true);`;

content = content.replace(targetMouseDown, replacementMouseDown);

// 2. Make isFastHorizontalSwipe strictly require pure horizontal swipe (never trigger during vertical movement)
const targetSwipe = `const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.15);`;
const replacementSwipe = `const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 3.0 && Math.abs(e.clientY - chartDragStartY) < 3);`;

content = content.replace(targetSwipe, replacementSwipe);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully enforced immediate mousedown auto-scale kill!');
