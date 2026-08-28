import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add hovered properties in TradingViewDrawingEngine constructor
content = content.replace(
    /this\.defaultStyle = \{ color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0\.2 \};\s*this\.drawings = \[\];/,
    `this.defaultStyle = { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 };
                this.drawings = [];
                this.hoveredDrawing = null;
                this.hoveredHandleIdx = -1;`
);

// 2. Enhance handleMouseMove with interactive cursor state updates
const oldMouseMoveLogic = `                if (this.drawingInProgress) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    return;
                }

                if (this.isDraggingHandle && this.selectedDrawing) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.selectedDrawing.points[this.activeHandleIndex] = { cIdx: snapped.cIdx, price: snapped.price };
                    updatePropertyToolbar(this.selectedDrawing);
                    return;
                }

                if (this.isDragging && this.selectedDrawing && this.dragOriginalPoints.length > 0) {
                    const dIdx = this.xToIndex(mx) - this.xToIndex(this.dragStart.x);
                    const dPrice = this.yToPrice(my) - this.yToPrice(this.dragStart.y);

                    for (let i = 0; i < this.selectedDrawing.points.length; i++) {
                        this.selectedDrawing.points[i].cIdx = this.dragOriginalPoints[i].cIdx + dIdx;
                        this.selectedDrawing.points[i].price = this.dragOriginalPoints[i].price + dPrice;
                    }
                    updatePropertyToolbar(this.selectedDrawing);
                }`;

const newMouseMoveLogic = `                if (this.drawingInProgress) {
                    this.container.style.cursor = 'crosshair';
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    return;
                }

                if (this.isDraggingHandle && this.selectedDrawing) {
                    this.container.style.cursor = 'crosshair';
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.selectedDrawing.points[this.activeHandleIndex] = { cIdx: snapped.cIdx, price: snapped.price };
                    updatePropertyToolbar(this.selectedDrawing);
                    return;
                }

                if (this.isDragging && this.selectedDrawing && this.dragOriginalPoints.length > 0) {
                    this.container.style.cursor = 'grabbing';
                    const dIdx = this.xToIndex(mx) - this.xToIndex(this.dragStart.x);
                    const dPrice = this.yToPrice(my) - this.yToPrice(this.dragStart.y);

                    for (let i = 0; i < this.selectedDrawing.points.length; i++) {
                        this.selectedDrawing.points[i].cIdx = this.dragOriginalPoints[i].cIdx + dIdx;
                        this.selectedDrawing.points[i].price = this.dragOriginalPoints[i].price + dPrice;
                    }
                    updatePropertyToolbar(this.selectedDrawing);
                    return;
                }

                // 🎯 İMLEÇ ALGILAMA & ŞEKİL HOVER TESPİTİ
                if (this.activeTool !== 'cursor') {
                    this.container.style.cursor = 'crosshair';
                    this.hoveredDrawing = null;
                    this.hoveredHandleIdx = -1;
                } else {
                    const hit = this.hitTest(mx, my);
                    this.hoveredDrawing = hit.drawing;
                    this.hoveredHandleIdx = hit.handleIdx;

                    if (hit.handleIdx !== -1) {
                        this.container.style.cursor = 'pointer';
                    } else if (hit.drawing) {
                        this.container.style.cursor = 'move';
                    } else {
                        this.container.style.cursor = 'crosshair';
                    }
                }`;

content = content.replace(oldMouseMoveLogic, newMouseMoveLogic);

// 3. Enhance render method to draw hover halo and animated handle highlight
const oldHandleDraw = `                    if (isSel && !this.hideAll) {
                        for (const pt of d.points) {
                            const hx = this.indexToX(pt.cIdx);
                            const hy = this.priceToY(pt.price);
                            ctx.fillStyle = '#ffffff';
                            ctx.strokeStyle = '#2962ff';
                            ctx.lineWidth = 2.5;
                            ctx.beginPath();
                            ctx.arc(hx, hy, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.stroke();
                        }
                    }`;

const newHandleDraw = `                    // Şekil üzerine gelindiğinde interaktif algılama ışıltısı (Hover Glow)
                    const isHovered = !isSel && this.hoveredDrawing && (this.hoveredDrawing.id === d.id);
                    if (isHovered) {
                        ctx.save();
                        ctx.strokeStyle = col;
                        ctx.lineWidth = lw + 8;
                        ctx.globalAlpha = 0.25;
                        if (d.type === 'trendline') {
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
                        }
                        ctx.restore();
                    }

                    // Seçili çizim uç tutamaçları (Handles)
                    if (isSel && !this.hideAll) {
                        for (let i = 0; i < d.points.length; i++) {
                            const pt = d.points[i];
                            const hx = this.indexToX(pt.cIdx);
                            const hy = this.priceToY(pt.price);
                            const isHandleHovered = (this.hoveredHandleIdx === i);

                            if (isHandleHovered) {
                                ctx.fillStyle = 'rgba(41, 98, 255, 0.35)';
                                ctx.beginPath();
                                ctx.arc(hx, hy, 12, 0, Math.PI * 2);
                                ctx.fill();
                            }

                            ctx.fillStyle = isHandleHovered ? '#60a5fa' : '#ffffff';
                            ctx.strokeStyle = '#2962ff';
                            ctx.lineWidth = 2.5;
                            ctx.beginPath();
                            ctx.arc(hx, hy, isHandleHovered ? 6.5 : 4.5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.stroke();
                        }
                    }`;

content = content.replace(oldHandleDraw, newHandleDraw);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cursor visual change and interactive hover glow applied successfully!');
