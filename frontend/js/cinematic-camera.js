/**
 * 🎬 TradeChart Cinematic Autonomous Camera Director
 * Arka planda grafiği akıcı, estetik ve rastgele sinematik kamera hareketleriyle yönetir.
 * - Yatay zaman süzülmesi (Glide pan)
 * - Rastgele yakınlaşma / uzaklaşma (Dynamic zoom)
 * - Serbest fiyat gezintisi & Otomatik ölçekleme hizalaması (easeOutCubic)
 */

export class CinematicCameraDirector {
    constructor(chartEngine) {
        this.engine = chartEngine;
        this.isRunning = false;
        this.currentAction = 'pan_forward';
        this.actionStartTime = performance.now();
        this.actionDuration = 5000; // ms

        // Kamera hedefleri
        this.startViewStart = 0;
        this.startViewEnd = 100;
        this.targetViewStart = 0;
        this.targetViewEnd = 100;

        this.lastUpdateTime = performance.now();
        this.loopTimer = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🎬 [Cinematic Camera] Otonom demo kamera modu başlatıldı.');
        this.pickNewAction();
        this.tick();
    }

    stop() {
        this.isRunning = false;
        if (this.loopTimer) {
            cancelAnimationFrame(this.loopTimer);
            this.loopTimer = null;
        }
        console.log('🎬 [Cinematic Camera] Otonom demo kamera modu durduruldu.');
    }

    pickNewAction() {
        if (!this.engine || !this.engine.totalCandles || this.engine.totalCandles < 50) return;

        const actions = ['pan_forward', 'zoom_in_breakout', 'macro_zoom_out', 'price_vertical_glide', 'space_autofit'];
        // Rastgele yeni bir kamera eylemi seç
        const next = actions[Math.floor(Math.random() * actions.length)];
        this.currentAction = next;
        this.actionStartTime = performance.now();
        this.actionDuration = 3500 + Math.random() * 4000; // 3.5s - 7.5s

        const curStart = this.engine.viewStart;
        const curEnd = this.engine.viewEnd;
        const total = this.engine.totalCandles;
        const curCount = Math.max(15, curEnd - curStart);

        this.startViewStart = curStart;
        this.startViewEnd = curEnd;

        switch (next) {
            case 'pan_forward': {
                // İleriye veya geriye doğru akıcı yatay süzülme
                const deltaCandles = (Math.random() > 0.4 ? 1 : -1) * (40 + Math.random() * 90);
                let tStart = curStart + deltaCandles;
                let tEnd = curEnd + deltaCandles;
                if (tStart < 0) { tStart = 0; tEnd = curCount; }
                if (tEnd > total) { tEnd = total; tStart = total - curCount; }
                this.targetViewStart = tStart;
                this.targetViewEnd = tEnd;
                break;
            }
            case 'zoom_in_breakout': {
                // Fiyat patlaması olan bir bölgeye odaklanarak detaylı yakınlaşma (30-60 mum)
                const targetCount = 30 + Math.random() * 35;
                const center = Math.max(targetCount, Math.min(total - targetCount, curStart + curCount * 0.6));
                this.targetViewStart = center - targetCount * 0.5;
                this.targetViewEnd = center + targetCount * 0.5;
                break;
            }
            case 'macro_zoom_out': {
                // Makro trendi göstermek için geniş açıya çık (180-350 mum)
                const targetCount = Math.min(total, 180 + Math.random() * 170);
                const end = Math.min(total, curEnd + 20);
                this.targetViewStart = Math.max(0, end - targetCount);
                this.targetViewEnd = end;
                break;
            }
            case 'price_vertical_glide': {
                // Fiyat eksenini hafifçe manuel kaydırıp serbest modu hissettir
                if (typeof this.engine.setManualPriceOffset === 'function') {
                    const offset = (Math.random() - 0.5) * 40;
                    this.engine.setManualPriceOffset(offset);
                }
                break;
            }
            case 'space_autofit': {
                // Görünür mumları akıcı easeOutCubic ile dikeyde hizala
                if (typeof window.triggerSpaceAutoFit === 'function') {
                    window.triggerSpaceAutoFit();
                }
                break;
            }
        }
    }

    tick() {
        if (!this.isRunning) return;

        const now = performance.now();
        const elapsed = now - this.actionStartTime;
        const progress = Math.min(1.0, elapsed / this.actionDuration);

        // Sinematik yumuşak geçiş eğrisi (Smooth Ease-in-out Cubic)
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (this.currentAction === 'pan_forward' || this.currentAction === 'zoom_in_breakout' || this.currentAction === 'macro_zoom_out') {
            const newStart = this.startViewStart + (this.targetViewStart - this.startViewStart) * ease;
            const newEnd = this.startViewEnd + (this.targetViewEnd - this.startViewEnd) * ease;
            
            if (this.engine) {
                this.engine.viewStart = newStart;
                this.engine.viewEnd = newEnd;
            }
        }

        if (progress >= 1.0) {
            this.pickNewAction();
        }

        this.loopTimer = requestAnimationFrame(() => this.tick());
    }
}
