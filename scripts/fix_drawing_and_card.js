import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Remove the entire visible-backtest-card DOM block from HTML
content = content.replace(
    /<!-- GÖRÜNEN EKRAN KÜMÜLATİF BACKTEST ROZETİ -->[\s\S]*?<\/div>\s*<\/div>/,
    '<!-- GÖRÜNEN EKRAN KÜMÜLATİF BACKTEST ROZETİ KALDIRILDI -->'
);

// Also remove any remaining instance of visible-backtest-card HTML
content = content.replace(
    /<div class="visible-backtest-card" id="visible-backtest-card">[\s\S]*?<\/div>\s*<\/div>/,
    ''
);

// 2. Safe check in updateVisibleBacktestSummary so it doesn't fail if elements are not in DOM
content = content.replace(
    /document\.getElementById\('vbt-strat-title'\)\.innerText = [^;]*;/g,
    "const vbtTitle = document.getElementById('vbt-strat-title'); if (vbtTitle) vbtTitle.innerText = getStratTitle(activeStrategy, currentTimeframe);"
);

// 3. Fix mousedown & touchstart conflict with drawing engine
content = content.replace(
    /canvasContainer\.addEventListener\('mousedown', \(e\) => \{[\s\S]*?startPan\(e\.clientX, e\.clientY\);\s*\}\);/,
    `canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (drawingEngine) {
                if (drawingEngine.activeTool !== 'cursor') return; // Çizim aracı etkinken grafik sabit durur
                const rect = canvasContainer.getBoundingClientRect();
                const hit = drawingEngine.hitTest(e.clientX - rect.left, e.clientY - rect.top);
                if (hit.drawing || hit.handleIdx !== -1) return; // Çizim veya tutamaç seçilirken grafik sabit durur
            }
            startPan(e.clientX, e.clientY);
        });`
);

// 4. Fix touchstart conflict with drawing engine
content = content.replace(
    /canvasContainer\.addEventListener\('touchstart', \(e\) => \{[\s\S]*?if \(e\.touches\.length === 1\) \{[\s\S]*?isTouching = true;\s*isChartDragging = true;/,
    `canvasContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                if (drawingEngine && drawingEngine.activeTool !== 'cursor') {
                    // Dokunmatik ekranda çizim modu: grafiği sürükleme, çizim yap
                    return;
                }
                isTouching = true;
                isChartDragging = true;`
);

// 5. Enhance TradingViewDrawingEngine to add touch support for mobile/tablet drawing
const drawingEngineTouchCode = `
            initEvents() {
                if (!this.container) return;

                // Mouse Eventleri
                this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                window.addEventListener('keydown', (e) => this.handleKeyDown(e));

                // Touch (Tablet / Mobil) Çizim Eventleri
                this.container.addEventListener('touchstart', (e) => {
                    if (this.activeTool === 'cursor') return;
                    if (e.touches.length === 1) {
                        const t = e.touches[0];
                        this.handleMouseDown({ button: 0, clientX: t.clientX, clientY: t.clientY, stopPropagation: () => e.stopPropagation() });
                    }
                }, { passive: true });

                window.addEventListener('touchmove', (e) => {
                    if (this.activeTool === 'cursor' && !this.isDragging && !this.isDraggingHandle) return;
                    if (e.touches.length === 1) {
                        const t = e.touches[0];
                        this.handleMouseMove({ clientX: t.clientX, clientY: t.clientY });
                    }
                }, { passive: true });

                window.addEventListener('touchend', (e) => {
                    if (this.activeTool !== 'cursor' || this.isDragging || this.isDraggingHandle) {
                        this.handleMouseUp();
                    }
                }, { passive: true });
            }
`;

content = content.replace(
    /initEvents\(\) \{[\s\S]*?window\.addEventListener\('keydown', \(e\) => this\.handleKeyDown\(e\)\);\s*\}/,
    drawingEngineTouchCode.trim()
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated indikator_sablonu.html with drawing isolation and removed backtest card!');
