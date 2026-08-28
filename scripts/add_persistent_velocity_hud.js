import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add CSS for Persistent Velocity HUD
const hudCss = `
        /* ⚡ HER AN GÖRÜNÜR İVME, MAX VE EŞİK AŞIM HUD BARI */
        .persistent-velocity-hud {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: #10141f;
            border: 1px solid #2a2e39;
            border-radius: 4px;
            padding: 2px 10px;
            margin-left: 8px;
            font-family: 'SF Mono', Monaco, 'Consolas', monospace;
            font-size: 10.5px;
            color: #94a3b8;
            user-select: none;
        }
        .persistent-velocity-hud .hud-stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .persistent-velocity-hud .hud-lbl {
            color: #64748b;
            font-size: 9.5px;
            font-weight: 700;
        }
        .persistent-velocity-hud .hud-val-active {
            color: #38bdf8;
            font-weight: 800;
            min-width: 28px;
        }
        .persistent-velocity-hud .hud-val-max {
            color: #fbbf24;
            font-weight: 800;
            min-width: 28px;
        }
        .persistent-velocity-hud .hud-reset-btn {
            cursor: pointer;
            color: #64748b;
            font-size: 11px;
            font-weight: 800;
            margin-left: 2px;
            transition: color 0.15s ease;
        }
        .persistent-velocity-hud .hud-reset-btn:hover {
            color: #38bdf8;
        }
        .hud-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 1px 7px;
            border-radius: 3px;
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: 0.4px;
            transition: all 0.15s ease;
        }
        .hud-status-badge.free {
            background: rgba(56, 189, 248, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.3);
        }
        .hud-status-badge.free .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #38bdf8;
        }
        .hud-status-badge.alert-locked {
            background: rgba(239, 68, 68, 0.25);
            color: #ff4d6d;
            border: 1px solid #ef4444;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
            animation: alertPulse 0.35s infinite alternate;
        }
        .hud-status-badge.alert-locked .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ff4d6d;
            box-shadow: 0 0 6px #ff4d6d;
        }
        @keyframes alertPulse {
            0% { transform: scale(1.0); box-shadow: 0 0 4px rgba(239, 68, 68, 0.4); }
            100% { transform: scale(1.05); box-shadow: 0 0 12px rgba(239, 68, 68, 0.9); }
        }
`;

content = content.replace('</style>', hudCss + '\n    </style>');

// 2. Add Persistent HUD to bottom statusbar next to velocity-settings-wrap
const hudHtml = `
                <!-- ⚡ HER AN GÖRÜNÜR İVME, MAX VE EŞİK AŞIM HUD BARI -->
                <div class="persistent-velocity-hud" id="persistent-velocity-hud" title="Canlı Yatay İvme ($v_x$), En Yüksek Zirve İvme ($v_{max}$) ve Eşik Durumu">
                    <div class="hud-stat-item">
                        <span class="hud-lbl">İVME:</span>
                        <b id="hud-live-vx" class="hud-val-active">0.00</b> <small>px/ms</small>
                    </div>
                    <div class="hud-stat-item">
                        <span class="hud-lbl">MAX:</span>
                        <b id="hud-max-vx" class="hud-val-max" title="Zirve Hızı Sıfırla (Tıkla)">0.00</b> <small>px/ms</small>
                        <span class="hud-reset-btn" onclick="resetMaxVelocity(event)" title="Zirve İvmeyi Sıfırla">↺</span>
                    </div>
                    <div id="hud-alert-badge" class="hud-status-badge free">
                        <span class="badge-dot"></span>
                        <span id="hud-alert-text">MANUEL SERBEST</span>
                    </div>
                </div>`;

content = content.replace('</div>\n            </div>\n            <div>\n                <span id="active-strat-footer"', `</div>\n${hudHtml}\n            </div>\n            <div>\n                <span id="active-strat-footer"`);

// 3. Add maxRecordedVelocity and reset function
const jsMaxVel = `
        let maxRecordedVelocity = 0.0;
        window.resetMaxVelocity = function(e) {
            if (e) e.stopPropagation();
            maxRecordedVelocity = 0.0;
            const maxElem = document.getElementById('hud-max-vx');
            if (maxElem) maxElem.innerText = '0.00';
        };
`;

content = content.replace('let velocityThreshold =', jsMaxVel + '\n        let velocityThreshold =');

// 4. Update mousemove to update the HUD and trigger threshold exceeded alert
const oldHudUpdateInDrag = `                // Canlı İvme Göstergesini Güncelle
                const liveVxElem = document.getElementById('live-vx-val');
                const livePillElem = document.getElementById('live-status-pill');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;`;

const newHudUpdateInDrag = `                // ⚡ Canlı İvme ve Max HUD Güncelleme
                if (absVx > maxRecordedVelocity) {
                    maxRecordedVelocity = absVx;
                    const maxElem = document.getElementById('hud-max-vx');
                    if (maxElem) maxElem.innerText = maxRecordedVelocity.toFixed(2);
                }
                const liveHudVx = document.getElementById('hud-live-vx');
                if (liveHudVx) liveHudVx.innerText = absVx.toFixed(2);
                const liveVxElem = document.getElementById('live-vx-val');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;

                const alertBadge = document.getElementById('hud-alert-badge');
                const alertText = document.getElementById('hud-alert-text');
                const livePillElem = document.getElementById('live-status-pill');`;

content = content.replace(oldHudUpdateInDrag, newHudUpdateInDrag);

// Update alert trigger inside mousemove
const oldAlertBranch = `                if (isFastHorizontalSwipe) {
                    // 🌟 Kullanıcı eşiğin üzerinde hızlı yatay kaydırma yaptı -> Otomatik hizalama kilitlenir
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();

                    // 🌟 ESKİ KONUMA ASLA GERİ DÖNMEZ: Yeni baz noktası 0 olarak sabitlenir
                    origPriceOffset = 0;
                    priceOffset = 0;
                    chartDragStartY = e.clientY;

                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (dragAxisLocked !== 'horizontal' && (Math.abs(e.clientY - chartDragStartY) > 4 && absVy > absVx * 0.85 && absVy > 0.04)) {
                    // Kullanıcı kasıtlı olarak dikeyde yeni bir hareket başlattı -> Manuel moda geç
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }`;

const newAlertBranch = `                if (isFastHorizontalSwipe) {
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
                } else if (dragAxisLocked !== 'horizontal' && (Math.abs(e.clientY - chartDragStartY) > 4 && absVy > absVx * 0.85 && absVy > 0.04)) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                        alertText.innerText = 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                        alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }`;

content = content.replace(oldAlertBranch, newAlertBranch);

// When mouse is released, reset live indicator back to 0.00
const oldMouseUp = `            isChartDragging = false;
            isPriceDragging = false;`;

const newMouseUp = `            isChartDragging = false;
            isPriceDragging = false;
            const liveHudVx = document.getElementById('hud-live-vx');
            if (liveHudVx) liveHudVx.innerText = '0.00';
            const alertBadge = document.getElementById('hud-alert-badge');
            const alertText = document.getElementById('hud-alert-text');
            if (alertBadge) {
                alertBadge.className = 'hud-status-badge free';
                alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
            }`;

content = content.replace(oldMouseUp, newMouseUp);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully added persistent live velocity, max peak, and threshold exceeded alert HUD!');
