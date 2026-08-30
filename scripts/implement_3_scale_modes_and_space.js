import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add CSS for 3-way segmented scale mode group
const targetCss = `        .scale-live-indicator-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
            margin-left: 8px;
        }`;

const replacementCss = `        /* 🎯 3 KADEMELİ ÖLÇEKLEME MODU SEÇİCİ (SERBEST | İVMELİ | KİLİTLİ) */
        .scale-mode-segmented-group {
            display: inline-flex;
            align-items: center;
            background: #10141f;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 2px;
            gap: 2px;
            margin-left: 8px;
            user-select: none;
        }
        .scale-mode-btn {
            background: transparent;
            border: 1px solid transparent;
            color: #94a3b8;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10.5px;
            font-weight: 700;
            font-family: 'SF Pro Text', 'Segoe UI', sans-serif;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.15s ease;
        }
        .scale-mode-btn:hover {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.05);
        }
        .scale-mode-btn.active.mode-free {
            background: rgba(245, 158, 11, 0.2);
            border-color: #f59e0b;
            color: #fbbf24;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
        }
        .scale-mode-btn.active.mode-velocity {
            background: rgba(56, 189, 248, 0.2);
            border-color: #38bdf8;
            color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
        }
        .scale-mode-btn.active.mode-locked {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10b981;
            color: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
        }
        .mode-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }
        .dot-free { background: #f59e0b; }
        .dot-velocity { background: #38bdf8; }
        .dot-locked { background: #10b981; }

        .scale-live-indicator-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
            margin-left: 8px;
        }`;

if (content.includes(targetCss)) {
    content = content.replace(targetCss, replacementCss);
    console.log('Added CSS for scale-mode-segmented-group');
} else {
    // If not found directly, insert before persistent-velocity-hud CSS
    content = content.replace('.persistent-velocity-hud {', `${replacementCss}\n\n        .persistent-velocity-hud {`);
    console.log('Inserted CSS before persistent-velocity-hud');
}

// 2. Add 3-mode segmented UI component in bottom statusbar
const targetHud = `                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Aç/Kapat)">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">🔒 OTO ÖLÇEK: AÇIK</span>
                </div>`;

const replacementHud = `                <!-- 🎯 3 KADEMELİ ÖLÇEKLEME MODU SEÇİCİ (SERBEST | İVMELİ | KİLİTLİ) -->
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

if (content.includes(targetHud)) {
    content = content.replace(targetHud, replacementHud);
    console.log('Updated HTML HUD with 3-mode segmented group');
} else {
    console.log('targetHud not found!');
}

// 3. Add JS state, functions, and Space key listener
const targetJsFunctions = `        window.resetPriceScale = function() {
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
        };`;

const replacementJsFunctions = `        let scaleMode = localStorage.getItem('tradechart_scale_mode') || 'velocity';
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
        };

        function updateScaleModeUI() {
            ['free', 'velocity', 'locked'].forEach(m => {
                const btn = document.getElementById('mode-btn-' + m);
                if (btn) {
                    btn.className = 'scale-mode-btn' + (scaleMode === m ? ' active mode-' + m : '');
                }
            });
        }

        window.triggerSpaceAutoFit = function() {
            priceOffset = 0;
            origPriceOffset = 0;

            let minP = Infinity, maxP = -Infinity;
            const sI = Math.max(0, Math.floor(viewStart));
            const eI = Math.min(totalCandles, Math.ceil(viewEnd));
            for (let i = sI; i < eI; i++) {
                const c = candleDataBase[i];
                if (c) {
                    if (c.low < minP) minP = c.low;
                    if (c.high > maxP) maxP = c.high;
                }
            }

            if (isFinite(minP) && isFinite(maxP) && minP < maxP) {
                const pad = (maxP - minP) * 0.10;
                manualBaseMinPrice = minP - pad;
                manualBaseMaxPrice = maxP + pad;

                if (scaleMode === 'free') {
                    isAutoPriceScale = false;
                } else {
                    isAutoPriceScale = true;
                }

                triggerZoomAnimation();
                updateOtoButtonState();
                updateVisibleBacktestSummary();
            }
        };

        // ⌨️ SPACE (BOŞLUK) TUŞU İLE OTOMATİK ÖLÇEKLENDİRME VE SIĞDIRMA
        window.addEventListener('keydown', (e) => {
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target && e.target.isContentEditable)) {
                return;
            }

            if (e.code === 'Space' || e.key === ' ' || e.keyCode === 32) {
                e.preventDefault();
                triggerSpaceAutoFit();
            }
        });

        window.resetPriceScale = function() {
            priceScaleFactor = 1.0;
            priceOffset = 0;
            origPriceOffset = 0;
            if (scaleMode === 'free') {
                isAutoPriceScale = false;
            } else {
                isAutoPriceScale = true;
            }
            dragAxisLocked = null;
            triggerSpaceAutoFit();
        };

        window.toggleAutoPriceScale = function(e) {
            if (e) e.stopPropagation();
            if (scaleMode === 'locked') {
                setScaleMode('free');
            } else if (scaleMode === 'free') {
                setScaleMode('velocity');
            } else {
                setScaleMode('locked');
            }
        };`;

if (content.includes(targetJsFunctions)) {
    content = content.replace(targetJsFunctions, replacementJsFunctions);
    console.log('Updated scale functions and added Space key listener');
} else {
    console.log('targetJsFunctions not found!');
}

// 4. Update mousedown to respect scaleMode
const targetMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
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

const replacementMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
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

if (content.includes(targetMouseDown)) {
    content = content.replace(targetMouseDown, replacementMouseDown);
    console.log('Updated mousedown handler for scaleMode');
} else {
    console.log('targetMouseDown not found!');
}

// 5. Update mousemove to respect scaleMode
const targetMouseMoveScale = `                // 🎯 İVMEYE VE YÖNE GÖRE DİNAMİK KİLİTLEME VE ÇÖZME (Continuous Gesture Dynamic Axis Lock & Unlock):
                const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.25);

                if (isFastHorizontalSwipe) {
                    // ⚡ EŞİK AŞILDI & OTO KİLİT AKTİF
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();

                    origPriceOffset = 0;
                    priceOffset = 0;
                    chartDragStartY = e.clientY;

                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge alert-locked';
                        alertText.innerText = \`⚡ EŞİK AŞILDI (\${absVx.toFixed(2)} ≥ \${velocityThreshold.toFixed(2)})\`;
                    }
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else {
                    // 🔓 HIZ EŞİK ALTINA İNDİĞİNDE:
                    // Kullanıcı fareyi bırakmadan basılı tutmaya devam etse bile, hız eşiğin altına indiği an
                    // dikey hareket algılanır algılanmaz kilit anında çözülür ve serbest dikey kaydırmaya izin verilir!
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                    }

                    const isVerticalIntent = Math.abs(e.clientY - chartDragStartY) > 3 || (absVy > 0.03 && absVy > absVx * 0.5);

                    if (isVerticalIntent && isAutoPriceScale) {
                        // OTO KİLİTTEN MANUEL DİKEY SÜRÜKLEMEYE KESİNTİSİZ GEÇİŞ
                        isAutoPriceScale = false;
                        dragAxisLocked = 'vertical';
                        updateOtoButtonState();
                        origPriceOffset = priceOffset;
                        chartDragStartY = e.clientY;
                    }

                    if (alertText) {
                        alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }`;

const replacementMouseMoveScale = `                // 🎯 3 KADEMELİ MODA GÖRE EKSEN KİLİTLEME YÖNETİMİ:
                if (scaleMode === 'locked') {
                    // 🔒 KİLİTLİ MOD: Daima oto ölçekleme aktif
                    isAutoPriceScale = true;
                    priceOffset = 0;
                    origPriceOffset = 0;
                    if (alertBadge) alertBadge.className = 'hud-status-badge alert-locked';
                    if (alertText) alertText.innerText = '🔒 SABİT KİLİTLİ';
                } else if (scaleMode === 'free') {
                    // 🔓 SERBEST MOD: İvme eşiği aşılsa bile asla oto kilide geçmez
                    isAutoPriceScale = false;
                    if (alertBadge) alertBadge.className = 'hud-status-badge free';
                    if (alertText) alertText.innerText = '🔓 SERBEST (MANUEL)';
                } else {
                    // ⚡ İVMELİ (AKILLI) MOD: Yatayda hızlı kaydırınca kilitlenir, dikeyde serbest kalır
                    const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.25);

                    if (isFastHorizontalSwipe) {
                        dragAxisLocked = 'horizontal';
                        isAutoPriceScale = true;
                        updateOtoButtonState();
                        origPriceOffset = 0;
                        priceOffset = 0;
                        chartDragStartY = e.clientY;

                        if (alertBadge) {
                            alertBadge.className = 'hud-status-badge alert-locked';
                            alertText.innerText = \`⚡ EŞİK AŞILDI (\${absVx.toFixed(2)} ≥ \${velocityThreshold.toFixed(2)})\`;
                        }
                        if (livePillElem) {
                            livePillElem.innerText = 'OTO KİLİTLENDİ';
                            livePillElem.className = 'status-pill locked';
                        }
                    } else {
                        if (alertBadge) alertBadge.className = 'hud-status-badge free';
                        const isVerticalIntent = Math.abs(e.clientY - chartDragStartY) > 3 || (absVy > 0.03 && absVy > absVx * 0.5);

                        if (isVerticalIntent && isAutoPriceScale) {
                            isAutoPriceScale = false;
                            dragAxisLocked = 'vertical';
                            updateOtoButtonState();
                            origPriceOffset = priceOffset;
                            chartDragStartY = e.clientY;
                        }

                        if (alertText) {
                            alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
                        }
                        if (livePillElem) {
                            livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                            livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                        }
                    }
                }`;

if (content.includes(targetMouseMoveScale)) {
    content = content.replace(targetMouseMoveScale, replacementMouseMoveScale);
    console.log('Updated mousemove handling for 3 scale modes');
} else {
    console.log('targetMouseMoveScale not found!');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully implemented 3 scale modes and Space auto-fit engine!');
