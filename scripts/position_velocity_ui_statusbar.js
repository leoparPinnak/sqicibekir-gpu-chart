import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Remove it from top navbar if present
content = content.replace(/<!-- ⚙️ İVME VE HASSASİYET KALİBRASYONU -->[\s\S]*?<\/div>\s*<\/div>/m, '');

// Place it cleanly in the bottom statusbar next to SIĞDIR
const bottomStatusTarget = `<button class="fit-all-btn" onclick="fitAllCandles()" title="Tüm geçmiş mumları ekrana tam sığdır">SIĞDIR</button>`;

const newBottomStatusWithVelocity = `<button class="fit-all-btn" onclick="fitAllCandles()" title="Tüm geçmiş mumları ekrana tam sığdır">SIĞDIR</button>
                <div class="velocity-settings-wrap" style="position: relative; display: inline-block; margin-left: 6px;">
                    <button class="fit-all-btn" id="btn-velocity-settings" onclick="toggleVelocitySettings(event)" title="Dikey/Yatay İvme ve Otomatik Ölçekleme Eşik Ayarı" style="background: rgba(56, 189, 248, 0.2); border-color: #38bdf8; font-weight: 700;">
                        ⚙️ İvme: <span id="current-threshold-label" style="font-weight: 800; color: #ffffff;">0.80</span> px/ms
                    </button>
                    <div class="velocity-settings-popover" id="velocity-popover" style="bottom: calc(100% + 8px); top: auto; left: 0; right: auto;">
                        <div class="popover-title">
                            <span>🎯 İVME & OTO-ÖLÇEK AYARI</span>
                            <span style="font-size: 11px; color: #94a3b8; cursor: pointer; padding: 0 4px;" onclick="toggleVelocitySettings(event)">✕</span>
                        </div>
                        <div class="popover-row">
                            <span>Tetikleme Eşiği:</span>
                            <span id="slider-val" style="color: #38bdf8; font-weight: 800;">0.80 px/ms</span>
                        </div>
                        <input type="range" id="velocity-threshold-slider" min="0.10" max="3.50" step="0.05" value="0.80" oninput="updateVelocityThreshold(this.value)" style="width: 100%; margin: 8px 0; accent-color: #38bdf8; cursor: pointer;">
                        <div class="preset-row">
                            <button class="preset-btn" onclick="setThresholdPreset(0.35)">Hassas (0.35)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(0.80)">Dengeli (0.80)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(1.40)">Hızlı (1.40)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(2.20)">Katı (2.20)</button>
                        </div>
                        <div class="live-velocity-meter">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>Anlık İvme ($v_x$):</span>
                                <b id="live-vx-val" style="color: #10b981; font-family: monospace;">0.00 px/ms</b>
                            </div>
                            <div id="live-status-pill" class="status-pill free">MANUEL SERBEST</div>
                        </div>
                    </div>
                </div>`;

content = content.replace(bottomStatusTarget, newBottomStatusWithVelocity);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully positioned Velocity Calibration widget in bottom statusbar!');
