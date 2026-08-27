/**
 * Grafik Etkileşim ve Kamera Yöneticisi
 * Pointer Events (Unbreakable Drag) + Multi-mode Wheel (Zoom & Pan)
 */

export class InteractionManager {
    constructor(elements, state, callbacks) {
        this.canvas = elements.canvas;
        this.container = elements.container;
        this.timeAxis = elements.timeAxis;
        this.priceAxis = elements.priceAxis;
        this.state = state;
        this.callbacks = callbacks;

        this.isChartDragging = false;
        this.chartDragStartX = 0;
        this.origViewStart = 0;
        this.origViewEnd = 0;

        this.isPriceDragging = false;
        this.priceDragStartY = 0;

        this.bindEvents();
    }

    startChartPan(clientX, targetElement) {
        if (this.state.totalCandles === 0) return;
        this.isChartDragging = true;
        this.chartDragStartX = clientX;
        this.origViewStart = this.state.viewStart;
        this.origViewEnd = this.state.viewEnd;

        this.container.classList.add('grabbing');
        this.canvas.classList.add('grabbing');
        this.timeAxis.classList.add('grabbing');
    }

    startPriceScale(clientY) {
        this.isPriceDragging = true;
        this.priceDragStartY = clientY;
    }

    endDrag() {
        this.isChartDragging = false;
        this.isPriceDragging = false;
        this.container.classList.remove('grabbing');
        this.canvas.classList.remove('grabbing');
        this.timeAxis.classList.remove('grabbing');
    }

    bindEvents() {
        const c = this.canvas;
        const cont = this.container;
        const ta = this.timeAxis;
        const pa = this.priceAxis;

        // Pointer Down - Canvas & Time Axis
        const onChartPointerDown = (e) => {
            if (e.button !== 0) return; // Sadece sol tık
            this.startChartPan(e.clientX, e.currentTarget);
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
            e.preventDefault();
        };

        c.addEventListener('pointerdown', onChartPointerDown);
        ta.addEventListener('pointerdown', onChartPointerDown);

        // Pointer Down - Price Axis
        pa.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            this.startPriceScale(e.clientY);
            try { pa.setPointerCapture(e.pointerId); } catch (_) {}
            e.preventDefault();
        });

        // Global Pointer Up
        window.addEventListener('pointerup', () => this.endDrag());
        window.addEventListener('pointercancel', () => this.endDrag());

        // Global Pointer Move
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));

        // Double Click Reset
        pa.addEventListener('dblclick', () => {
            this.state.priceScaleFactor = 1.0;
            if (this.callbacks.onUpdate) this.callbacks.onUpdate();
        });

        ta.addEventListener('dblclick', () => {
            if (this.callbacks.fitAll) this.callbacks.fitAll();
        });

        // Wheel (Zoom & Horizontal Pan)
        const onWheel = (e) => this.handleWheel(e);
        c.addEventListener('wheel', onWheel, { passive: false });
        cont.addEventListener('wheel', onWheel, { passive: false });
        ta.addEventListener('wheel', onWheel, { passive: false });

        cont.addEventListener('pointerleave', () => {
            if (!this.isChartDragging && !this.isPriceDragging) {
                this.state.mousePixelX = -1000;
                this.state.mousePixelY = -1000;
                if (this.callbacks.onCrosshairLeave) this.callbacks.onCrosshairLeave();
            }
        });
    }

    handlePointerMove(e) {
        // 1. Dikey Fiyat Ölçekleme (Y-Axis Drag)
        if (this.isPriceDragging) {
            const deltaY = this.priceDragStartY - e.clientY;
            this.state.priceScaleFactor = Math.max(
                0.05,
                Math.min(25.0, this.state.priceScaleFactor * Math.exp(deltaY * 0.006))
            );
            this.priceDragStartY = e.clientY;
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        this.state.mousePixelX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        this.state.mousePixelY = (rect.bottom - e.clientY) * (this.canvas.height / rect.height);

        // 2. Yatay Geçmişte Kaydırma (Chart Pan)
        if (this.isChartDragging && this.state.totalCandles > 0) {
            const deltaPx = e.clientX - this.chartDragStartX;
            const candleSpan = this.origViewEnd - this.origViewStart;
            const deltaCandles = (deltaPx / rect.width) * candleSpan;

            let nStart = this.origViewStart - deltaCandles;
            let nEnd = this.origViewEnd - deltaCandles;

            if (nStart < 0) {
                nStart = 0;
                nEnd = candleSpan;
            }
            if (nEnd > this.state.totalCandles) {
                nEnd = this.state.totalCandles;
                nStart = Math.max(0, this.state.totalCandles - candleSpan);
            }

            this.state.viewStart = nStart;
            this.state.viewEnd = nEnd;
        }

        // 3. Crosshair Takibi
        if (this.callbacks.onCrosshairMove) {
            this.callbacks.onCrosshairMove(e, rect);
        }
    }

    handleWheel(e) {
        e.preventDefault();
        if (this.state.totalCandles === 0) return;

        const count = Math.max(1, this.state.viewEnd - this.state.viewStart);

        // A) Shift Tuşu veya Yatay Trackpad Kaydırması (Yatay Geçmişe Gitme)
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            const panAmount = (e.deltaX || e.deltaY) * 0.08;
            let nStart = this.state.viewStart + panAmount;
            let nEnd = this.state.viewEnd + panAmount;

            if (nStart < 0) {
                nStart = 0;
                nEnd = count;
            }
            if (nEnd > this.state.totalCandles) {
                nEnd = this.state.totalCandles;
                nStart = Math.max(0, this.state.totalCandles - count);
            }

            this.state.viewStart = nStart;
            this.state.viewEnd = nEnd;
            return;
        }

        // B) Standart Dikey Tekerlek (İmleç Odaklı Yakınlaştırma / Uzaklaştırma)
        const zoomSpeed = 0.0012;
        const zoomFactor = Math.exp(e.deltaY * zoomSpeed);
        const newCount = Math.max(10, Math.min(this.state.totalCandles, count * zoomFactor));

        const rect = this.canvas.getBoundingClientRect();
        const mouseNormX = Math.max(0.0, Math.min(1.0, (e.clientX - rect.left) / rect.width));
        const mouseCandle = this.state.viewStart + mouseNormX * count;

        let nStart = mouseCandle - mouseNormX * newCount;
        let nEnd = mouseCandle + (1.0 - mouseNormX) * newCount;

        if (newCount >= this.state.totalCandles - 1 || (nStart <= 0 && nEnd >= this.state.totalCandles)) {
            nStart = 0;
            nEnd = this.state.totalCandles;
        } else {
            if (nStart < 0) {
                nStart = 0;
                nEnd = newCount;
            }
            if (nEnd > this.state.totalCandles) {
                nEnd = this.state.totalCandles;
                nStart = Math.max(0, this.state.totalCandles - newCount);
            }
        }

        this.state.viewStart = Math.max(0, nStart);
        this.state.viewEnd = Math.min(this.state.totalCandles, nEnd);
    }
}
