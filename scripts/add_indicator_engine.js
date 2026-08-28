import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const engineCode = `
        // ============================================================
        // ⚡ MODÜLER GÖSTERGE MOTORU VE SCRIPT ENGINE RUNTIME
        // ============================================================

        const BUILTIN_INDICATOR_DEFS = {
            'rsi': {
                id: 'rsi',
                name: 'RSI (Göreceli Güç Endeksi)',
                desc: '14 periyotluk momentum osilatörü [0 - 100]',
                type: 'subpane',
                defaultParams: { length: 14, color: '#a855f7', width: 2, upper: 70, lower: 30 }
            },
            'macd': {
                id: 'macd',
                name: 'MACD (Hareketli Ortalama Yakınsama)',
                desc: '12/26/9 Standart MACD Çizgisi, Sinyal ve Histogram',
                type: 'subpane',
                defaultParams: { fast: 12, slow: 26, signal: 9, macdColor: '#38bdf8', sigColor: '#f59e0b' }
            },
            'bollinger': {
                id: 'bollinger',
                name: 'Bollinger Bantları',
                desc: '20 periyot, 2.0 standart sapma volatilite kanalları',
                type: 'overlay',
                defaultParams: { length: 20, mult: 2.0, upperColor: '#38bdf8', lowerColor: '#38bdf8', basisColor: '#fbbf24', width: 1.5 }
            },
            'ema': {
                id: 'ema',
                name: 'EMA (Üstel Hareketli Ortalama)',
                desc: 'Fiyat ağırlıklı üstel ortalama (9, 21, 50, 200 vb.)',
                type: 'overlay',
                defaultParams: { length: 20, color: '#38bdf8', width: 2 }
            },
            'sma': {
                id: 'sma',
                name: 'SMA (Basit Hareketli Ortalama)',
                desc: 'Standart aritmetik hareketli ortalama',
                type: 'overlay',
                defaultParams: { length: 50, color: '#f59e0b', width: 2 }
            },
            'volume': {
                id: 'volume',
                name: 'Hacim (Volume + Vol SMA)',
                desc: 'Mum işlem hacmi ve 20 periyotluk hacim ortalaması',
                type: 'subpane',
                defaultParams: { smaLength: 20, showSma: true }
            },
            'supertrend': {
                id: 'supertrend',
                name: 'SuperTrend',
                desc: '10 ATR, 3.0 çarpanlı dinamik trend takip bantları',
                type: 'overlay',
                defaultParams: { period: 10, factor: 3.0 }
            },
            'atr': {
                id: 'atr',
                name: 'ATR (Average True Range)',
                desc: '14 periyotluk piyasa oynaklık/volatilite ölçeri',
                type: 'subpane',
                defaultParams: { period: 14, color: '#38bdf8', width: 2 }
            }
        };

        let activeIndicators = [];
        let editingIndicatorId = null;

        // --- HESAPLAMA MOTORU MATEMATİĞİ ---
        function calcIndicatorData(ind, candles) {
            if (!candles || candles.length === 0) return null;
            const p = ind.params;
            const closes = candles.map(c => c.close);

            if (ind.defId === 'rsi') {
                return { rsi: TechnicalCalculations.rsi(candles, p.length) };
            } else if (ind.defId === 'macd') {
                return TechnicalCalculations.macd(candles, p.fast, p.slow, p.signal);
            } else if (ind.defId === 'bollinger') {
                return TechnicalCalculations.bollingerBands(candles, p.length, p.mult);
            } else if (ind.defId === 'ema') {
                return { ema: TechnicalCalculations.ema(candles, p.length) };
            } else if (ind.defId === 'sma') {
                return { sma: TechnicalCalculations.sma(candles, p.length) };
            } else if (ind.defId === 'volume') {
                return TechnicalCalculations.volume(candles, p.smaLength);
            } else if (ind.defId === 'supertrend') {
                return TechnicalCalculations.supertrend(candles, p.period, p.factor);
            } else if (ind.defId === 'atr') {
                return { atr: TechnicalCalculations.atr(candles, p.period) };
            } else if (ind.defId === 'custom_script') {
                return ind.scriptResult;
            }
            return null;
        }

        function recalculateAllIndicators() {
            if (!candleDataBase || candleDataBase.length === 0) return;
            for (const ind of activeIndicators) {
                if (ind.defId === 'custom_script') {
                    const res = ScriptEngine.execute(ind.code, candleDataBase);
                    ind.scriptResult = res;
                } else {
                    ind.data = calcIndicatorData(ind, candleDataBase);
                }
            }
            syncSubpaneDOM();
        }

        // --- SUBPANE DOM YÖNETİMİ ---
        function syncSubpaneDOM() {
            const wrapper = document.getElementById('subpanes-wrapper');
            if (!wrapper) return;

            const subpanes = activeIndicators.filter(ind => ind.type === 'subpane' || (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots.some(pl => !pl.overlay)));
            
            // Mevcut pane ID'lerini kontrol et
            const existingIds = new Set();
            for (const el of wrapper.children) {
                const id = el.getAttribute('data-ind-id');
                if (id) existingIds.add(id);
            }

            // Silinenleri DOM'dan kaldır
            for (const id of existingIds) {
                if (!subpanes.some(s => s.id === id)) {
                    const el = wrapper.querySelector(\`[data-ind-id="\${id}"]\`);
                    if (el) el.remove();
                }
            }

            // Yeni eklenenleri DOM'a ekle
            for (const ind of subpanes) {
                if (!wrapper.querySelector(\`[data-ind-id="\${ind.id}"]\`)) {
                    const card = document.createElement('div');
                    card.className = 'subpane-container';
                    card.setAttribute('data-ind-id', ind.id);
                    card.innerHTML = \`
                        <div class="subpane-header">
                            <span class="subpane-title">\${ind.name}</span>
                            <span class="subpane-val" id="subpane-val-\${ind.id}">--</span>
                            <div class="subpane-actions">
                                <button class="subpane-btn" onclick="toggleIndicatorVis('\${ind.id}')" title="Gizle/Göster">\${ind.visible ? '👁️' : '🚫'}</button>
                                <button class="subpane-btn" onclick="openIndicatorSettings('\${ind.id}')" title="Ayarlar">⚙️</button>
                                <button class="subpane-btn" onclick="removeIndicator('\${ind.id}')" title="Kapat">✕</button>
                            </div>
                        </div>
                        <canvas class="subpane-canvas" id="subpane-canvas-\${ind.id}"></canvas>
                    \`;
                    wrapper.appendChild(card);
                }
            }

            const countEl = document.getElementById('active-ind-count');
            if (countEl) countEl.innerText = activeIndicators.length;
        }

        // --- SUBPANE CANVAS ÇİZİM MOTORU (60 FPS SENKRON) ---
        function renderAllSubpanes() {
            const subpanes = activeIndicators.filter(ind => ind.type === 'subpane' && ind.visible && ind.data);
            const w = canvasContainer ? canvasContainer.clientWidth : 800;
            const curStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
            const curEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
            const count = Math.max(1, curEnd - curStart);

            for (const ind of subpanes) {
                const cvs = document.getElementById(\`subpane-canvas-\${ind.id}\`);
                if (!cvs) continue;
                const dpr = window.devicePixelRatio || 1;
                const h = cvs.parentElement.clientHeight || 120;

                if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) {
                    cvs.width = Math.round(w * dpr);
                    cvs.height = Math.round(h * dpr);
                }

                const ctx = cvs.getContext('2d');
                ctx.save();
                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, w, h);

                if (ind.defId === 'rsi' && ind.data.rsi) {
                    const rsiArr = ind.data.rsi;
                    const col = ind.params.color || '#a855f7';
                    const upY = h - (ind.params.upper / 100) * h;
                    const loY = h - (ind.params.lower / 100) * h;

                    // 70 / 30 Bant Alanı
                    ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
                    ctx.fillRect(0, upY, w, loY - upY);

                    // Kesikli Referans Çizgileri
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(0, upY); ctx.lineTo(w, upY);
                    ctx.moveTo(0, loY); ctx.lineTo(w, loY);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // RSI Çizgisi
                    ctx.strokeStyle = col;
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;

                    for (let i = 0; i < totalCandles; i++) {
                        const val = rsiArr[i];
                        if (val === null || val === undefined) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - (val / 100) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Son Değer Etiketi
                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const curVal = rsiArr[lastIdx];
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && curVal !== null && curVal !== undefined) {
                        valEl.innerText = curVal.toFixed(2);
                        valEl.style.color = col;
                    }
                } else if (ind.defId === 'macd' && ind.data.macd) {
                    const { macd, signal, histogram } = ind.data;
                    let maxH = 0.01;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (macd[i] !== null) maxH = Math.max(maxH, Math.abs(macd[i]));
                        if (signal[i] !== null) maxH = Math.max(maxH, Math.abs(signal[i]));
                        if (histogram[i] !== null) maxH = Math.max(maxH, Math.abs(histogram[i]));
                    }
                    maxH *= 1.2;
                    const midY = h / 2;

                    // Sıfır Çizgisi
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.beginPath();
                    ctx.moveTo(0, midY); ctx.lineTo(w, midY);
                    ctx.stroke();

                    // Histogram Barları
                    const barW = Math.max(2, (w / count) * 0.7);
                    for (let i = 0; i < totalCandles; i++) {
                        const hist = histogram[i];
                        if (hist === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const barH = (hist / maxH) * (h / 2);
                        ctx.fillStyle = hist >= 0 ? '#10b981' : '#ef4444';
                        ctx.fillRect(x - barW / 2, midY, barW, -barH);
                    }

                    // MACD Çizgisi
                    ctx.strokeStyle = ind.params.macdColor || '#38bdf8';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const m = macd[i];
                        if (m === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = midY - (m / maxH) * (h / 2);
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Signal Çizgisi
                    ctx.strokeStyle = ind.params.sigColor || '#f59e0b';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const s = signal[i];
                        if (s === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = midY - (s / maxH) * (h / 2);
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && macd[lastIdx] !== null) {
                        valEl.innerText = \`MACD: \${macd[lastIdx].toFixed(2)} | Sinyal: \${signal[lastIdx] ? signal[lastIdx].toFixed(2) : '--'}\`;
                        valEl.style.color = '#38bdf8';
                    }
                } else if (ind.defId === 'volume' && ind.data.volume) {
                    const { volume: vols, volSma } = ind.data;
                    let maxV = 1;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (vols[i]) maxV = Math.max(maxV, vols[i]);
                    }
                    maxV *= 1.15;
                    const barW = Math.max(2, (w / count) * 0.7);

                    for (let i = 0; i < totalCandles; i++) {
                        const v = vols[i];
                        if (!v) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const barH = (v / maxV) * (h - 10);
                        const isUp = candleDataBase[i] && candleDataBase[i].close >= candleDataBase[i].open;
                        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
                        ctx.fillRect(x - barW / 2, h - barH, barW, barH);
                    }

                    if (ind.params.showSma && volSma) {
                        ctx.strokeStyle = '#38bdf8';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        let started = false;
                        for (let i = 0; i < totalCandles; i++) {
                            const vs = volSma[i];
                            if (vs === null) continue;
                            const x = ((i + 0.5 - curStart) / count) * w;
                            const y = h - (vs / maxV) * (h - 10);
                            if (!started) { ctx.moveTo(x, y); started = true; }
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && vols[lastIdx]) {
                        valEl.innerText = \`Hacim: \${vols[lastIdx].toLocaleString()} \${volSma && volSma[lastIdx] ? ' | SMA: ' + Math.round(volSma[lastIdx]).toLocaleString() : ''}\`;
                        valEl.style.color = '#38bdf8';
                    }
                } else if (ind.defId === 'atr' && ind.data.atr) {
                    const atrArr = ind.data.atr;
                    let minA = Infinity, maxA = -Infinity;
                    for (let i = Math.max(0, Math.floor(curStart)); i < Math.min(totalCandles, Math.ceil(curEnd)); i++) {
                        if (atrArr[i] !== null) {
                            minA = Math.min(minA, atrArr[i]);
                            maxA = Math.max(maxA, atrArr[i]);
                        }
                    }
                    if (minA === Infinity) { minA = 0; maxA = 1; }
                    const span = maxA - minA || 1;

                    ctx.strokeStyle = ind.params.color || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const a = atrArr[i];
                        if (a === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((a - minA) / span) * (h - 20) - 10;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    const lastIdx = hoveredCandleIdx >= 0 ? hoveredCandleIdx : totalCandles - 1;
                    const valEl = document.getElementById(\`subpane-val-\${ind.id}\`);
                    if (valEl && atrArr[lastIdx] !== null) {
                        valEl.innerText = atrArr[lastIdx].toFixed(2);
                        valEl.style.color = '#38bdf8';
                    }
                }

                // Dikey Crosshair Senkronizasyonu
                if (mouseCssX >= 0 && mouseCssX <= w) {
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
                    ctx.setLineDash([4, 4]);
                    ctx.beginPath();
                    ctx.moveTo(mouseCssX, 0); ctx.lineTo(mouseCssX, h);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                ctx.restore();
            }
        }

        // --- OVERLAY GÖSTERGELERİ ÇİZİM MOTORU (ANA GRAFİK ÜSTÜ) ---
        function renderOverlayIndicators(ctx, w, h, pMin, pMax, curStart, curEnd) {
            const overlays = activeIndicators.filter(ind => (ind.type === 'overlay' || (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots.some(pl => pl.overlay))) && ind.visible);
            const count = Math.max(1, curEnd - curStart);
            const pSpan = pMax - pMin;
            if (pSpan <= 0) return;

            for (const ind of overlays) {
                if (ind.defId === 'ema' && ind.data && ind.data.ema) {
                    const emaArr = ind.data.ema;
                    ctx.strokeStyle = ind.params.color || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = emaArr[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'sma' && ind.data && ind.data.sma) {
                    const smaArr = ind.data.sma;
                    ctx.strokeStyle = ind.params.color || '#f59e0b';
                    ctx.lineWidth = ind.params.width || 2;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = smaArr[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'bollinger' && ind.data && ind.data.basis) {
                    const { basis, upper, lower } = ind.data;
                    
                    // Orta Bant (Basis)
                    ctx.strokeStyle = ind.params.basisColor || '#fbbf24';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    let started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = basis[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // Üst ve Alt Bantlar
                    ctx.strokeStyle = ind.params.upperColor || '#38bdf8';
                    ctx.lineWidth = ind.params.width || 1.5;
                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = upper[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    ctx.beginPath();
                    started = false;
                    for (let i = 0; i < totalCandles; i++) {
                        const val = lower[i];
                        if (val === null) continue;
                        const x = ((i + 0.5 - curStart) / count) * w;
                        const y = h - ((val - pMin) / pSpan) * h;
                        if (!started) { ctx.moveTo(x, y); started = true; }
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                } else if (ind.defId === 'supertrend' && ind.data && ind.data.superTrend) {
                    const { superTrend, direction } = ind.data;
                    ctx.lineWidth = 2;
                    for (let i = 1; i < totalCandles; i++) {
                        const st1 = superTrend[i - 1];
                        const st2 = superTrend[i];
                        if (st1 === null || st2 === null) continue;
                        const x1 = ((i - 1 + 0.5 - curStart) / count) * w;
                        const y1 = h - ((st1 - pMin) / pSpan) * h;
                        const x2 = ((i + 0.5 - curStart) / count) * w;
                        const y2 = h - ((st2 - pMin) / pSpan) * h;

                        ctx.strokeStyle = direction[i] === 1 ? '#10b981' : '#ef4444';
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                } else if (ind.defId === 'custom_script' && ind.scriptResult && ind.scriptResult.plots) {
                    for (const pl of ind.scriptResult.plots) {
                        if (!pl.overlay) continue;
                        ctx.strokeStyle = pl.color || '#38bdf8';
                        ctx.lineWidth = pl.linewidth || 2;
                        ctx.beginPath();
                        let started = false;
                        for (let i = 0; i < totalCandles; i++) {
                            const val = pl.series[i];
                            if (val === null || val === undefined) continue;
                            const x = ((i + 0.5 - curStart) / count) * w;
                            const y = h - ((val - pMin) / pSpan) * h;
                            if (!started) { ctx.moveTo(x, y); started = true; }
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                    }
                }
            }
        }

        // --- GÖSTERGE EKLEME / SİLME / AYARLAMA ---
        window.openIndicatorModal = function() {
            const modal = document.getElementById('fx-modal-backdrop');
            if (modal) {
                modal.classList.add('active');
                renderFxModalList('tech');
            }
        };

        window.closeIndicatorModal = function(e) {
            if (e && e.target !== e.currentTarget && !e.target.classList.contains('fx-modal-close')) return;
            const modal = document.getElementById('fx-modal-backdrop');
            if (modal) modal.classList.remove('active');
        };

        window.switchFxTab = function(tab) {
            document.getElementById('fx-tab-tech').classList.toggle('active', tab === 'tech');
            document.getElementById('fx-tab-active').classList.toggle('active', tab === 'active');
            renderFxModalList(tab);
        };

        window.filterIndicators = function(query) {
            const activeTab = document.getElementById('fx-tab-tech').classList.contains('active') ? 'tech' : 'active';
            renderFxModalList(activeTab, query.toLowerCase());
        };

        function renderFxModalList(tab, query = '') {
            const container = document.getElementById('fx-modal-body');
            if (!container) return;
            let html = '';

            if (tab === 'tech') {
                const defs = Object.values(BUILTIN_INDICATOR_DEFS).filter(d => 
                    d.name.toLowerCase().includes(query) || d.desc.toLowerCase().includes(query)
                );
                for (const def of defs) {
                    html += \`
                        <div class="fx-indicator-row">
                            <div class="fx-ind-info">
                                <span class="fx-ind-name">\${def.name}</span>
                                <span class="fx-ind-desc">\${def.desc}</span>
                            </div>
                            <button class="fx-btn-add" onclick="addIndicator('\${def.id}')">➕ Ekle</button>
                        </div>
                    \`;
                }
            } else {
                if (activeIndicators.length === 0) {
                    html = '<div style="text-align: center; color: #64748b; padding: 30px;">Grafikte aktif gösterge bulunmuyor.</div>';
                } else {
                    for (const ind of activeIndicators) {
                        html += \`
                            <div class="fx-indicator-row">
                                <div class="fx-ind-info">
                                    <span class="fx-ind-name">\${ind.name}</span>
                                    <span class="fx-ind-desc">\${ind.type === 'overlay' ? 'Grafik Üstü Katman' : 'Alt Panel'}</span>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <button class="pine-btn" onclick="toggleIndicatorVis('\${ind.id}')">\${ind.visible ? '👁️ Açık' : '🚫 Kapalı'}</button>
                                    <button class="pine-btn" onclick="openIndicatorSettings('\${ind.id}')">⚙️ Ayarlar</button>
                                    <button class="pine-btn" style="color: #ef4444; border-color: #ef4444;" onclick="removeIndicator('\${ind.id}')">🗑️ Sil</button>
                                </div>
                            </div>
                        \`;
                    }
                }
            }
            container.innerHTML = html;
        }

        window.addIndicator = function(defId) {
            const def = BUILTIN_INDICATOR_DEFS[defId];
            if (!def) return;
            const newInd = {
                id: 'ind_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                defId: def.id,
                name: def.name,
                type: def.type,
                params: JSON.parse(JSON.stringify(def.defaultParams)),
                visible: true,
                data: null
            };
            activeIndicators.push(newInd);
            recalculateAllIndicators();
            renderFxModalList('tech');
            const toastText = \`\${def.name} grafiğe eklendi!\`;
            console.log(toastText);
        };

        window.removeIndicator = function(id) {
            activeIndicators = activeIndicators.filter(ind => ind.id !== id);
            recalculateAllIndicators();
            renderFxModalList('active');
        };

        window.toggleIndicatorVis = function(id) {
            const ind = activeIndicators.find(i => i.id === id);
            if (ind) {
                ind.visible = !ind.visible;
                syncSubpaneDOM();
                renderFxModalList('active');
            }
        };

        // --- GÖSTERGE AYARLARI MODALI ---
        window.openIndicatorSettings = function(id) {
            const ind = activeIndicators.find(i => i.id === id);
            if (!ind) return;
            editingIndicatorId = id;
            const modal = document.getElementById('fx-settings-modal');
            const titleEl = document.getElementById('fx-settings-title');
            const bodyEl = document.getElementById('fx-settings-body');
            if (titleEl) titleEl.innerText = \`⚙️ \${ind.name} Ayarları\`;

            let fieldsHtml = '';
            for (const [k, v] of Object.entries(ind.params)) {
                if (typeof v === 'number') {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()}:</label>
                            <input type="number" id="setting-\${k}" value="\${v}" step="\${k === 'mult' || k === 'factor' ? '0.1' : '1'}">
                        </div>
                    \`;
                } else if (typeof v === 'string' && v.startsWith('#')) {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()} RENK:</label>
                            <input type="color" id="setting-\${k}" value="\${v}">
                        </div>
                    \`;
                } else if (typeof v === 'boolean') {
                    fieldsHtml += \`
                        <div class="fx-setting-item">
                            <label>\${k.toUpperCase()}:</label>
                            <input type="checkbox" id="setting-\${k}" \${v ? 'checked' : ''}>
                        </div>
                    \`;
                }
            }
            if (bodyEl) bodyEl.innerHTML = fieldsHtml;
            if (modal) modal.classList.add('active');
        };

        window.closeIndicatorSettings = function(e) {
            if (e && e.target !== e.currentTarget && !e.target.classList.contains('fx-modal-close') && e.target.tagName !== 'BUTTON') return;
            const modal = document.getElementById('fx-settings-modal');
            if (modal) modal.classList.remove('active');
            editingIndicatorId = null;
        };

        window.saveIndicatorSettings = function() {
            const ind = activeIndicators.find(i => i.id === editingIndicatorId);
            if (!ind) return;

            for (const k of Object.keys(ind.params)) {
                const el = document.getElementById(\`setting-\${k}\`);
                if (el) {
                    if (el.type === 'number') ind.params[k] = parseFloat(el.value);
                    else if (el.type === 'checkbox') ind.params[k] = el.checked;
                    else ind.params[k] = el.value;
                }
            }
            recalculateAllIndicators();
            closeIndicatorSettings();
        };

        // --- PINE / SCRIPT EDİTÖRÜ ENTEGRASYONU ---
        window.toggleScriptEditor = function() {
            const panel = document.getElementById('pine-editor-panel');
            if (panel) panel.classList.toggle('active');
        };

        window.loadScriptTemplate = function(idx) {
            if (idx === '') return;
            const tpls = ScriptEngine.getTemplates();
            const tpl = tpls[parseInt(idx, 10)];
            if (tpl) {
                const editor = document.getElementById('pine-code-editor');
                if (editor) editor.value = tpl.code;
            }
        };

        window.clearPineScript = function() {
            const editor = document.getElementById('pine-code-editor');
            if (editor) editor.value = '';
            const consoleEl = document.getElementById('pine-console');
            if (consoleEl) {
                consoleEl.className = 'pine-console';
                consoleEl.innerText = 'Temizlendi.';
            }
        };

        window.runPineScript = function() {
            const editor = document.getElementById('pine-code-editor');
            const consoleEl = document.getElementById('pine-console');
            if (!editor || !consoleEl) return;
            const code = editor.value;

            const res = ScriptEngine.execute(code, candleDataBase);
            if (!res.success) {
                consoleEl.className = 'pine-console error';
                consoleEl.innerText = '❌ Hata: ' + res.error;
                return;
            }

            consoleEl.className = 'pine-console';
            consoleEl.innerText = \`✓ Başarılı: \${res.plots.length} adet çizim grafiğe eklendi.\`;

            // Mevcut scripti güncelle veya yeni ekle
            activeIndicators = activeIndicators.filter(i => i.defId !== 'custom_script');
            activeIndicators.push({
                id: 'custom_script_' + Date.now(),
                defId: 'custom_script',
                name: 'Özel Script / Formül',
                type: res.plots.some(p => p.overlay) ? 'overlay' : 'subpane',
                code,
                scriptResult: res,
                visible: true
            });
            recalculateAllIndicators();
        };
`;

// Insert engineCode before renderOverlay function
content = content.replace(
    '        function renderOverlay(now) {',
    engineCode + '\n        function renderOverlay(now) {'
);

// Call renderAllSubpanes inside renderOverlay & renderOverlayIndicators
const oldOverlayInner = `            drawingsCtx.save();
            drawingsCtx.scale(dpr, dpr);
            drawingsCtx.clearRect(0, 0, cssW, cssH);`;

const newOverlayInner = `            drawingsCtx.save();
            drawingsCtx.scale(dpr, dpr);
            drawingsCtx.clearRect(0, 0, cssW, cssH);

            // ⚡ 1. Modüler Overlay Göstergeleri (EMA, SMA, Bollinger, SuperTrend, Scriptler)
            renderOverlayIndicators(drawingsCtx, cssW, cssH, minPrice, maxPrice, curStart, curEnd);

            // ⚡ 2. Alt Panelleri Render Et (RSI, MACD, Hacim, ATR)
            renderAllSubpanes();`;

content = content.replace(oldOverlayInner, newOverlayInner);

// Call recalculateAllIndicators when new candle data arrives or depth changes
content = content.replace(
    'totalCandles = candleDataBase.length;',
    'totalCandles = candleDataBase.length;\n                recalculateAllIndicators();'
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully injected complete indicator engine and script runtime into HTML!');
