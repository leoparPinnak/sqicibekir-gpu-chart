import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Normalize line endings to \n temporarily for reliable regex/matching
const isCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Add HTML UI component
const targetHud = `                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Aç/Kapat)">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">🔒 OTO ÖLÇEK: AÇIK</span>
                </div>`;

const replacementHud = `                <!-- 🌟 CANLI OTO / MANUEL KİLİT GÖSTERGE ROZETİ -->
                <div class="scale-live-indicator-badge auto-active" id="scale-live-indicator" onclick="toggleAutoPriceScale(event)" title="Otomatik Ölçekleme Durumu (Tıklayarak Aç/Kapat)">
                    <span class="scale-indicator-dot" id="scale-dot"></span>
                    <span id="scale-status-text">🔒 OTO ÖLÇEK: AÇIK</span>
                </div>

                <!-- ⏱️ CANLI ZOOM GEÇİŞ SÜRESİ KONTROLÜ (0.00s - 1.00s) -->
                <div class="velocity-settings-wrap" id="zoom-duration-wrap">
                    <button class="hud-trigger-btn" onclick="toggleZoomDurationPopover(event)" title="Zoom Geçiş Süresini Ayarla (0.0 - 1.0 sn)">
                        <span>⏱️ Süre:</span>
                        <b id="current-zoom-duration-label" style="color: #38bdf8;">0.40s</b>
                    </button>
                    <div class="velocity-popover" id="zoom-duration-popover" style="min-width: 250px;">
                        <div class="popover-title">
                            <span>⏱️ Zoom Geçiş Süresi</span>
                            <b id="zoom-duration-slider-val" style="color: #38bdf8;">0.40 sn</b>
                        </div>
                        <input type="range" id="zoom-duration-slider" min="0" max="1" step="0.05" value="0.40" oninput="updateZoomDuration(this.value)">
                        <div class="preset-buttons">
                            <button class="preset-btn" onclick="setZoomDurationPreset(0.00)">0.0s (Anında)</button>
                            <button class="preset-btn" onclick="setZoomDurationPreset(0.20)">0.2s (Hızlı)</button>
                            <button class="preset-btn" onclick="setZoomDurationPreset(0.40)">0.4s (Dengeli)</button>
                            <button class="preset-btn" onclick="setZoomDurationPreset(0.70)">0.7s (Sinematik)</button>
                            <button class="preset-btn" onclick="setZoomDurationPreset(1.00)">1.0s (Yavaş)</button>
                        </div>
                    </div>
                </div>`;

if (content.includes(targetHud)) {
    content = content.replace(targetHud, replacementHud);
    console.log('Replaced targetHud successfully');
} else {
    console.log('targetHud not found!');
}

// 2. Add JavaScript state
const targetJsState = `        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;`;

const replacementJsState = `        let isPriceDragging = false;
        let priceDragStartY = 0;
        let priceScaleFactor = 1.0;

        let zoomDurationSeconds = parseFloat(localStorage.getItem('tradechart_zoom_duration') || '0.40');
        window.zoomDurationSeconds = zoomDurationSeconds;
        let zoomAnimStartTime = 0;
        let zoomAnimStartViewStart = 0;
        let zoomAnimStartViewEnd = 0;
        let zoomAnimStartMinPrice = 0;
        let zoomAnimStartMaxPrice = 0;
        let isZoomAnimating = false;

        function triggerZoomAnimation() {
            if (zoomDurationSeconds <= 0.001) {
                smoothViewStart = viewStart;
                smoothViewEnd = viewEnd;
                smoothMinPrice = targetMinPrice;
                smoothMaxPrice = targetMaxPrice;
                isZoomAnimating = false;
                return;
            }
            zoomAnimStartTime = performance.now();
            zoomAnimStartViewStart = smoothViewStart;
            zoomAnimStartViewEnd = smoothViewEnd;
            zoomAnimStartMinPrice = smoothMinPrice;
            zoomAnimStartMaxPrice = smoothMaxPrice;
            isZoomAnimating = true;
        }

        window.updateZoomDuration = function(val) {
            zoomDurationSeconds = Math.max(0, Math.min(1.0, parseFloat(val)));
            window.zoomDurationSeconds = zoomDurationSeconds;
            localStorage.setItem('tradechart_zoom_duration', zoomDurationSeconds);
            const lbl = document.getElementById('current-zoom-duration-label');
            const slbl = document.getElementById('zoom-duration-slider-val');
            const slider = document.getElementById('zoom-duration-slider');
            if (lbl) lbl.innerText = zoomDurationSeconds.toFixed(2) + 's';
            if (slbl) slbl.innerText = zoomDurationSeconds.toFixed(2) + ' sn';
            if (slider) slider.value = zoomDurationSeconds;
        };

        window.setZoomDurationPreset = function(val) {
            updateZoomDuration(val);
        };

        window.toggleZoomDurationPopover = function(e) {
            if (e) e.stopPropagation();
            const pop = document.getElementById('zoom-duration-popover');
            if (pop) pop.classList.toggle('open');
        };`;

if (content.includes(targetJsState)) {
    content = content.replace(targetJsState, replacementJsState);
    console.log('Replaced targetJsState successfully');
} else {
    console.log('targetJsState not found!');
}

// 3. Update wheel event to triggerZoomAnimation()
const targetWheel = `            viewStart = nStart;
            viewEnd = nEnd;

            updateVisibleBacktestSummary();
        }, { passive: false });`;

const replacementWheel = `            viewStart = nStart;
            viewEnd = nEnd;

            triggerZoomAnimation();
            updateVisibleBacktestSummary();
        }, { passive: false });`;

if (content.includes(targetWheel)) {
    content = content.replace(targetWheel, replacementWheel);
    console.log('Replaced targetWheel successfully');
} else {
    console.log('targetWheel not found!');
}

// 4. Update render loop LERP
const targetRender = `                    } else {
                        // 🎥 SİNEMATİK KAMERA ODAKLI İPEKSİ ZOOM ANİMASYONU (Smooth Camera Zoom Easing)
                        // İmlece doğru yumuşakça süzülen kamera: Ekrandan çıkan mumlar yavaşça kayar,
                        // büyüyen mumlar ipeksi bir akıcılıkla genişler, hiçbir ani sıçrama veya kopma yaşanmaz.
                        const cameraAlpha = 0.22;
                        smoothViewStart += (viewStart - smoothViewStart) * cameraAlpha;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * cameraAlpha;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * cameraAlpha;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * cameraAlpha;
                    }`;

const replacementRender = `                    } else if (isZoomAnimating && zoomDurationSeconds > 0.001) {
                        // ⏱️ ZAMAN TABANLI VE DOĞAL LOGARİTMİK SÜRE MOTORU (0.0s - 1.0s Arası Ayarlanabilir)
                        const elapsed = (now - zoomAnimStartTime) / 1000;
                        const progress = Math.min(1.0, Math.max(0.0, elapsed / zoomDurationSeconds));
                        
                        // İpeksi Yumuşak Easing: easeOutCubic
                        const ease = 1 - Math.pow(1 - progress, 3);

                        // 1. Yatay Zaman Ekseni
                        smoothViewStart = zoomAnimStartViewStart + (viewStart - zoomAnimStartViewStart) * ease;
                        smoothViewEnd = zoomAnimStartViewEnd + (viewEnd - zoomAnimStartViewEnd) * ease;

                        // 2. Dikey Fiyat Ekseni: Doğal Logaritmik (ln) Ortalama Mum Boyutu Geçişi
                        const startSpan = Math.max(0.0001, zoomAnimStartMaxPrice - zoomAnimStartMinPrice);
                        const endSpan = Math.max(0.0001, targetMaxPrice - targetMinPrice);
                        const startMid = (zoomAnimStartMinPrice + zoomAnimStartMaxPrice) / 2;
                        const endMid = (targetMinPrice + targetMaxPrice) / 2;

                        const curMid = startMid + (endMid - startMid) * ease;
                        const logStartSpan = Math.log(startSpan);
                        const logEndSpan = Math.log(endSpan);
                        const curLogSpan = logStartSpan + (logEndSpan - logStartSpan) * ease;
                        const curSpan = Math.exp(curLogSpan);

                        smoothMinPrice = curMid - (curSpan / 2);
                        smoothMaxPrice = curMid + (curSpan / 2);

                        if (progress >= 1.0) {
                            isZoomAnimating = false;
                        }
                    } else {
                        // Durgun durum hafif LERP
                        const alpha = 0.25;
                        smoothViewStart += (viewStart - smoothViewStart) * alpha;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * alpha;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * alpha;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * alpha;
                    }`;

if (content.includes(targetRender)) {
    content = content.replace(targetRender, replacementRender);
    console.log('Replaced targetRender successfully');
} else {
    console.log('targetRender not found!');
}

// Restore CRLF if needed
if (isCrlf) {
    content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Done!');
