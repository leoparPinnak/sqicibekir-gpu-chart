/**
 * TradingView Çizim Motoru ve Fonksiyonları (Standalone Library / Reference)
 * Bu dosya, TradingView sol çizim araçları, kayan ayar çubuğu ve modal pencerelerin
 * grafik üzerinde nasıl etkileşim kurduğuna ve çalıştığına dair tüm mantığı ve fonksiyonları içerir.
 */

class TradingViewDrawingEngine {
    constructor(canvasContainer, overlayCanvas, options = {}) {
        this.container = canvasContainer;
        this.canvas = overlayCanvas;
        this.ctx = overlayCanvas ? overlayCanvas.getContext('2d') : null;
        
        // Durum Değişkenleri
        this.activeTool = 'cursor';
        this.magnetMode = false;
        this.continuousDraw = false;
        this.lockAll = false;
        this.hideAll = false;
        
        this.drawings = [];
        this.selectedDrawing = null;
        this.drawingInProgress = null;
        
        // Sürükleme Durumu
        this.isDragging = false;
        this.isDraggingHandle = false;
        this.activeHandleIndex = -1;
        this.dragStart = { x: 0, y: 0 };
        this.dragOriginalPoints = [];
        
        // Eksen ve Fiyat Bilgileri (Grafik Motorundan Alınır)
        this.getPriceRange = options.getPriceRange || (() => ({ min: 0, max: 100 }));
        this.getViewRange = options.getViewRange || (() => ({ start: 0, end: 100 }));
        this.getCandleData = options.getCandleData || (() => []);
        
        this.initEvents();
    }

    // ==========================================
    // 1. KOORDİNAT DÖNÜŞÜM VE YAPIŞMA (MAGNET)
    // ==========================================
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

    // ==========================================
    // 2. ARAÇ SEÇİMİ VE BUTON KONTROLLERİ
    // ==========================================
    setTool(toolName) {
        this.activeTool = toolName;
        this.container.style.cursor = (toolName === 'cursor') ? 'default' : 'crosshair';
        if (this.onToolChange) this.onToolChange(toolName);
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
        if (this.onSelectionChange) this.onSelectionChange(null);
    }

    // ==========================================
    // 3. TIKLAMA, SÜRÜKLEME VE ÇİZİM ETKİLEŞİMİ
    // ==========================================
    initEvents() {
        if (!this.container) return;

        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.container.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleMouseDown(e) {
        const rect = this.container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // 1. Yeni Çizim Başlatma Modu
        if (this.activeTool !== 'cursor') {
            const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));

            if (['horizontal', 'vertical'].includes(this.activeTool)) {
                const newD = {
                    id: 'draw_' + Date.now(),
                    type: this.activeTool,
                    points: [{ cIdx: snapped.cIdx, price: snapped.price }],
                    style: { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 },
                    locked: false
                };
                this.drawings.push(newD);
                this.selectDrawing(newD);
                if (!this.continuousDraw) this.setTool('cursor');
                return;
            }

            this.drawingInProgress = {
                id: 'draw_' + Date.now(),
                type: this.activeTool,
                points: [
                    { cIdx: snapped.cIdx, price: snapped.price },
                    { cIdx: snapped.cIdx, price: snapped.price }
                ],
                style: { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 },
                locked: false
            };
            return;
        }

        // 2. İmleç Modunda Seçim ve Taşıma
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

        // Boş alana tıklama
        this.selectDrawing(null);
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (this.drawingInProgress) {
            const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
            this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
            return;
        }

        if (this.isDraggingHandle && this.selectedDrawing) {
            const snapped = this.snapToOHLC(this.xToIndex(mx), this.yToPrice(my));
            this.selectedDrawing.points[this.activeHandleIndex] = { cIdx: snapped.cIdx, price: snapped.price };
            if (this.onSelectionChange) this.onSelectionChange(this.selectedDrawing);
            return;
        }

        if (this.isDragging && this.selectedDrawing && this.dragOriginalPoints.length > 0) {
            const dIdx = this.xToIndex(mx) - this.xToIndex(this.dragStart.x);
            const dPrice = this.yToPrice(my) - this.yToPrice(this.dragStart.y);

            for (let i = 0; i < this.selectedDrawing.points.length; i++) {
                this.selectedDrawing.points[i].cIdx = this.dragOriginalPoints[i].cIdx + dIdx;
                this.selectedDrawing.points[i].price = this.dragOriginalPoints[i].price + dPrice;
            }
            if (this.onSelectionChange) this.onSelectionChange(this.selectedDrawing);
        }
    }

    handleMouseUp() {
        if (this.drawingInProgress) {
            this.drawings.push(this.drawingInProgress);
            this.selectDrawing(this.drawingInProgress);
            this.drawingInProgress = null;
            if (!this.continuousDraw) this.setTool('cursor');
        }

        if (this.isDragging || this.isDraggingHandle) {
            this.isDragging = false;
            this.isDraggingHandle = false;
        }
    }

    handleDoubleClick(e) {
        const rect = this.container.getBoundingClientRect();
        const hit = this.hitTest(e.clientX - rect.left, e.clientY - rect.top);
        if (hit.drawing && this.onOpenSettings) {
            this.selectDrawing(hit.drawing);
            this.onOpenSettings(hit.drawing);
        }
    }

    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        if (e.key === 'Escape') {
            this.setTool('cursor');
            this.selectDrawing(null);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedDrawing) {
                this.drawings = this.drawings.filter(d => d.id !== this.selectedDrawing.id);
                this.selectDrawing(null);
            }
        }
    }

    selectDrawing(drawing) {
        this.selectedDrawing = drawing;
        if (this.onSelectionChange) this.onSelectionChange(drawing);
    }

    // ==========================================
    // 4. HİT TESTİ (TIKLAMA TESPİTİ)
    // ==========================================
    hitTest(mx, my) {
        if (this.hideAll) return { drawing: null, handleIdx: -1 };

        if (this.selectedDrawing && !this.selectedDrawing.locked && !this.lockAll) {
            for (let i = 0; i < this.selectedDrawing.points.length; i++) {
                const p = this.selectedDrawing.points[i];
                const sx = this.indexToX(p.cIdx);
                const sy = this.priceToY(p.price);
                if (Math.hypot(mx - sx, my - sy) <= 8) {
                    return { drawing: this.selectedDrawing, handleIdx: i };
                }
            }
        }

        for (let k = this.drawings.length - 1; k >= 0; k--) {
            const d = this.drawings[k];
            if (d.points.length === 0) continue;

            const p1 = d.points[0];
            const p2 = d.points[1] || p1;
            const x1 = this.indexToX(p1.cIdx);
            const y1 = this.priceToY(p1.price);
            const x2 = this.indexToX(p2.cIdx);
            const y2 = this.priceToY(p2.price);

            if (d.type === 'horizontal') {
                if (Math.abs(my - y1) <= 6) return { drawing: d, handleIdx: -1 };
            } else if (d.type === 'vertical') {
                if (Math.abs(mx - x1) <= 6) return { drawing: d, handleIdx: -1 };
            } else if (d.type === 'rectangle') {
                const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
                if (mx >= minX - 4 && mx <= maxX + 4 && my >= minY - 4 && my <= maxY + 4) {
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
                if (dist <= 6) return { drawing: d, handleIdx: -1 };
            }
        }
        return { drawing: null, handleIdx: -1 };
    }

    // ==========================================
    // 5. CANVAS RENDER DÖNGÜSÜ
    // ==========================================
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

            ctx.save();
            ctx.strokeStyle = col;
            ctx.lineWidth = lw;
            if (ls === 'dashed') ctx.setLineDash([8, 6]);
            else if (ls === 'dotted') ctx.setLineDash([3, 4]);
            else ctx.setLineDash([]);

            const p1 = d.points[0];
            const p2 = d.points[1] || p1;
            const x1 = this.indexToX(p1.cIdx);
            const y1 = this.priceToY(p1.price);
            const x2 = this.indexToX(p2.cIdx);
            const y2 = this.priceToY(p2.price);
            const w = this.container.clientWidth;

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
                }
            }

            // Seçim Çerçevesi / Kontrol Noktaları
            if (isSel && !this.hideAll) {
                for (const pt of d.points) {
                    const hx = this.indexToX(pt.cIdx);
                    const hy = this.priceToY(pt.price);
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#2563eb';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }
            ctx.restore();
        }
    }
}

// Node.js veya Browser Module Desteği
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TradingViewDrawingEngine;
}
