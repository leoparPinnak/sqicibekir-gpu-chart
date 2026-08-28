import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add isInsideChartViewport helper to TradingViewDrawingEngine
const oldHandleMouseDown = `            handleMouseDown(e) {
                if (e.button !== 0) return;
                if (e.target && (e.target.closest('#tv-prop-toolbar') || e.target.closest('#tv-favorite-bar') || e.target.closest('.tv-left-toolbar') || e.target.closest('.tv-flyout-menu'))) {
                    return;
                }
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                this.mouseDownStart = { x: mx, y: my, time: Date.now() };
                this.hasDragged = false;`;

const newHandleMouseDown = `            isInsideChartViewport(e) {
                if (!e || !this.container) return false;
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                if (mx < 0 || mx > rect.width || my < 0 || my > rect.height) return false;

                if (e.target && (
                    e.target.closest('#tv-prop-toolbar') ||
                    e.target.closest('#tv-favorite-bar') ||
                    e.target.closest('.tv-left-toolbar') ||
                    e.target.closest('.tv-flyout-menu') ||
                    e.target.closest('.price-axis-sidebar') ||
                    e.target.closest('.time-axis-bar') ||
                    e.target.closest('.top-toolbar') ||
                    e.target.closest('.bottom-statusbar') ||
                    e.target.closest('.hud-overlay-card') ||
                    e.target.closest('.signal-inspector-card')
                )) {
                    return false;
                }
                return true;
            }

            handleMouseDown(e) {
                if (e.button !== 0) return;
                if (!this.isInsideChartViewport(e)) {
                    this.mouseDownStart = null;
                    this.hasDragged = false;
                    return;
                }
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                this.mouseDownStart = { x: mx, y: my, time: Date.now() };
                this.hasDragged = false;`;

content = content.replace(oldHandleMouseDown, newHandleMouseDown);

// 2. Strict boundary check in handleMouseUp
const oldHandleMouseUp = `            handleMouseUp(e) {
                const rect = this.container.getBoundingClientRect();
                const mx = e ? (e.clientX - rect.left) : 0;
                const my = e ? (e.clientY - rect.top) : 0;

                // ========================================================
                // ÇİZİM ARACI SEÇİLİYKEN MOUSEUP KONTROLÜ
                // ========================================================
                if (this.activeTool !== 'cursor') {`;

const newHandleMouseUp = `            handleMouseUp(e) {
                if (!this.mouseDownStart) {
                    // Mousedown grafik dışındaydı (örn. Fiyat ekseni, Toolbar, Navbar) -> İşlem yapma!
                    this.hasDragged = false;
                    return;
                }

                const rect = this.container.getBoundingClientRect();
                const mx = e ? (e.clientX - rect.left) : -1;
                const my = e ? (e.clientY - rect.top) : -1;

                // Eğer Mouseup grafik çerçevesi dışındaysa nokta koyma!
                if (mx < 0 || mx > rect.width || my < 0 || my > rect.height) {
                    this.mouseDownStart = null;
                    this.hasDragged = false;
                    return;
                }

                // ========================================================
                // ÇİZİM ARACI SEÇİLİYKEN MOUSEUP KONTROLÜ
                // ========================================================
                if (this.activeTool !== 'cursor') {`;

content = content.replace(oldHandleMouseUp, newHandleMouseUp);

// 3. Strict coordinate clamping in handleMouseMove
const oldMouseMoveDrawing = `                // 🟢 Çizim modunda Nokta 2 fareyi canlı olarak izler (Basılı tutmaya gerek kalmadan)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    return;
                }`;

const newMouseMoveDrawing = `                // 🟢 Çizim modunda Nokta 2 fareyi canlı olarak izler (Grafik çerçevesi içinde sınırlandırılmış)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const clampedX = Math.max(0, Math.min(rect.width, mx));
                    const clampedY = Math.max(0, Math.min(rect.height, my));
                    const snapped = this.snapToOHLC(this.xToIndex(clampedX), this.yToPrice(clampedY));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    return;
                }`;

content = content.replace(oldMouseMoveDrawing, newMouseMoveDrawing);

// 4. Strict Canvas Clipping in render(ctx)
content = content.replace(
    /render\(ctx\) \{\s*if \(!ctx \|\| this\.hideAll\) return;\s*const list = \[\.\.\.this\.drawings\];/,
    `render(ctx) {
                if (!ctx || this.hideAll) return;

                const cssW = this.container.clientWidth;
                const cssH = this.container.clientHeight;

                // 🛡️ ÇİZİM SINIRI KORUMASI: Çizimlerin fiyat ekseni veya toolbar dışına taşmasını engelle
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, cssW, cssH);
                ctx.clip();

                const list = [...this.drawings];`
);

// Close the clip save/restore cleanly at the end of render
content = content.replace(
    /this\.renderHandles\(ctx, d\);\s*\}\s*ctx\.restore\(\);\s*\}\s*\}\s*\}/,
    `this.renderHandles(ctx, d);\n                    }\n                    ctx.restore();\n                }\n                ctx.restore(); // Close canvas clipping\n            }`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Strict chart boundary verification and canvas clipping applied successfully!');
