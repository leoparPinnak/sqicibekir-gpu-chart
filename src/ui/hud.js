/**
 * Kullanıcı Arayüzü & HUD Yöneticisi
 */

export function formatTimeLabelWithYear(date) {
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const mon = date.toLocaleString('tr-TR', { month: 'short' });
    return `${dd} ${mon} <b>${yyyy}</b> ${hh}:${mm}`;
}

export function formatFullTime(date) {
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const mon = date.toLocaleString('tr-TR', { month: 'short' });
    return `${dd} ${mon} ${yyyy} ${hh}:${mm}`;
}

export class HUDManager {
    constructor() {
        this.dom = {
            loadingOverlay: document.getElementById('loading-overlay'),
            priceVal: document.getElementById('price-val'),
            wsDot: document.getElementById('ws-dot'),
            hud1dRegime: document.getElementById('hud-1d-regime'),
            hud4hEma: document.getElementById('hud-4h-ema'),
            hud1hCloud: document.getElementById('hud-1h-cloud'),
            hudTrend: document.getElementById('hud-trend'),
            ohlcO: document.getElementById('ohlc-o'),
            ohlcH: document.getElementById('ohlc-h'),
            ohlcL: document.getElementById('ohlc-l'),
            ohlcC: document.getElementById('ohlc-c'),
            ohlcAtr: document.getElementById('ohlc-atr'),
            lastSignalBanner: document.getElementById('last-signal-banner'),
            lastSignalText: document.getElementById('last-signal-text'),
            crosshairTimeTag: document.getElementById('crosshair-time-tag'),
            crosshairPriceTag: document.getElementById('crosshair-price-tag'),
            currentPriceBadge: document.getElementById('current-price-badge'),
            priceLabelsContainer: document.getElementById('price-labels-container'),
            timeLabelsContainer: document.getElementById('time-labels-container'),
            fpsStat: document.getElementById('fps-stat'),
            visibleCandlesStat: document.getElementById('visible-candles-stat'),
            totalCandlesStat: document.getElementById('total-candles-stat')
        };
    }

    setLoading(visible, msg = '⏳ Veriler Yükleniyor...') {
        this.dom.loadingOverlay.style.display = visible ? 'block' : 'none';
        if (visible) this.dom.loadingOverlay.innerText = msg;
    }

    setWsStatus(status) {
        if (status === 'connected') {
            this.dom.wsDot.style.background = '#10b981';
            this.dom.wsDot.style.boxShadow = '0 0 8px #10b981';
        } else if (status === 'error') {
            this.dom.wsDot.style.background = '#ef4444';
        } else {
            this.dom.wsDot.style.background = '#f59e0b';
        }
    }

    updatePriceHeader(price) {
        this.dom.priceVal.innerText = price.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    updateHUD(candleData, calcResult) {
        const total = candleData.length;
        if (total === 0 || !calcResult) return;

        this.dom.totalCandlesStat.innerText = total;

        const lastIdx = total - 1;
        const lastRegime = calcResult.lastRegime1DArr[lastIdx];
        const lastClose = candleData[lastIdx].close;
        const last4HEma = calcResult.ema4HLive[lastIdx];
        const lastSa = calcResult.sa1H[lastIdx];
        const lastSb = calcResult.sb1H[lastIdx];

        // 1D Rejim
        if (lastRegime > 0.5) {
            this.dom.hud1dRegime.innerText = 'BOĞA (YEŞİL)';
            this.dom.hud1dRegime.className = 'hud-tag tag-bull';
        } else if (lastRegime < -0.5) {
            this.dom.hud1dRegime.innerText = 'AYI (KIRMIZI)';
            this.dom.hud1dRegime.className = 'hud-tag tag-bear';
        } else {
            this.dom.hud1dRegime.innerText = 'NÖTR';
            this.dom.hud1dRegime.className = 'hud-tag tag-neutral';
        }

        // 4H EMA
        if (lastClose > last4HEma) {
            this.dom.hud4hEma.innerText = 'ÜSTÜNDE (BOĞA)';
            this.dom.hud4hEma.className = 'hud-tag tag-bull';
        } else {
            this.dom.hud4hEma.innerText = 'ALTINDA (AYI)';
            this.dom.hud4hEma.className = 'hud-tag tag-bear';
        }

        // 1H Bulut
        if (lastClose > Math.max(lastSa, lastSb)) {
            this.dom.hud1hCloud.innerText = 'ÜSTÜNDE (BOĞA)';
            this.dom.hud1hCloud.className = 'hud-tag tag-bull';
        } else if (lastClose < Math.min(lastSa, lastSb)) {
            this.dom.hud1hCloud.innerText = 'ALTINDA (AYI)';
            this.dom.hud1hCloud.className = 'hud-tag tag-bear';
        } else {
            this.dom.hud1hCloud.innerText = 'BULUT İÇİNDE';
            this.dom.hud1hCloud.className = 'hud-tag tag-neutral';
        }

        // Ana Yön
        if (lastRegime > 0.5 && lastClose > last4HEma) {
            this.dom.hudTrend.innerText = 'GÜÇLÜ BOĞA 🚀';
            this.dom.hudTrend.className = 'hud-tag tag-bull';
        } else if (lastRegime < -0.5 && lastClose < last4HEma) {
            this.dom.hudTrend.innerText = 'GÜÇLÜ AYI 🔻';
            this.dom.hudTrend.className = 'hud-tag tag-bear';
        } else {
            this.dom.hudTrend.innerText = 'KARISIK / NÖTR';
            this.dom.hudTrend.className = 'hud-tag tag-neutral';
        }

        // Son Sinyal Kartı
        if (calcResult.lastFoundSignal) {
            this.dom.lastSignalBanner.style.display = 'flex';
            this.dom.lastSignalText.innerText =
                `⚡ SON SİNYAL: ${calcResult.lastFoundSignal.type} @ $${calcResult.lastFoundSignal.price.toFixed(2)} | SL: $${calcResult.lastFoundSignal.sl.toFixed(2)} | TP: $${calcResult.lastFoundSignal.tp.toFixed(2)}`;
        }
    }

    updatePriceScaleLabels(minPrice, maxPrice, lastClose) {
        if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice >= maxPrice) return;
        const levels = 8;
        let html = '';
        for (let i = 0; i <= levels; i++) {
            const pct = i / levels;
            const priceAtLevel = minPrice + pct * (maxPrice - minPrice);
            const topPct = (1 - pct) * 100;
            html += `<div class="price-scale-label" style="top: ${topPct}%;">${priceAtLevel.toFixed(2)}</div>`;
        }
        this.dom.priceLabelsContainer.innerHTML = html;

        if (lastClose) {
            const lastCloseNorm = (lastClose - minPrice) / (maxPrice - minPrice);
            const lastCloseTop = (1 - lastCloseNorm) * 100;
            this.dom.currentPriceBadge.style.top = `${lastCloseTop}%`;
            this.dom.currentPriceBadge.innerText = lastClose.toFixed(2);
        }
    }

    updateTimeScaleLabels(candleData, viewStart, viewEnd) {
        const total = candleData.length;
        if (total === 0) return;
        const count = 6;
        const visibleCount = Math.max(1, viewEnd - viewStart);
        let html = '';

        for (let i = 0; i <= count; i++) {
            const pct = i / count;
            const candleIdx = Math.min(total - 1, Math.max(0, Math.floor(viewStart + pct * visibleCount)));
            const c = candleData[candleIdx];
            if (c && c.time) {
                const date = new Date(c.time);
                const labelStr = formatTimeLabelWithYear(date);
                const leftPct = pct * 100;
                html += `<div class="time-scale-label" style="left: ${leftPct}%;">${labelStr}</div>`;
            }
        }
        this.dom.timeLabelsContainer.innerHTML = html;
    }
}
