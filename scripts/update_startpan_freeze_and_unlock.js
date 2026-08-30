import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Update startPan
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
            origViewStart = viewStart;
            origViewEnd = viewEnd;
            origPriceOffset = priceOffset;
            canvasContainer.classList.add('grabbing');
            timeAxisElem.classList.add('grabbing');
        }`;

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
            }

            // 2. Dikey kilidi ANINDA AÇ ve serbest 2D kaydırma moduna geç
            isAutoPriceScale = false;
            priceOffset = 0;
            origPriceOffset = 0;
            updateOtoButtonState();

            origViewStart = viewStart;
            origViewEnd = viewEnd;

            const alertBadge = document.getElementById('hud-alert-badge');
            const alertText = document.getElementById('hud-alert-text');
            const livePillElem = document.getElementById('live-status-pill');
            if (alertBadge) alertBadge.className = 'hud-status-badge free';
            if (alertText) alertText.innerText = 'MANUEL SERBEST';
            if (livePillElem) {
                livePillElem.innerText = 'MANUEL SERBEST';
                livePillElem.className = 'status-pill free';
            }

            canvasContainer.classList.add('grabbing');
            timeAxisElem.classList.add('grabbing');
        }`;

content = content.replace(targetStartPan, replacementStartPan);

// 2. Update touchstart for mobile/touch gestures
const targetTouchStart = `                isTouching = true;
                isChartDragging = true;
                const t = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                chartDragStartX = t.clientX;
                chartDragStartY = t.clientY;
                mouseCssX = t.clientX - rect.left;
                mouseCssY = t.clientY - rect.top;
                mousePixelX = mouseCssX * (window.devicePixelRatio || 1);
                mousePixelY = (rect.height - mouseCssY) * (window.devicePixelRatio || 1);
                origViewStart = viewStart;
                origViewEnd = viewEnd;
                origPriceOffset = priceOffset;
                canvasContainer.classList.add('grabbing');`;

const replacementTouchStart = `                isTouching = true;
                isChartDragging = true;
                const t = e.touches[0];
                const rect = canvas.getBoundingClientRect();

                if (smoothViewStart && isFinite(smoothViewStart)) viewStart = smoothViewStart;
                if (smoothViewEnd && isFinite(smoothViewEnd)) viewEnd = smoothViewEnd;
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) minPrice = smoothMinPrice;
                if (smoothMaxPrice && isFinite(smoothMaxPrice) && smoothMaxPrice !== 0) maxPrice = smoothMaxPrice;
                momentumVelocityX = 0;
                isAutoPriceScale = false;
                priceOffset = 0;
                origPriceOffset = 0;
                updateOtoButtonState();

                chartDragStartX = t.clientX;
                chartDragStartY = t.clientY;
                mouseCssX = t.clientX - rect.left;
                mouseCssY = t.clientY - rect.top;
                mousePixelX = mouseCssX * (window.devicePixelRatio || 1);
                mousePixelY = (rect.height - mouseCssY) * (window.devicePixelRatio || 1);
                origViewStart = viewStart;
                origViewEnd = viewEnd;
                canvasContainer.classList.add('grabbing');`;

content = content.replace(targetTouchStart, replacementTouchStart);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated startPan and touchstart freeze & dynamic unlock!');
