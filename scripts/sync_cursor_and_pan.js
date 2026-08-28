import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Ensure canvas elements inherit cursor explicitly
content = content.replace(
    /canvas \{\s*display: block;/g,
    'canvas {\n            cursor: inherit;\n            display: block;'
);

// 2. Enhance hover glow for all shape types in render()
const oldHoverGlow = `                        if (d.type === 'trendline') {
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        } else if (d.type === 'horizontal') {
                            ctx.beginPath();
                            ctx.moveTo(0, y1);
                            ctx.lineTo(w, y1);
                            ctx.stroke();
                        } else if (d.type === 'rectangle') {
                            const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                            const minY = Math.min(y1, y2), rh = Math.abs(y2 - y1);
                            ctx.strokeRect(minX, minY, rw, rh);
                        }`;

const newHoverGlow = `                        if (d.type === 'trendline') {
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                        } else if (d.type === 'ray') {
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            const dx = x2 - x1, dy = y2 - y1;
                            const scale = (w + 500) / (Math.hypot(dx, dy) || 1);
                            ctx.lineTo(x1 + dx * scale, y1 + dy * scale);
                            ctx.stroke();
                        } else if (d.type === 'horizontal') {
                            ctx.beginPath();
                            ctx.moveTo(0, y1);
                            ctx.lineTo(w, y1);
                            ctx.stroke();
                        } else if (d.type === 'horzray') {
                            ctx.beginPath();
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(w, y1);
                            ctx.stroke();
                        } else if (d.type === 'vertical') {
                            ctx.beginPath();
                            ctx.moveTo(x1, 0);
                            ctx.lineTo(x1, this.container.clientHeight);
                            ctx.stroke();
                        } else if (d.type === 'rectangle') {
                            const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                            const minY = Math.min(y1, y2), rh = Math.abs(y2 - y1);
                            ctx.strokeRect(minX, minY, rw, rh);
                        } else if (d.type === 'fibonacci') {
                            const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                            const diff = p2.price - p1.price;
                            for (const lvl of [0, 0.5, 1.0]) {
                                const ly = this.priceToY(p1.price + diff * lvl);
                                ctx.beginPath();
                                ctx.moveTo(minX, ly);
                                ctx.lineTo(maxX, ly);
                                ctx.stroke();
                            }
                        }`;

content = content.replace(oldHoverGlow, newHoverGlow);

// 3. Fix canvasContainer mousedown listener so drawingEngine manages pan exclusively
const oldCanvasMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (drawingEngine) {
                if (drawingEngine.activeTool !== 'cursor') return; // Çizim aracı etkinken grafik kaymaz
                const rect = canvasContainer.getBoundingClientRect();
                const hit = drawingEngine.hitTest(e.clientX - rect.left, e.clientY - rect.top);
                if (hit.drawing || hit.handleIdx !== -1) return; // Çizim veya tutamaç seçilirken grafik kaymaz
            }
            startPan(e.clientX, e.clientY);
        });`;

const newCanvasMouseDown = `        canvasContainer.addEventListener('mousedown', (e) => {
            // Mousedown ve Pan yönetimi tamamen drawingEngine içindeki handleMouseDown tarafından yapılır
        });`;

content = content.replace(oldCanvasMouseDown, newCanvasMouseDown);

// 4. In TradingViewDrawingEngine, set cursor on both container and canvas elements
content = content.replace(
    /this\.container\.style\.cursor = (['"][^'"]+['"]);/g,
    'this.container.style.cursor = $1; if (this.canvas) this.canvas.style.cursor = $1;'
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cursor sync, canvas inheritance and pan listener refined!');
