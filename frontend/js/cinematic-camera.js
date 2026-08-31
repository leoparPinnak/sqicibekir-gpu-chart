/**
 * 🎬 TradeChart Cinematic Autonomous Camera Director
 * Arka planda grafiği akıcı, estetik ve akıllı sinematik kamera hareketleriyle yönetir.
 * - Başlangıçta mumlar ekranın tam ortasından dengeli olarak başlar
 * - Her animasyon bitiminde 0.5s - 1.0s dinlenme/bekleme (pause delay) uygulanır
 * - Ardından sıradaki akıcı harekete geçilir
 */

export class CinematicCameraDirector {
    constructor(chartWindow) {
        this.win = chartWindow;
        this.isRunning = false;
        
        // Durumlar: 'initial_center' | 'moving' | 'pausing'
        this.state = 'initial_center';
        this.currentAction = 'pan_forward';
        
        this.stateStartTime = performance.now();
        this.actionDuration = 4500; // ms
        this.pauseDuration = 750;   // 0.75s dinlenme

        // Kamera hedefleri
        this.startViewStart = 0;
        this.startViewEnd = 100;
        this.targetViewStart = 0;
        this.targetViewEnd = 100;

        this.loopTimer = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🎬 [Cinematic Camera] Otonom kamera yönetmeni başlatıldı.');

        // 1. ADIM: Mumları ekranın tam ortasında başlat
        this.centerInitialView();
        
        // İlk açılışta 1 saniye merkezde durağan bekle, sonra akışı başlat
        this.state = 'pausing';
        this.stateStartTime = performance.now();
        this.pauseDuration = 1000; // 1.0 saniye ilk açılış durağanlığı

        this.tick();
    }

    stop() {
        this.isRunning = false;
        if (this.loopTimer) {
            cancelAnimationFrame(this.loopTimer);
            this.loopTimer = null;
        }
        console.log('🎬 [Cinematic Camera] Otonom kamera yönetmeni durduruldu.');
    }

    centerInitialView() {
        if (!this.win) return;
        const total = this.win.totalCandles || (this.win.candleDataBase ? this.win.candleDataBase.length : 0);
        if (total < 10) return;

        // Ekranın tam ortasında 70-80 mumluk mükemmel dengeli başlangıç kadrajı
        const initialCount = Math.min(total, 75);
        const centerIdx = Math.round(total * 0.55); // Ortaya yakın dengeli odak
        const s = Math.max(0, centerIdx - Math.round(initialCount * 0.5));
        const e = s + initialCount;

        this.win.viewStart = s;
        this.win.viewEnd = e;
        if (this.win.smoothViewStart !== undefined) this.win.smoothViewStart = s;
        if (this.win.smoothViewEnd !== undefined) this.win.smoothViewEnd = e;

        // Dikey fiyat eksenini tam ortaya sığdır
        if (typeof this.win.triggerSpaceAutoFit === 'function') {
            this.win.triggerSpaceAutoFit();
        }
    }

    pickNewAction() {
        if (!this.win || !this.win.totalCandles || this.win.totalCandles < 30) return;

        const actions = ['pan_forward', 'zoom_in_breakout', 'macro_zoom_out', 'space_autofit'];
        // Rastgele yeni eylem seç
        const next = actions[Math.floor(Math.random() * actions.length)];
        this.currentAction = next;
        this.state = 'moving';
        this.stateStartTime = performance.now();
        this.actionDuration = 3800 + Math.random() * 3200; // 3.8s - 7.0s hareket süresi

        const curStart = this.win.viewStart;
        const curEnd = this.win.viewEnd;
        const total = this.win.totalCandles;
        const curCount = Math.max(15, curEnd - curStart);

        this.startViewStart = curStart;
        this.startViewEnd = curEnd;

        switch (next) {
            case 'pan_forward': {
                // Akıcı yatay zaman süzülmesi
                const deltaCandles = (Math.random() > 0.45 ? 1 : -1) * (35 + Math.random() * 75);
                let tStart = curStart + deltaCandles;
                let tEnd = curEnd + deltaCandles;
                if (tStart < 0) { tStart = 0; tEnd = curCount; }
                if (tEnd > total) { tEnd = total; tStart = Math.max(0, total - curCount); }
                this.targetViewStart = tStart;
                this.targetViewEnd = tEnd;
                break;
            }
            case 'zoom_in_breakout': {
                // Mum detaylarına odaklanarak yakınlaşma (35-55 mum)
                const targetCount = 35 + Math.random() * 25;
                const center = Math.max(targetCount * 0.6, Math.min(total - targetCount * 0.6, curStart + curCount * 0.5));
                this.targetViewStart = Math.max(0, center - targetCount * 0.5);
                this.targetViewEnd = Math.min(total, this.targetViewStart + targetCount);
                break;
            }
            case 'macro_zoom_out': {
                // Geniş açı makro trend görünümü (140-260 mum)
                const targetCount = Math.min(total, 140 + Math.random() * 120);
                const end = Math.min(total, curEnd + 15);
                this.targetViewStart = Math.max(0, end - targetCount);
                this.targetViewEnd = end;
                break;
            }
            case 'space_autofit': {
                // Dikey ekseni akıcı sığdır ve hafif yatay merkezleme yap
                if (typeof this.win.triggerSpaceAutoFit === 'function') {
                    this.win.triggerSpaceAutoFit();
                }
                this.targetViewStart = curStart;
                this.targetViewEnd = curEnd;
                break;
            }
        }
    }

    tick() {
        if (!this.isRunning) return;

        const now = performance.now();

        if (this.state === 'pausing') {
            // DİNLENME / BEKLEME FAZI: Kamera tamamen sabit durur (0.5s - 1.0s)
            const elapsedPause = now - this.stateStartTime;
            if (elapsedPause >= this.pauseDuration) {
                // Bekleme bitti, sıradaki harekete geç
                this.pickNewAction();
            }
        } else if (this.state === 'moving') {
            // HAREKET FAZI: Sinematik Ease-in-out Cubic süzülme
            const elapsed = now - this.stateStartTime;
            const progress = Math.min(1.0, elapsed / this.actionDuration);

            // İpeksi yumuşak geçiş eğrisi
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            if (this.win && (this.currentAction === 'pan_forward' || this.currentAction === 'zoom_in_breakout' || this.currentAction === 'macro_zoom_out')) {
                const newStart = this.startViewStart + (this.targetViewStart - this.startViewStart) * ease;
                const newEnd = this.startViewEnd + (this.targetViewEnd - this.startViewEnd) * ease;
                this.win.viewStart = newStart;
                this.win.viewEnd = newEnd;
            }

            if (progress >= 1.0) {
                // Hareket tamamlandı -> 500ms - 900ms DİNLENME/DURAKLAMA FAZINA GİR!
                this.state = 'pausing';
                this.stateStartTime = performance.now();
                this.pauseDuration = 500 + Math.random() * 450; // 0.5s ila 0.95s ara bekleme
            }
        }

        this.loopTimer = requestAnimationFrame(() => this.tick());
    }
}
