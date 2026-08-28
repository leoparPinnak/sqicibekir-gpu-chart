import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Full TradingView Drawing Engine Update
const engineStartIdx = content.indexOf('class TradingViewDrawingEngine {');
const engineEndIdx = content.indexOf('const drawingEngine = new TradingViewDrawingEngine(');

if (engineStartIdx !== -1 && engineEndIdx !== -1) {
    const updatedEngineClass = `class TradingViewDrawingEngine {
            constructor(container, canvas, config) {
                this.container = container;
                this.canvas = canvas;
                this.config = config; // { getPriceRange, getViewRange, getCandleData }
                this.activeTool = 'cursor';
                this.drawingState = 'idle'; // 'idle' | 'drawing'
                this.drawingInProgress = null;
                this.selectedDrawing = null;
                this.hoveredDrawing = null;
                this.hoveredHandleIdx = -1;
                this.isDragging = false;
                this.isDraggingHandle = false;
                this.activeHandleIndex = -1;
                this.dragStart = { x: 0, y: 0 };
                this.dragOriginalPoints = [];
                this.mouseDownStart = null;
                this.hasDragged = false;

                this.magnetMode = true;
                this.continuousDraw = false;
                this.lockAll = false;
                this.hideAll = false;
                this.defaultStyle = { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 };
                this.drawings = [];

                this.initEvents();
            }

            getPriceRange() { return this.config.getPriceRange(); }
            getViewRange() { return this.config.getViewRange(); }
            getCandleData() { return this.config.getCandleData(); }

            priceToY(price) {
                const h = this.container.clientHeight;
                const { min, max } = this.getPriceRange();
                const diff = max - min;
                if (diff <= 0) return h / 2;
                return Math.round(h - ((price - min) / diff) * h);
            }

            yToPrice(y) {
                const h = this.container.clientHeight;
                const { min, max } = this.getPriceRange();
                if (h <= 0) return min;
                return min + ((h - y) / h) * (max - min);
            }

            indexToX(cIdx) {
                const w = this.container.clientWidth;
                const { start, end } = this.getViewRange();
                const count = Math.max(1, end - start);
                return Math.round(((cIdx + 0.5 - start) / count) * w);
            }

            xToIndex(x) {
                const w = this.container.clientWidth;
                const { start, end } = this.getViewRange();
                const count = Math.max(1, end - start);
                if (w <= 0) return start;
                return start + (x / w) * count - 0.5;
            }

            snapToOHLC(cIdx, rawPrice) {
                if (!this.magnetMode) return { cIdx, price: rawPrice };
                const candles = this.getCandleData();
                if (!candles || candles.length === 0) return { cIdx, price: rawPrice };

                const roundIdx = Math.max(0, Math.min(candles.length - 1, Math.round(cIdx)));
                const candle = candles[roundIdx];
                if (!candle) return { cIdx, price: rawPrice };

                const ohlc = [candle.open, candle.high, candle.low, candle.close];
                let closest = ohlc[0];
                let minDist = Math.abs(rawPrice - closest);
                for (let i = 1; i < ohlc.length; i++) {
                    const d = Math.abs(rawPrice - ohlc[i]);
                    if (d < minDist) {
                        minDist = d;
                        closest = ohlc[i];
                    }
                }
                return { cIdx: roundIdx, price: closest };
            }

            setTool(toolName) {
                this.activeTool = toolName;
                if (toolName === 'cursor') {
                    this.drawingState = 'idle';
                    this.drawingInProgress = null;
                }
                const cursorBtn = document.getElementById('tv-tool-cursor');
                if (cursorBtn && toolName === 'cursor') cursorBtn.classList.add('active');
            }

            toggleMagnet() {
                this.magnetMode = !this.magnetMode;
                return this.magnetMode;
            }

            toggleContinuousDraw() {
                this.continuousDraw = !this.continuousDraw;
                return this.continuousDraw;
            }

            toggleLockAll() {
                this.lockAll = !this.lockAll;
                return this.lockAll;
            }

            toggleHideAll() {
                this.hideAll = !this.hideAll;
                return this.hideAll;
            }

            deleteAll() {
                this.drawings = [];
                this.selectedDrawing = null;
                this.drawingInProgress = null;
                this.drawingState = 'idle';
                updatePropertyToolbar(null);
            }

            initEvents() {
                if (!this.container) return;

                this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
                window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
                window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
                window.addEventListener('keydown', (e) => this.handleKeyDown(e));
                this.container.addEventListener('contextmenu', (e) => {
                    if (this.drawingState === 'drawing') {
                        e.preventDefault();
                        this.cancelDrawing();
                    }
                });
            }

            cancelDrawing() {
                this.drawingInProgress = null;
                this.drawingState = 'idle';
                this.setTool('cursor');
                this.selectDrawing(null);
            }

            handleMouseDown(e) {
                if (e.button !== 0) return;
                if (e.target && (e.target.closest('#tv-prop-toolbar') || e.target.closest('#tv-favorite-bar') || e.target.closest('.tv-left-toolbar') || e.target.closest('.tv-flyout-menu'))) {
                    return;
                }
                const rect = this.container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                this.mouseDownStart = { x: mx, y: my, time: Date.now() };
                this.hasDragged = false;

                // ========================================================
                // 1. ÇİZİM MODU: CLICK 1 (BAŞLAT) & CLICK 2 (BİTİR)
                // ========================================================
                if (this.activeTool !== 'cursor') {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));

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
                        e.stopPropagation();
                        return;
                    }

                    if (this.drawingState === 'idle') {
                        // 🟢 CLICK 1: Çizimi Başlat (Nokta 1'i sabitle, Nokta 2 fareyi izlesin)
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
                        e.stopPropagation();
                        return;
                    } else if (this.drawingState === 'drawing') {
                        // Çizim devam ederken mousedown basıldı:
                        // Eğer kullanıcı sürüklerse (drag), grafik kaysın; bas-çek yaparsa Click 2 ile çizim tamamlansın!
                        startPan(e.clientX, e.clientY);
                        return;
                    }
                }

                // ========================================================
                // 2. İMLEÇ (CURSOR) MODU: SEÇİM, TUTAMAÇ & GRAFİK KAYDIRMA
                // ========================================================
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
                    if (Math.hypot(mx - this.mouseDownStart.x, my - this.mouseDownStart.y) > 4) {
                        this.hasDragged = true;
                    }
                }

                // 🟢 Çizim modunda Nokta 2 fareyi canlı olarak izler (Basılı tutmaya gerek kalmadan)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = 'crosshair';
                    return;
                }

                if (this.isDraggingHandle && this.selectedDrawing) {
                    const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                    this.selectedDrawing.points[this.activeHandleIndex] = { cIdx: snapped.cIdx, price: snapped.price };
                    updatePropertyToolbar(this.selectedDrawing);
                    this.container.style.cursor = 'crosshair';
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
                    return;
                }

                // 🎯 İMLEÇ ALGILAMA & ŞEKİL HOVER TESPİTİ (CANLI İMLEÇ DEĞİŞİMİ)
                if (this.activeTool !== 'cursor') {
                    this.container.style.cursor = 'crosshair';
                    this.hoveredDrawing = null;
                    this.hoveredHandleIdx = -1;
                } else if (isChartDragging) {
                    this.container.style.cursor = 'grabbing';
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
                }
            }

            handleMouseUp(e) {
                const rect = this.container.getBoundingClientRect();
                const mx = e ? (e.clientX - rect.left) : 0;
                const my = e ? (e.clientY - rect.top) : 0;

                // Çizim modundayken mouseup gerçekleştiğinde:
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    if (this.hasDragged) {
                        // Kullanıcı çizim esnasında grafiği sürükledi (pan yaptı)!
                        // Çizim KAPANMAZ, çizim modu aynen devam eder.
                    } else {
                        // 🏁 CLICK 2: Çizimi Tamamla ve Yerleştir
                        const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
                        this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                        this.drawings.push(this.drawingInProgress);
                        this.selectDrawing(this.drawingInProgress);
                        this.drawingInProgress = null;
                        this.drawingState = 'idle';
                        if (!this.continuousDraw) this.setTool('cursor');
                    }
                }

                if (this.isDragging || this.isDraggingHandle) {
                    this.isDragging = false;
                    this.isDraggingHandle = false;
                }

                this.mouseDownStart = null;
                this.hasDragged = false;
            }

            handleKeyDown(e) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

                if (e.key === 'Escape') {
                    this.cancelDrawing();
                } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (this.selectedDrawing) {
                        this.drawings = this.drawings.filter(d => d.id !== this.selectedDrawing.id);
                        this.selectDrawing(null);
                    }
                }
            }

            selectDrawing(drawing) {
                this.selectedDrawing = drawing;
                updatePropertyToolbar(drawing);
            }

            hitTest(mx, my) {
                if (this.hideAll) return { drawing: null, handleIdx: -1 };

                if (this.selectedDrawing && !this.selectedDrawing.locked && !this.lockAll) {
                    for (let i = 0; i < this.selectedDrawing.points.length; i++) {
                        const p = this.selectedDrawing.points[i];
                        const sx = this.indexToX(p.cIdx);
                        const sy = this.priceToY(p.price);
                        if (Math.hypot(mx - sx, my - sy) <= 16) {
                            return { drawing: this.selectedDrawing, handleIdx: i };
                        }
                    }
                }

                for (let k = this.drawings.length - 1; k >= 0; k--) {
                    const d = this.drawings[k];
                    if (!d.points || d.points.length === 0) continue;

                    const p1 = d.points[0];
                    const p2 = d.points[1] || p1;
                    const x1 = this.indexToX(p1.cIdx);
                    const y1 = this.priceToY(p1.price);
                    const x2 = this.indexToX(p2.cIdx);
                    const y2 = this.priceToY(p2.price);

                    if (d.type === 'horizontal') {
                        if (Math.abs(my - y1) <= 12) return { drawing: d, handleIdx: -1 };
                    } else if (d.type === 'horzray') {
                        if (mx >= x1 - 4 && Math.abs(my - y1) <= 10) return { drawing: d, handleIdx: -1 };
                    } else if (d.type === 'vertical') {
                        if (Math.abs(mx - x1) <= 10) return { drawing: d, handleIdx: -1 };
                    } else if (d.type === 'rectangle' || d.type === 'long_pos' || d.type === 'short_pos') {
                        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
                        if (mx >= minX - 6 && mx <= maxX + 6 && my >= minY - 6 && my <= maxY + 6) {
                            return { drawing: d, handleIdx: -1 };
                        }
                    } else {
                        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
                        let dist = 999;
                        if (l2 === 0) dist = Math.hypot(mx - x1, my - y1);
                        else {
                            let t = ((mx - x1) * (x2 - x1) + (my - y1) * (y2 - y1)) / l2;
                            t = Math.max(0, Math.min(1, t));
                            dist = Math.hypot(mx - (x1 + t * (x2 - x1)), my - (y1 + t * (y2 - y1)));
                        }
                        if (dist <= 14) return { drawing: d, handleIdx: -1 };
                    }
                }
                return { drawing: null, handleIdx: -1 };
            }

            render(ctx) {
                if (!ctx || this.hideAll) return;

                const list = [...this.drawings];
                if (this.drawingInProgress) list.push(this.drawingInProgress);

                for (const d of list) {
                    if (!d.points || d.points.length === 0) continue;

                    const isSel = this.selectedDrawing && (this.selectedDrawing.id === d.id);
                    const col = d.style.color || '#38bdf8';
                    const lw = d.style.width || 2;
                    const ls = d.style.lineStyle || 'solid';

                    const p1 = d.points[0];
                    const p2 = d.points[1] || p1;
                    const x1 = this.indexToX(p1.cIdx);
                    const y1 = this.priceToY(p1.price);
                    const x2 = this.indexToX(p2.cIdx);
                    const y2 = this.priceToY(p2.price);
                    const w = this.container.clientWidth;

                    // 1. Şekil Üzerine Gelindiğinde Canlı Hover Vurgusu (Interactive Glow)
                    const isHovered = !isSel && this.hoveredDrawing && (this.hoveredDrawing.id === d.id);
                    if (isHovered) {
                        ctx.save();
                        ctx.strokeStyle = col;
                        ctx.lineWidth = lw + 8;
                        ctx.globalAlpha = 0.28;
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

                    // 2. Ana Çizim
                    ctx.save();
                    ctx.strokeStyle = col;
                    ctx.lineWidth = lw;
                    if (ls === 'dashed') ctx.setLineDash([8, 6]);
                    else if (ls === 'dotted') ctx.setLineDash([3, 4]);
                    else ctx.setLineDash([]);

                    if (d.type === 'trendline') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    } else if (d.type === 'ray') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        const dx = x2 - x1;
                        const dy = y2 - y1;
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
                        ctx.fillStyle = col;
                        ctx.globalAlpha = d.style.fillOpacity || 0.2;
                        ctx.fillRect(minX, minY, rw, rh);
                        ctx.globalAlpha = 1.0;
                        ctx.strokeRect(minX, minY, rw, rh);
                    } else if (d.type === 'fibonacci') {
                        const fibs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
                        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                        const diff = p2.price - p1.price;
                        for (const lvl of fibs) {
                            const ly = this.priceToY(p1.price + diff * lvl);
                            ctx.beginPath();
                            ctx.moveTo(minX, ly);
                            ctx.lineTo(maxX, ly);
                            ctx.stroke();
                            ctx.font = '10px "SF Pro Text", sans-serif';
                            ctx.fillStyle = col;
                            ctx.fillText(\`\${(lvl * 100).toFixed(1)}% ($\${(p1.price + diff * lvl).toFixed(2)})\`, minX + 4, ly - 3);
                        }
                    } else if (d.type === 'long_pos' || d.type === 'short_pos') {
                        const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                        const midY = (y1 + y2) / 2;
                        const isLong = d.type === 'long_pos';
                        
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
                        ctx.fillRect(minX, isLong ? Math.min(y1, y2) : midY, rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                        ctx.fillRect(minX, isLong ? midY : Math.min(y1, y2), rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.strokeStyle = '#38bdf8';
                        ctx.beginPath();
                        ctx.moveTo(minX, midY);
                        ctx.lineTo(minX + rw, midY);
                        ctx.stroke();
                    } else if (d.type === 'text') {
                        ctx.font = 'bold 13px "SF Pro Text", "Segoe UI", sans-serif';
                        ctx.fillStyle = col;
                        ctx.fillText('Not: ' + (p1.price.toFixed(2)), x1, y1);
                    }

                    // 3. Seçili Çizim Tutamaçları (Handles)
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
                    }
                    ctx.restore();
                }
            }
        }\n\n        `;

    content = content.substring(0, engineStartIdx) + updatedEngineClass + content.substring(engineEndIdx);
    fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
    console.log('TradingView Click-to-Start / Click-to-Finish engine replaced successfully!');
} else {
    console.error('Could not locate TradingViewDrawingEngine class markers');
}
