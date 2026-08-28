import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Locate handleMouseDown, handleMouseMove, handleMouseUp in TradingViewDrawingEngine
const oldMethodsRegex = /handleMouseDown\(e\) \{[\s\S]*?handleKeyDown\(e\) \{/;

const newMethods = `handleMouseDown(e) {
                if (e.button !== 0) return;
                if (e.target && (e.target.closest('#tv-prop-toolbar') || e.target.closest('#tv-favorite-bar') || e.target.closest('.tv-left-toolbar') || e.target.closest('.tv-flyout-menu'))) {
                    return;
                }
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                this.mouseDownStart = { x: mx, y: my, time: Date.now() };
                this.hasDragged = false;

                // 🎯 Çizim aracı seçiliyken: Basılı tutup çekilirse grafik kaysın, başlangıç noktası koyulmasın
                if (this.activeTool !== 'cursor') {
                    startPan(e.clientX, e.clientY);
                    return;
                }

                // 🖱️ Cursor modunda: Tutamaç veya çizim seçimi / sürükleme
                const hit = this.hitTest(mx, my);
                if (hit.handleIdx !== -1) {
                    this.isDraggingHandle = true;
                    this.activeHandleIndex = hit.handleIdx;
                    this.dragStart = { x: mx, y: my };
                    e.stopPropagation();
                    return;
                }

                if (hit.drawing) {
                    this.selectDrawing(hit.drawing);
                    if (!hit.drawing.locked && !this.lockAll) {
                        this.isDragging = true;
                        this.dragStart = { x: mx, y: my };
                        this.dragOriginalPoints = JSON.parse(JSON.stringify(hit.drawing.points));
                    }
                    e.stopPropagation();
                    return;
                }

                // Boş alana tıklandıysa çizim seçimini kaldır ve grafik kaydırmayı başlat
                this.selectDrawing(null);
                startPan(e.clientX, e.clientY);
            }

            handleMouseMove(e) {
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                if (this.mouseDownStart) {
                    if (Math.hypot(mx - this.mouseDownStart.x, my - this.mouseDownStart.y) > 5) {
                        this.hasDragged = true;
                    }
                }

                // 🟢 Çizim modunda Nokta 2 fareyi canlı olarak izler (Basılı tutmaya gerek kalmadan)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    return;
                }

                if (this.isDraggingHandle && this.selectedDrawing) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.selectedDrawing.points[this.activeHandleIndex] = { cIdx: snapped.cIdx, price: snapped.price };
                    updatePropertyToolbar(this.selectedDrawing);
                    this.container.style.cursor = 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = 'crosshair';
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
                    this.container.style.cursor = 'grabbing';
                    if (this.canvas) this.canvas.style.cursor = 'grabbing';
                    return;
                }

                // 🎯 İMLEÇ ALGILAMA & ŞEKİL HOVER TESPİTİ (CANLI İMLEÇ DEĞİŞİMİ)
                if (this.activeTool !== 'cursor') {
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    this.hoveredDrawing = null;
                    this.hoveredHandleIdx = -1;
                } else if (isChartDragging) {
                    this.container.style.cursor = 'grabbing';
                    if (this.canvas) this.canvas.style.cursor = 'grabbing';
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
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                }
            }

            handleMouseUp(e) {
                const rect = this.container.getBoundingClientRect();
                const mx = e ? (e.clientX - rect.left) : 0;
                const my = e ? (e.clientY - rect.top) : 0;

                // ========================================================
                // ÇİZİM ARACI SEÇİLİYKEN MOUSEUP KONTROLÜ
                // ========================================================
                if (this.activeTool !== 'cursor') {
                    if (this.hasDragged) {
                        // 👆 Kullanıcı basılı tutup sürükledi (Grafik kaydı)!
                        // Başlangıç veya bitiş noktası koyulmaz; araç seçili kalmaya devam eder.
                    } else {
                        // 🟢 Kullanıcı temiz 1 Click (bas-çek) yaptı!
                        const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));

                        if (this.drawingState === 'idle') {
                            // Tek tıklamalı araçlar (Yatay / Dikey Çizgiler)
                            if (['horizontal', 'horzray', 'vertical'].includes(this.activeTool)) {
                                const newD = {
                                    id: 'draw_' + Date.now(),
                                    type: this.activeTool,
                                    points: [{ cIdx: snapped.cIdx, price: snapped.price }],
                                    style: JSON.parse(JSON.stringify(this.defaultStyle)),
                                    locked: false
                                };
                                this.drawings.push(newD);
                                this.selectDrawing(newD);
                                if (!this.continuousDraw) this.setTool('cursor');
                            } else {
                                // 🌟 1. CLICK: Başlangıç Noktası (Point 1) Belirlendi!
                                this.drawingInProgress = {
                                    id: 'draw_' + Date.now(),
                                    type: this.activeTool,
                                    points: [
                                        { cIdx: snapped.cIdx, price: snapped.price },
                                        { cIdx: snapped.cIdx, price: snapped.price }
                                    ],
                                    style: JSON.parse(JSON.stringify(this.defaultStyle)),
                                    locked: false
                                };
                                this.drawingState = 'drawing';
                            }
                        } else if (this.drawingState === 'drawing' && this.drawingInProgress) {
                            // 🏁 2. CLICK: Bitiş Noktası (Point 2) Belirlendi ve Çizim Tamamlandı!
                            this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                            this.drawings.push(this.drawingInProgress);
                            this.selectDrawing(this.drawingInProgress);
                            this.drawingInProgress = null;
                            this.drawingState = 'idle';
                            if (!this.continuousDraw) this.setTool('cursor');
                        }
                    }
                }

                if (this.isDragging || this.isDraggingHandle) {
                    this.isDragging = false;
                    this.isDraggingHandle = false;
                }

                this.mouseDownStart = null;
                this.hasDragged = false;
            }

            handleKeyDown(e) {`;

content = content.replace(oldMethodsRegex, newMethods);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Click-vs-drag drawing state machine updated successfully!');
