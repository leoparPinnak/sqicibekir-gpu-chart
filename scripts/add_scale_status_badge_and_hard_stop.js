import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add CSS for scale-live-indicator-badge
const cssTarget = `        .hud-status-badge.alert-locked {
            background: rgba(239, 68, 68, 0.2);
            border-color: #ef4444;
            color: #ef4444;
            animation: pulse-alert 0.8s infinite alternate;
        }`;

const cssReplacement = `        .hud-status-badge.alert-locked {
            background: rgba(239, 68, 68, 0.2);
            border-color: #ef4444;
            color: #ef4444;
            animation: pulse-alert 0.8s infinite alternate;
        }

        .scale-live-indicator-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
        }
        .scale-live-indicator-badge.auto-active {
            background: rgba(56, 189, 248, 0.2);
            border: 1px solid #38bdf8;
            color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
        }
        .scale-live-indicator-badge.manual-free {
            background: rgba(245, 158, 11, 0.2);
            border: 1px solid #f59e0b;
            color: #fbbf24;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
        }
        .scale-indicator-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
        }`;

content = content.replace(cssTarget, cssReplacement);

// 2. Add badge in the bottom statusbar next to persistent-velocity-hud
const hudTarget = `                <!-- ⚡ HER AN GÖRÜNÜR İVME, MAX VE EŞİK AŞIM HUD BARI -->
                <div class="persistent-velocity-hud" id="persistent-velocity-hud"`;

const hudReplacement = `                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Aç/Kapat)">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">🔒 OTO ÖLÇEK: AÇIK</span>
                </div>

                <!-- ⚡ HER AN GÖRÜNÜR İVME, MAX VE EŞİK AŞIM HUD BARI -->
                <div class="persistent-velocity-hud" id="persistent-velocity-hud"`;

content = content.replace(hudTarget, hudReplacement);

// 3. Update updateOtoButtonState and add toggleAutoPriceScale and global window mousedown hard stop
const otoTarget = `        window.resetPriceScale = function() {
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

const otoReplacement = `        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
            origPriceOffset = 0;
            isAutoPriceScale = true;
            dragAxisLocked = null;
            updateOtoButtonState();
        };

        window.toggleAutoPriceScale = function(e) {
            if (e) e.stopPropagation();
            isAutoPriceScale = !isAutoPriceScale;
            if (isAutoPriceScale) {
                priceOffset = 0;
                origPriceOffset = 0;
            } else {
                manualBaseMinPrice = smoothMinPrice;
                manualBaseMaxPrice = smoothMaxPrice;
            }
            updateOtoButtonState();
        };

        function updateOtoButtonState() {
            const otoBtn = document.querySelector('.axis-corner-reset');
            if (otoBtn) {
                otoBtn.classList.toggle('active', isAutoPriceScale);
            }
            const scaleBadge = document.getElementById('scale-live-indicator');
            const scaleText = document.getElementById('scale-status-text');
            if (scaleBadge && scaleText) {
                if (isAutoPriceScale) {
                    scaleBadge.className = 'scale-live-indicator-badge auto-active';
                    scaleText.innerText = '🔒 OTO ÖLÇEK: AÇIK';
                } else {
                    scaleBadge.className = 'scale-live-indicator-badge manual-free';
                    scaleText.innerText = '🔓 OTO ÖLÇEK: DEVRE DIŞI (SERBEST)';
                }
            }
            const alertBadge = document.getElementById('hud-alert-badge');
            const alertText = document.getElementById('hud-alert-text');
            if (alertBadge && alertText) {
                if (isAutoPriceScale) {
                    alertBadge.className = 'hud-status-badge alert-locked';
                    alertText.innerText = 'OTO KİLİTLİ';
                } else {
                    alertBadge.className = 'hud-status-badge free';
                    alertText.innerText = 'MANUEL SERBEST';
                }
            }
            const livePill = document.getElementById('live-status-pill');
            if (livePill) {
                livePill.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                livePill.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
            }
        }

        // 🛑 KESİN VE ANINDA OTO KİLİT KAPATMA (Global Window Mousedown Capture)
        window.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            const insideChart = e.target.closest('#canvas-container') || e.target.closest('#glcanvas') || e.target.closest('#overlay-canvas') || e.target.closest('#time-axis') || e.target.closest('.chart-body');
            if (insideChart && !e.target.closest('.axis-corner-reset') && !e.target.closest('.scale-live-indicator-badge')) {
                isAutoPriceScale = false;
                smoothViewStart = viewStart;
                smoothViewEnd = viewEnd;
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
                smoothMinPrice = manualBaseMinPrice;
                smoothMaxPrice = manualBaseMaxPrice;
                minPrice = manualBaseMinPrice;
                maxPrice = manualBaseMaxPrice;
                priceOffset = 0;
                origPriceOffset = 0;
                chartDragStartY = e.clientY;
                chartDragStartX = e.clientX;
                lastDragX = e.clientX;
                lastDragY = e.clientY;
                dragVelocityX = 0;
                dragVelocityY = 0;
                momentumVelocityX = 0;
                updateOtoButtonState();
            }
        }, true);`;

content = content.replace(otoTarget, otoReplacement);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully added prominent scale status badge and hard mousedown auto-scale kill!');
