/**
 * 🎬 TradeChart Cinematic Autonomous Camera Director
 * Arka planda grafiği akıcı, estetik ve profesyonel sinematik kamera hareketleriyle yönetir:
 * 1. Yana Kaydırma (Horizontal Pan Glide - İleri / Geri)
 * 2. Zoom In (Odaklı Yakınlaşma)
 * 3. Zoom Out (Geniş Açıya Uzaklaşma)
 * 4. Kombine Hareket: Yana Kayarken Zoom In (Drone Pan-Zoom In)
 * 5. Kombine Hareket: Yana Kayarken Zoom Out (Drone Pan-Zoom Out)
 * (Space oto ölçeklendirme animasyonu demodan kaldırılmıştır)
 * Her hareket bitiminde 0.5s - 1.0s dinlenme/bekleme uygulanır.
 */

export class CinematicCameraDirector {
    constructor(chartWindow) {
        this.win = chartWindow;
        this.isRunning = false;
        
        // Durumlar: 'initial_center' | 'moving' | 'pausing'
        this.state = 'initial_center';
        this.currentAction = 'pan_lateral';
        
        this.stateStartTime = performance.now();
        this.actionDuration = 4500; // ms
        this.pauseDuration = 750;   // 0.75s dinlenme

        // Kamera hedefleri (viewStart ve viewEnd)
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
        
        // İlk açılışta 1.0 saniye merkezde durağan bekle, sonra akışı başlat
        this.state = 'pausing';
        this.stateStartTime = performance.now();
        this.pauseDuration = 1000;

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

        // Ekranın tam ortasında 75 mumluk dengeli başlangıç kadrajı
        const initialCount = Math.min(total, 75);
        const centerIdx = Math.round(total * 0.55);
        const s = Math.max(0, centerIdx - Math.round(initialCount * 0.5));
        const e = s + initialCount;

        this.win.viewStart = s;
        this.win.viewEnd = e;
        if (this.win.smoothViewStart !== undefined) this.win.smoothViewStart = s;
        if (this.win.smoothViewEnd !== undefined) this.win.smoothViewEnd = e;
    }

    pickNewAction() {
        if (!this.win || !this.win.totalCandles || this.win.totalCandles < 30) return;

        // Sadece Pan, Zoom In, Zoom Out ve Kombine (Pan + Zoom) hareketleri
        const actions = [
            'pan_lateral',
            'zoom_in',
            'zoom_out',
            'pan_and_zoom_in',
            'pan_and_zoom_out'
        ];

        const next = actions[Math.floor(Math.random() * actions.length)];
        this.currentAction = next;
        this.state = 'moving';
        this.stateStartTime = performance.now();
        this.actionDuration = 3800 + Math.random() * 3200; // 3.8s - 7.0s akıcı hareket süresi

        const curStart = this.win.viewStart;
        const curEnd = this.win.viewEnd;
        const total = this.win.totalCandles;
        const curCount = Math.max(20, curEnd - curStart);
        const curCenter = (curStart + curEnd) * 0.5;

        this.startViewStart = curStart;
        this.startViewEnd = curEnd;

        switch (next) {
            case 'pan_lateral': {
                // 1. SADECE YANA KAYDIRMA (İleri veya geri yatay süzülme)
                const deltaCandles = (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 70);
                let tStart = curStart + deltaCandles;
                let tEnd = curEnd + deltaCandles;
                if (tStart < 0) { tStart = 0; tEnd = curCount; }
                if (tEnd > total) { tEnd = total; tStart = Math.max(0, total - curCount); }
                this.targetViewStart = tStart;
                this.targetViewEnd = tEnd;
                break;
            }
            case 'zoom_in': {
                // 2. SADECE ZOOM IN (Mevcut merkeze doğru yaklaşma, 35-55 mum)
                const targetCount = 35 + Math.random() * 20;
                this.targetViewStart = Math.max(0, curCenter - targetCount * 0.5);
                this.targetViewEnd = Math.min(total, this.targetViewStart + targetCount);
                break;
            }
            case 'zoom_out': {
                // 3. SADECE ZOOM OUT (Mevcut merkezden geniş açıya uzaklaşma, 140-240 mum)
                const targetCount = Math.min(total, 140 + Math.random() * 100);
                this.targetViewStart = Math.max(0, curCenter - targetCount * 0.5);
                this.targetViewEnd = Math.min(total, this.targetViewStart + targetCount);
                break;
            }
            case 'pan_and_zoom_in': {
                // 4. KOMBİNE: YANA KAYARKEN AYNI ANDA ZOOM IN
                const deltaCenter = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60);
                const targetCount = 40 + Math.random() * 25; // Yakınlaşma
                const targetCenter = Math.max(targetCount * 0.6, Math.min(total - targetCount * 0.6, curCenter + deltaCenter));
                this.targetViewStart = Math.max(0, targetCenter - targetCount * 0.5);
                this.targetViewEnd = Math.min(total, this.targetViewStart + targetCount);
                break;
            }
            case 'pan_and_zoom_out': {
                // 5. KOMBİNE: YANA KAYARKEN AYNI ANDA ZOOM OUT
                const deltaCenter = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 60);
                const targetCount = Math.min(total, 150 + Math.random() * 90); // Uzaklaşma
                const targetCenter = Math.max(targetCount * 0.6, Math.min(total - targetCount * 0.6, curCenter + deltaCenter));
                this.targetViewStart = Math.max(0, targetCenter - targetCount * 0.5);
                this.targetViewEnd = Math.min(total, this.targetViewStart + targetCount);
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
                // Bekleme süresi bitti, sıradaki harekete başla
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

            if (this.win) {
                const newStart = this.startViewStart + (this.targetViewStart - this.startViewStart) * ease;
                const newEnd = this.startViewEnd + (this.targetViewEnd - this.startViewEnd) * ease;
                this.win.viewStart = newStart;
                this.win.viewEnd = newEnd;
            }

            if (progress >= 1.0) {
                // Hareket tamamlandı -> 500ms - 950ms DİNLENME FAZINA GİR
                this.state = 'pausing';
                this.stateStartTime = performance.now();
                this.pauseDuration = 500 + Math.random() * 450; // 0.5s ila 0.95s ara bekleme
            }
        }

        this.loopTimer = requestAnimationFrame(() => this.tick());
    }
}
