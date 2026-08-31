import fs from 'fs';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Bottom status bar with clean [ Serbest ] [ Kilitli ] and [ SPACE: SIGDIR ]
    const oldBottomBarStart = '<div class="bottom-statusbar">';
    const oldBottomBarEnd = '<!-- ==================== VERTEX SHADER ==================== -->';
    const bStart = content.indexOf(oldBottomBarStart);
    const bEnd = content.indexOf(oldBottomBarEnd, bStart);

    if (bStart !== -1 && bEnd !== -1) {
        const cleanBottomBar = `<div class="bottom-statusbar">
            <div class="status-left">
                <span class="status-badge live" style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 6px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;"></span>
                    <span>CANLI</span>
                </span>

                <div class="scale-mode-segmented-group" id="scale-mode-group">
                    <button class="scale-mode-btn active" id="mode-btn-free" onclick="setScaleMode('free', event)" title="Serbest (Manuel) Mod">Serbest</button>
                    <button class="scale-mode-btn" id="mode-btn-locked" onclick="setScaleMode('locked', event)" title="Kilitli (Otomatik Mum Takibi) Mod">Kilitli</button>
                </div>

                <button class="fit-all-btn" onclick="triggerSpaceAutoFit()" style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 4px; cursor: pointer; transition: all 0.15s ease;" title="Görünür mumları dikeyde yumuşakça sığdır [Space]">SPACE: SIGDIR</button>
            </div>

            <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: #64748b; font-family: monospace;">
                <span>% log</span>
                <span>UTC+3 (Istanbul)</span>
            </div>
        </div>

    </div>

    `;
        content = content.substring(0, bStart) + cleanBottomBar + content.substring(bEnd);
    }

    // 2. setScaleMode function update
    const setScaleModeRegex = /window\.setScaleMode\s*=\s*function\(mode,\s*e\)\s*\{[\s\S]*?updateScaleModeUI\(\);[\s\S]*?\};/;
    const cleanSetScaleMode = `window.setScaleMode = function(mode, e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (mode !== 'locked') mode = 'free';
            scaleMode = mode;
            window.scaleMode = scaleMode;
            localStorage.setItem('tradechart_scale_mode', scaleMode);

            if (scaleMode === 'locked') {
                isAutoPriceScale = true;
                triggerSpaceAutoFit();
            } else {
                isAutoPriceScale = false;
                isZoomAnimating = false;
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

    if (setScaleModeRegex.test(content)) {
        content = content.replace(setScaleModeRegex, cleanSetScaleMode);
    }

    // 3. updateScaleModeUI update
    const updateScaleModeUIRegex = /function\s+updateScaleModeUI\(\)\s*\{[\s\S]*?\}/;
    const cleanUpdateScaleModeUI = `function updateScaleModeUI() {
            const btnFree = document.getElementById('mode-btn-free');
            const btnLocked = document.getElementById('mode-btn-locked');
            if (btnFree) btnFree.className = 'scale-mode-btn' + (scaleMode === 'free' ? ' active' : '');
            if (btnLocked) btnLocked.className = 'scale-mode-btn' + (scaleMode === 'locked' ? ' active' : '');
        }`;
    if (updateScaleModeUIRegex.test(content)) {
        content = content.replace(updateScaleModeUIRegex, cleanUpdateScaleModeUI);
    }

    // 4. Wheel handler: DO NOT force isAutoPriceScale = true in free mode!
    const wheelTarget = `            // Zoom esnasında fiyat ekseni serbest modda bile olsa dikeyde görünür mumları kadrajda tutar
            isAutoPriceScale = true;
            priceOffset = 0;
            origPriceOffset = 0;
            priceScaleFactor = 1.0;
            updateOtoButtonState();

            // Zoom hareketi bittiğinde (150ms sonra) serbest moddaysa geri bırak
            wheelZoomTimeout = setTimeout(() => {
                isWheelZooming = false;
                if (scaleMode === 'free') {
                    isAutoPriceScale = false;
                    manualBaseMinPrice = smoothMinPrice;
                    manualBaseMaxPrice = smoothMaxPrice;
                    updateOtoButtonState();
                }
            }, 150);`;

    const cleanWheelBehavior = `            // Serbest modda dikey eksen serbest kalır; Kilitli modda otomatik kadrajlanır
            if (scaleMode === 'locked') {
                isAutoPriceScale = true;
                priceOffset = 0;
                origPriceOffset = 0;
            } else {
                isAutoPriceScale = false;
            }
            updateOtoButtonState();

            wheelZoomTimeout = setTimeout(() => {
                isWheelZooming = false;
            }, 100);`;

    content = content.replace(wheelTarget, cleanWheelBehavior);

    // 5. Instantly kill all animations on mousedown / pointerdown
    const startPanTarget = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            isZoomAnimating = false; // SÜRÜKLEME BAŞLADIĞI AN ZOOM ANİMASYONUNU ANINDA KES!`;

    const cleanStartPan = `        function startPan(clientX, clientY) {
            isChartDragging = true;
            isZoomAnimating = false;
            window.isZoomAnimating = false;
            isWheelZooming = false;
            if (wheelZoomTimeout) { clearTimeout(wheelZoomTimeout); wheelZoomTimeout = null; }`;

    content = content.replace(startPanTarget, cleanStartPan);

    // Canvas mousedown instant cancel
    const canvasMouseDownTarget = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // CLICK TUŞUNA BASILDIĞI AN ZOOM ANİMASYONUNU ANINDA DURDUR!
                isZoomAnimating = false;`;

    const cleanCanvasMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                // TIKLANDIĞI AN ANİMASYONU VE OTOMATİK ÖLÇEKLENDİRMEYİ ANINDA KES!
                isZoomAnimating = false;
                window.isZoomAnimating = false;
                isWheelZooming = false;
                if (wheelZoomTimeout) { clearTimeout(wheelZoomTimeout); wheelZoomTimeout = null; }

                if (scaleMode === 'free') {
                    isAutoPriceScale = false;
                    if (smoothMinPrice && isFinite(smoothMinPrice) && smoothMinPrice !== 0) {
                        manualBaseMinPrice = smoothMinPrice;
                        manualBaseMaxPrice = smoothMaxPrice;
                    }
                    priceOffset = 0;
                    origPriceOffset = 0;
                }
                updateOtoButtonState();
            }`;

    content = content.replace(canvasMouseDownTarget, cleanCanvasMouseDown);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleanly updated ${filePath}`);
}

updateFile('indikator_sablonu.html');
updateFile('index.html');
console.log('ALL SCALE MODE AND INSTANT CANCEL LOGIC FIXED!');
