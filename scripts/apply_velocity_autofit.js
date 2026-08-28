import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Declare velocity tracking variables
const oldPanVars = `        let isChartDragging = false;
        let chartDragStartX = 0;
        let chartDragStartY = 0;
        let origViewStart = 0;
        let origViewEnd = 0;`;

const newPanVars = `        let isChartDragging = false;
        let chartDragStartX = 0;
        let chartDragStartY = 0;
        let origViewStart = 0;
        let origViewEnd = 0;
        let lastDragX = 0;
        let lastDragY = 0;
        let lastDragTime = 0;
        let dragVelocityX = 0;
        let dragVelocityY = 0;
        let momentumVelocityX = 0;`;

content = content.replace(oldPanVars, newPanVars);

// 2. Update startPan to initialize velocity tracking
const oldStartPan = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            dragAxisLocked = null;
            chartDragStartX = clientX;
            chartDragStartY = clientY;
            origViewStart = viewStart;
            origViewEnd = viewEnd;
            origPriceOffset = priceOffset;
            canvasContainer.classList.add('grabbing');
            timeAxisElem.classList.add('grabbing');
        }`;

const newStartPan = `        function startPan(clientX, clientY) {
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

content = content.replace(oldStartPan, newStartPan);

// 3. Update mouseup to trigger smooth momentum glide
const oldMouseUp = `        window.addEventListener('mouseup', () => {
            isChartDragging = false;
            isPriceDragging = false;
            dragAxisLocked = null;
            canvasContainer.classList.remove('grabbing');
            timeAxisElem.classList.remove('grabbing');
            updateVisibleBacktestSummary();
        });`;

const newMouseUp = `        window.addEventListener('mouseup', () => {
            if (isChartDragging && Math.abs(dragVelocityX) > 0.25) {
                momentumVelocityX = -dragVelocityX * 0.7; // 🌟 Pürüzsüz ivmeli kayma (Smooth Inertial Glide)
            }
            isChartDragging = false;
            isPriceDragging = false;
            dragAxisLocked = null;
            canvasContainer.classList.remove('grabbing');
            timeAxisElem.classList.remove('grabbing');
            updateVisibleBacktestSummary();
        });`;

content = content.replace(oldMouseUp, newMouseUp);

// 4. Update mousemove to use velocity / acceleration threshold (absVx >= 0.28 px/ms for moderate/fast horizontal swipe)
const oldMouseMove = `            if (isChartDragging && totalCandles > 0) {
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
            }`;

const newMouseMove = `            if (isChartDragging && totalCandles > 0) {
                const now = performance.now();
                const dt = Math.max(1, now - lastDragTime);
                const instVx = (e.clientX - lastDragX) / dt;
                const instVy = (e.clientY - lastDragY) / dt;

                dragVelocityX = dragVelocityX * 0.6 + instVx * 0.4;
                dragVelocityY = dragVelocityY * 0.6 + instVy * 0.4;
                lastDragX = e.clientX;
                lastDragY = e.clientY;
                lastDragTime = now;

                const absVx = Math.abs(dragVelocityX);
                const absVy = Math.abs(dragVelocityY);
                const deltaPx = e.clientX - chartDragStartX;
                const deltaPy = e.clientY - chartDragStartY;

                // 🎯 İVMEYE VE HIZA BAĞLI OTOMATİK HİZALAMA (Velocity-Based Auto-Scale):
                // Orta-hızlı yatay ivmede (absVx >= 0.28 px/ms) otomatik ölçekleme devreye girer.
                // Yavaş veya hassas sürüklemelerde ise kullanıcının manuel dikey konumu serbestçe korunur.
                if (absVx >= 0.28 && absVx >= absVy * 1.15) {
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();
                } else if (absVy >= 0.28 && absVy > absVx * 1.3) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
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
                    priceOffset += (0 - priceOffset) * 0.22;
                    if (Math.abs(priceOffset) < 0.5) priceOffset = 0;
                } else {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }

                updateVisibleBacktestSummary();
            }`;

content = content.replace(oldMouseMove, newMouseMove);

// 5. In render(now) loop: add momentum decay
const oldRenderStart = `            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                overlayCanvas.width = w;
                overlayCanvas.height = h;
                if (isGpuActive && gl) gl.viewport(0, 0, w, h);
            }`;

const newRenderStart = `            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                overlayCanvas.width = w;
                overlayCanvas.height = h;
                if (isGpuActive && gl) gl.viewport(0, 0, w, h);
            }

            // 🚀 İVMELİ KAYMA (Inertial Velocity Glide)
            if (!isChartDragging && Math.abs(momentumVelocityX) > 0.01 && totalCandles > 0) {
                const candleSpan = viewEnd - viewStart;
                const deltaCandles = (momentumVelocityX / cssW) * candleSpan * 16;
                const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
                viewStart = Math.max(-80, viewStart + deltaCandles);
                viewEnd = Math.min(totalCandles + maxRightSpace, viewEnd + deltaCandles);
                momentumVelocityX *= 0.92;
                if (Math.abs(momentumVelocityX) < 0.01) momentumVelocityX = 0;
            }`;

content = content.replace(oldRenderStart, newRenderStart);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied velocity / acceleration (ivme) based auto-fit and inertial glide!');
