import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add CSS for Velocity Settings Popover
const popoverCss = `
        /* ⚙️ İVME & HASSASİYET KALİBRASYON POPOVER */
        .velocity-settings-wrap {
            position: relative;
            display: inline-block;
        }
        .velocity-settings-popover {
            display: none;
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 270px;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 8px;
            padding: 12px 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.75);
            z-index: 100;
            font-size: 11px;
            color: #94a3b8;
        }
        .velocity-settings-popover.open {
            display: block;
            animation: fadeIn 0.15s ease-out;
        }
        .popover-title {
            font-weight: 800;
            color: #f1f5f9;
            font-size: 11px;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #2a2e39;
            padding-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .popover-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        .preset-row {
            display: flex;
            gap: 4px;
            margin-bottom: 10px;
        }
        .preset-btn {
            flex: 1;
            background: #131722;
            border: 1px solid #2a2e39;
            color: #cbd5e1;
            border-radius: 4px;
            padding: 4px 2px;
            font-size: 9.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .preset-btn:hover {
            background: #2a2e39;
            color: #38bdf8;
            border-color: #38bdf8;
        }
        .live-velocity-meter {
            background: #131722;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .status-pill {
            display: block;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .status-pill.free {
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid #38bdf8;
        }
        .status-pill.locked {
            background: rgba(16, 185, 129, 0.20);
            color: #10b981;
            border: 1px solid #10b981;
        }
`;

content = content.replace('/* CSS BAŞLANGICI */', '/* CSS BAŞLANGICI */' + popoverCss);

// 2. Add Popover HTML to indicator-nav
const popoverHtml = `
                <!-- ⚙️ İVME VE HASSASİYET KALİBRASYONU -->
                <div class="velocity-settings-wrap">
                    <button class="ind-btn" id="btn-velocity-settings" onclick="toggleVelocitySettings(event)" title="Dikey/Yatay İvme ve Otomatik Ölçekleme Eşik Ayarı">
                        ⚙️ İvme: <span id="current-threshold-label" style="color: #38bdf8; font-weight: 800;">0.80</span>
                    </button>
                    <div class="velocity-settings-popover" id="velocity-popover">
                        <div class="popover-title">
                            <span>🎯 İVME & OTO-ÖLÇEK AYARI</span>
                            <span style="font-size: 10px; color: #64748b; cursor: pointer;" onclick="toggleVelocitySettings(event)">✕</span>
                        </div>
                        <div class="popover-row">
                            <span>Tetikleme Eşiği:</span>
                            <span id="slider-val" style="color: #38bdf8; font-weight: 800;">0.80 px/ms</span>
                        </div>
                        <input type="range" id="velocity-threshold-slider" min="0.10" max="3.00" step="0.05" value="0.80" oninput="updateVelocityThreshold(this.value)" style="width: 100%; margin: 8px 0; accent-color: #38bdf8; cursor: pointer;">
                        <div class="preset-row">
                            <button class="preset-btn" onclick="setThresholdPreset(0.35)">Hassas (0.35)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(0.80)">Dengeli (0.80)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(1.40)">Hızlı (1.40)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(2.20)">Katı (2.20)</button>
                        </div>
                        <div class="live-velocity-meter">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Anlık İvme ($v_x$):</span>
                                <b id="live-vx-val" style="color: #10b981; font-family: monospace;">0.00 px/ms</b>
                            </div>
                            <div id="live-status-pill" class="status-pill free">MANUEL SERBEST</div>
                        </div>
                    </div>
                </div>
`;

content = content.replace(
    /<button class="ind-btn active" id="btn-bg" onclick="toggleLayer\('bg'\)">[\s\S]*?<\/button>\s*<\/div>/,
    `<button class="ind-btn active" id="btn-bg" onclick="toggleLayer('bg')">\n                    <span class="ind-dot" style="background: #a855f7;"></span> Rejim\n                </button>${popoverHtml}</div>`
);

// 3. Add JS Calibration Logic and update mousemove
const jsVelocityBlock = `
        // 🚀 İVME EŞİK VE KALİBRASYON YÖNETİMİ
        let velocityThreshold = parseFloat(localStorage.getItem('tradechart_velocity_threshold')) || 0.80;

        window.toggleVelocitySettings = function(e) {
            if (e) e.stopPropagation();
            const pop = document.getElementById('velocity-popover');
            if (pop) pop.classList.toggle('open');
        };

        window.updateVelocityThreshold = function(val) {
            velocityThreshold = parseFloat(val);
            localStorage.setItem('tradechart_velocity_threshold', velocityThreshold);
            document.getElementById('current-threshold-label').innerText = velocityThreshold.toFixed(2);
            document.getElementById('slider-val').innerText = \`\${velocityThreshold.toFixed(2)} px/ms\`;
            document.getElementById('velocity-threshold-slider').value = velocityThreshold;
        };

        window.setThresholdPreset = function(val) {
            updateVelocityThreshold(val);
        };

        document.addEventListener('click', (e) => {
            const wrap = e.target.closest('.velocity-settings-wrap');
            if (!wrap) {
                const pop = document.getElementById('velocity-popover');
                if (pop) pop.classList.remove('open');
            }
        });
`;

content = content.replace('let isPriceDragging = false;', jsVelocityBlock + '\n        let isPriceDragging = false;');

// 4. Update mousemove to use dynamic velocityThreshold and update live meter
const oldMouseMoveVel = `                if (absVx >= 0.28 && absVx >= absVy * 1.15) {
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();
                } else if (absVy >= 0.28 && absVy > absVx * 1.3) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                }`;

const newMouseMoveVel = `                // Canlı İvme Göstergesini Güncelle
                const liveVxElem = document.getElementById('live-vx-val');
                const livePillElem = document.getElementById('live-status-pill');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;

                // 🎯 KULLANICI AYARLI İVMEYE GÖRE OTOMATİK HİZALAMA
                if (absVx >= velocityThreshold && absVx >= absVy * 1.15) {
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (absVy >= velocityThreshold && absVy > absVx * 1.3) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (livePillElem && !isAutoPriceScale) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                }`;

content = content.replace(oldMouseMoveVel, newMouseMoveVel);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully created interactive Velocity Calibration widget and dynamic threshold engine!');
