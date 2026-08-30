import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Update CSS for 3-way segmented scale mode group to guarantee high z-index and clickability
const targetCss = `        .scale-mode-segmented-group {
            display: inline-flex;
            align-items: center;
            background: #10141f;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 2px;
            gap: 2px;
            margin-left: 8px;
            user-select: none;
        }`;

const replacementCss = `        .scale-mode-segmented-group {
            display: inline-flex;
            align-items: center;
            background: #10141f;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 2px;
            gap: 2px;
            margin-left: 8px;
            user-select: none;
            position: relative;
            z-index: 9999;
            pointer-events: auto !important;
        }
        .scale-mode-btn {
            background: transparent;
            border: 1px solid transparent;
            color: #94a3b8;
            padding: 4px 9px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            font-family: 'SF Pro Text', 'Segoe UI', sans-serif;
            cursor: pointer !important;
            pointer-events: auto !important;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.15s ease;
        }
        .scale-mode-btn:hover {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.08);
        }
        .scale-mode-btn.active.mode-free {
            background: rgba(245, 158, 11, 0.25) !important;
            border-color: #f59e0b !important;
            color: #fbbf24 !important;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        }
        .scale-mode-btn.active.mode-velocity {
            background: rgba(56, 189, 248, 0.25) !important;
            border-color: #38bdf8 !important;
            color: #38bdf8 !important;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
        }
        .scale-mode-btn.active.mode-locked {
            background: rgba(16, 185, 129, 0.25) !important;
            border-color: #10b981 !important;
            color: #10b981 !important;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }`;

if (content.includes(targetCss)) {
    content = content.replace(targetCss, replacementCss);
    console.log('Updated CSS for scale-mode-segmented-group');
} else {
    console.log('targetCss not found!');
}

// 2. Update HTML HUD for 3-mode selector with explicit event propagation and pointer events
const targetHud = `                <!-- 🎯 3 KADEMELİ ÖLÇEKLEME MODU SEÇİCİ (SERBEST | İVMELİ | KİLİTLİ) -->
                <div class="scale-mode-segmented-group" id="scale-mode-group" title="Ölçekleme Modu: Serbest (Manuel), İvmeli (Akıllı) veya Kilitli (Sabit Oto). [Space: Anında Otomatik Sığdır]">
                    <button class="scale-mode-btn" id="mode-btn-free" onclick="setScaleMode('free')" title="Serbest (Manuel) Mod: Otomatik kilit tamamen kapalı, serbest 2D kaydırma">
                        <span class="mode-dot dot-free"></span>
                        <span>Serbest</span>
                    </button>
                    <button class="scale-mode-btn active mode-velocity" id="mode-btn-velocity" onclick="setScaleMode('velocity')" title="İvmeli (Akıllı) Mod: Yatayda hızlı kaydırınca kilitlenir, dikeyde serbest kalır">
                        <span class="mode-dot dot-velocity"></span>
                        <span>İvmeli</span>
                    </button>
                    <button class="scale-mode-btn" id="mode-btn-locked" onclick="setScaleMode('locked')" title="Kilitli (Sabit Oto) Mod: Daima görünür mumlara kilitli kalır">
                        <span class="mode-dot dot-locked"></span>
                        <span>Kilitli</span>
                    </button>
                </div>

                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Aç/Kapat) [Space: Otomatik Sığdır]">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">🔒 OTO ÖLÇEK: AÇIK</span>
                </div>`;

const replacementHud = `                <!-- 🎯 3 KADEMELİ ÖLÇEKLEME MODU SEÇİCİ (SERBEST | İVMELİ | KİLİTLİ) -->
                <div class="scale-mode-segmented-group" id="scale-mode-group" title="Ölçekleme Modu: Serbest (Manuel), İvmeli (Akıllı) veya Kilitli (Sabit Oto). [Space: Anında Otomatik Sığdır]">
                    <button class="scale-mode-btn" id="mode-btn-free" onclick="setScaleMode('free', event)" title="Serbest (Manuel) Mod: Otomatik kilit tamamen kapalı, serbest 2D kaydırma">
                        <span class="mode-dot dot-free"></span>
                        <span>Serbest</span>
                    </button>
                    <button class="scale-mode-btn active mode-velocity" id="mode-btn-velocity" onclick="setScaleMode('velocity', event)" title="İvmeli (Akıllı) Mod: Yatayda hızlı kaydırınca kilitlenir, dikeyde serbest kalır">
                        <span class="mode-dot dot-velocity"></span>
                        <span>İvmeli</span>
                    </button>
                    <button class="scale-mode-btn" id="mode-btn-locked" onclick="setScaleMode('locked', event)" title="Kilitli (Sabit Oto) Mod: Daima görünür mumlara kilitli kalır">
                        <span class="mode-dot dot-locked"></span>
                        <span>Kilitli</span>
                    </button>
                </div>

                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Mod Değiştir) [Space: Otomatik Sığdır]">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">⚡ İVMELİ MOD</span>
                </div>`;

if (content.includes(targetHud)) {
    content = content.replace(targetHud, replacementHud);
    console.log('Updated HTML HUD with explicit event propagation');
} else {
    console.log('targetHud not found!');
}

// 3. Update setScaleMode function and Space auto-fit
const targetScaleModeFn = `        let scaleMode = localStorage.getItem('tradechart_scale_mode') || 'velocity';
        window.scaleMode = scaleMode;

        window.setScaleMode = function(mode) {
            if (!['free', 'velocity', 'locked'].includes(mode)) mode = 'velocity';
            scaleMode = mode;
            window.scaleMode = scaleMode;
            localStorage.setItem('tradechart_scale_mode', scaleMode);

            if (scaleMode === 'locked') {
                isAutoPriceScale = true;
                priceOffset = 0;
                origPriceOffset = 0;
                triggerSpaceAutoFit();
            } else if (scaleMode === 'free') {
                isAutoPriceScale = false;
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
            } else if (scaleMode === 'velocity') {
                // İvmeli mod varsayılan serbest durum
            }

            updateScaleModeUI();
            updateOtoButtonState();
        };`;

const replacementScaleModeFn = `        let scaleMode = localStorage.getItem('tradechart_scale_mode') || 'velocity';
        window.scaleMode = scaleMode;

        window.setScaleMode = function(mode, e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (!['free', 'velocity', 'locked'].includes(mode)) mode = 'velocity';
            scaleMode = mode;
            window.scaleMode = scaleMode;
            localStorage.setItem('tradechart_scale_mode', scaleMode);

            isZoomAnimating = false; // 🛑 Zoom animasyonunu anında durdur

            if (scaleMode === 'locked') {
                isAutoPriceScale = true;
                priceOffset = 0;
                origPriceOffset = 0;
                triggerSpaceAutoFit();
            } else if (scaleMode === 'free') {
                isAutoPriceScale = false;
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
                priceOffset = 0;
                origPriceOffset = 0;
            } else if (scaleMode === 'velocity') {
                isAutoPriceScale = false;
                if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                }
                priceOffset = 0;
                origPriceOffset = 0;
            }

            updateScaleModeUI();
            updateOtoButtonState();
        };`;

if (content.includes(targetScaleModeFn)) {
    content = content.replace(targetScaleModeFn, replacementScaleModeFn);
    console.log('Updated setScaleMode function');
} else {
    console.log('targetScaleModeFn not found!');
}

// 4. Update updateOtoButtonState to update badge text accurately
const targetOtoBtnState = `            const scaleBadge = document.getElementById('scale-live-indicator');
            const scaleText = document.getElementById('scale-status-text');
            if (scaleBadge && scaleText) {
                if (isAutoPriceScale) {
                    scaleBadge.className = 'scale-live-indicator-badge auto-active';
                    scaleText.innerText = '🔒 OTO ÖLÇEK: AÇIK';
                } else {
                    scaleBadge.className = 'scale-live-indicator-badge manual-free';
                    scaleText.innerText = '🔓 OTO ÖLÇEK: DEVRE DIŞI (SERBEST)';
                }
            }`;

const replacementOtoBtnState = `            const scaleBadge = document.getElementById('scale-live-indicator');
            const scaleText = document.getElementById('scale-status-text');
            if (scaleBadge && scaleText) {
                if (scaleMode === 'locked') {
                    scaleBadge.className = 'scale-live-indicator-badge auto-active';
                    scaleText.innerText = '🔒 SABİT KİLİTLİ';
                } else if (scaleMode === 'free') {
                    scaleBadge.className = 'scale-live-indicator-badge manual-free';
                    scaleText.innerText = '🔓 SERBEST (MANUEL)';
                } else {
                    if (isAutoPriceScale) {
                        scaleBadge.className = 'scale-live-indicator-badge auto-active';
                        scaleText.innerText = '⚡ İVMELİ (KİLİTLİ)';
                    } else {
                        scaleBadge.className = 'scale-live-indicator-badge manual-free';
                        scaleText.innerText = '⚡ İVMELİ (SERBEST)';
                    }
                }
            }`;

if (content.includes(targetOtoBtnState)) {
    content = content.replace(targetOtoBtnState, replacementOtoBtnState);
    console.log('Updated updateOtoButtonState for scaleMode');
} else {
    console.log('targetOtoBtnState not found!');
}

// 5. Update mousedown and startPan to IMMEDIATELY cancel isZoomAnimating
const targetMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // 🛑 CLICK TUŞUNA BASILDIĞINDA (Kilitli modda değilse) OTO ÖLÇEKLENDİRMEYİ ANINDA KAPAT!
                if (scaleMode !== 'locked') {
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                        manualBaseMinPrice = smoothMinPrice;
                        manualBaseMaxPrice = smoothMaxPrice;
                    }
                    priceOffset = 0;
                    origPriceOffset = 0;
                }
            }
        }, true);`;

const replacementMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // 🛑 CLICK TUŞUNA BASILDIĞI AN ZOOM ANİMASYONUNU ANINDA DURDUR!
                isZoomAnimating = false;

                if (scaleMode !== 'locked') {
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                        manualBaseMinPrice = smoothMinPrice;
                        manualBaseMaxPrice = smoothMaxPrice;
                    }
                    priceOffset = 0;
                    origPriceOffset = 0;
                }
            }
        }, true);`;

if (content.includes(targetMouseDown)) {
    content = content.replace(targetMouseDown, replacementMouseDown);
    console.log('Updated mousedown to immediately cancel isZoomAnimating');
} else {
    console.log('targetMouseDown not found!');
}

// 6. Update startPan to immediately cancel isZoomAnimating
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
            momentumVelocityX = 0;`;

const replacementStartPan = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            isZoomAnimating = false; // 🛑 SÜRÜKLEME BAŞLADIĞI AN ZOOM ANİMASYONUNU ANINDA KES!
            dragAxisLocked = null;
            chartDragStartX = clientX;
            chartDragStartY = clientY;
            lastDragX = clientX;
            lastDragY = clientY;
            lastDragTime = performance.now();
            dragVelocityX = 0;
            dragVelocityY = 0;
            momentumVelocityX = 0;`;

if (content.includes(targetStartPan)) {
    content = content.replace(targetStartPan, replacementStartPan);
    console.log('Updated startPan to immediately cancel isZoomAnimating');
} else {
    console.log('targetStartPan not found!');
}

// 7. Update wheel event to respect scaleMode
const targetWheel = `            // 🌟 ZOOM ESNASINDA OTO ÖLÇEKLENDİRME AÇILIR
            isAutoPriceScale = true;
            priceOffset = 0;
            origPriceOffset = 0;
            priceScaleFactor = 1.0;
            updateOtoButtonState();`;

const replacementWheel = `            // 🌟 ZOOM ESNASINDA MODA GÖRE ÖLÇEKLENDİRME:
            if (scaleMode === 'free') {
                isAutoPriceScale = false;
            } else {
                isAutoPriceScale = true;
                priceOffset = 0;
                origPriceOffset = 0;
                priceScaleFactor = 1.0;
            }
            updateOtoButtonState();`;

if (content.includes(targetWheel)) {
    content = content.replace(targetWheel, replacementWheel);
    console.log('Updated wheel handler to respect scaleMode');
} else {
    console.log('targetWheel not found!');
}

// 8. Update render loop: If isChartDragging is true, cancel isZoomAnimating
const targetRenderDragging = `                    if (isChartDragging) {
                        // 🚀 SÜRÜKLEME ANINDA 0ms GECİKME (1:1 BİREBİR VE ANLIK İMLEÇ TAKİBİ - SIFIR TAKILMA)
                        smoothViewStart = viewStart;
                        smoothViewEnd = viewEnd;
                        if (!isAutoPriceScale) {
                            smoothMinPrice = targetMinPrice;
                            smoothMaxPrice = targetMaxPrice;
                        } else {
                            const priceLerp = 0.50;
                            smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                            smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                        }
                    }`;

const replacementRenderDragging = `                    if (isChartDragging) {
                        // 🚀 SÜRÜKLEME ANINDA 0ms GECİKME (1:1 BİREBİR VE ANLIK İMLEÇ TAKİBİ - SIFIR TAKILMA)
                        isZoomAnimating = false; // Sürüklenirken zoom animasyonu asla arkadan müdahale edemez
                        smoothViewStart = viewStart;
                        smoothViewEnd = viewEnd;
                        if (!isAutoPriceScale) {
                            smoothMinPrice = targetMinPrice;
                            smoothMaxPrice = targetMaxPrice;
                        } else {
                            const priceLerp = 0.50;
                            smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                            smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                        }
                    }`;

if (content.includes(targetRenderDragging)) {
    content = content.replace(targetRenderDragging, replacementRenderDragging);
    console.log('Updated render loop isChartDragging handler');
} else {
    console.log('targetRenderDragging not found!');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully fixed Kilitli clickability and instant zoom animation termination!');
