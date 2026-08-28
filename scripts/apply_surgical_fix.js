import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Remove #visible-backtest-card DOM
const cardHtml = `                            <!-- GÖRÜNEN EKRAN KÜMÜLATİF BACKTEST ROZETİ -->
                            <div class="visible-backtest-card" id="visible-backtest-card">
                                <div class="vbt-header">
                                    <span class="active-strat-title" id="vbt-strat-title">4. ASİMETRİK PRO (BUY1: 2.2x, BUY2: 4.0x, SELL: 2.5x)</span>
                                    <span id="vbt-candle-span" style="color: #38bdf8; font-weight: 700; font-size: 11px;">Görünen: 150 / Toplam: 3.000 Mum</span>
                                </div>
                                <div class="vbt-row">
                                    <span>Görünen Sinyaller: <b id="vbt-total-sig" style="color: #f8fafc;">0</b> (Kazanma: <b id="vbt-tp-count" style="color: #10b981;">0</b> | Stop: <b id="vbt-sl-count" style="color: #ef4444;">0</b> | Açık: <b id="vbt-open-count" style="color: #38bdf8;">0</b>)</span>
                                    <span>Kazanma: <span class="bt-stat-badge bt-win" id="vbt-winrate">%0.0</span></span>
                                </div>
                                <div class="vbt-row" style="background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 5px;">
                                    <span>Portföy Simülasyonu ($1,000 Giriş):</span>
                                    <span id="vbt-final-balance" class="pnl-badge-up">$1,000.00</span>
                                </div>
                                <div class="vbt-row">
                                    <span>Kümülatif Net Kâr/Zarar:</span>
                                    <span id="vbt-net-pnl" class="pnl-badge-up">+%0.00</span>
                                </div>
                            </div>`;

content = content.replace(cardHtml, '<!-- Backtest overlay box removed -->');

// 2. Add active states to CSS
const cssSearch = `.tv-prop-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }`;
const cssReplace = `.tv-prop-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
        .tv-prop-color-dot.active {
            box-shadow: 0 0 0 2px #ffffff, 0 0 8px rgba(255, 255, 255, 0.8);
            transform: scale(1.22);
        }
        .tv-prop-btn.active {
            background: #2962ff !important;
            color: #ffffff !important;
            font-weight: 700;
        }`;
content = content.replace(cssSearch, cssReplace);

// 3. Update property toolbar HTML to have ids and pass event
const oldPropHtml = `                        <!-- ️ ÇİZİM SEÇİM KAYAN AYAR ÇUBUĞU -->
                        <div class="tv-property-toolbar" id="tv-prop-toolbar">
                            <div class="tv-prop-color-dot" style="background: #38bdf8;" onclick="setDrawingColor('#38bdf8')"></div>
                            <div class="tv-prop-color-dot" style="background: #10b981;" onclick="setDrawingColor('#10b981')"></div>
                            <div class="tv-prop-color-dot" style="background: #ef4444;" onclick="setDrawingColor('#ef4444')"></div>
                            <div class="tv-prop-color-dot" style="background: #f59e0b;" onclick="setDrawingColor('#f59e0b')"></div>
                            <div class="tv-prop-color-dot" style="background: #a855f7;" onclick="setDrawingColor('#a855f7')"></div>
                            <div class="tv-prop-color-dot" style="background: #ffffff;" onclick="setDrawingColor('#ffffff')"></div>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn" onclick="setDrawingWidth(1)">1px</button>
                            <button class="tv-prop-btn" onclick="setDrawingWidth(2)">2px</button>
                            <button class="tv-prop-btn" onclick="setDrawingWidth(4)">4px</button>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn" onclick="setDrawingStyle('solid')" title="Düz Çizgi">—</button>
                            <button class="tv-prop-btn" onclick="setDrawingStyle('dashed')" title="Kesikli Çizgi">---</button>
                            <button class="tv-prop-btn" onclick="setDrawingStyle('dotted')" title="Noktalı Çizgi">···</button>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn delete" onclick="deleteSelectedDrawing()" title="Çizimi Sil"><svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor"><path d="M18 7h5v1h-2l-1.3 14.6a1.5 1.5 0 0 1-1.5 1.4H9.8a1.5 1.5 0 0 1-1.5-1.4L7 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4Z"></path></svg></button>
                        </div>`;

const newPropHtml = `                        <!-- ÇİZİM SEÇİM KAYAN AYAR ÇUBUĞU -->
                        <div class="tv-property-toolbar" id="tv-prop-toolbar">
                            <div class="tv-prop-color-dot" id="dot-color-38bdf8" style="background: #38bdf8;" onclick="setDrawingColor('#38bdf8', event)" title="Açık Mavi"></div>
                            <div class="tv-prop-color-dot" id="dot-color-10b981" style="background: #10b981;" onclick="setDrawingColor('#10b981', event)" title="Yeşil (Kâr / Boğa)"></div>
                            <div class="tv-prop-color-dot" id="dot-color-ef4444" style="background: #ef4444;" onclick="setDrawingColor('#ef4444', event)" title="Kırmızı (Stop / Ayı)"></div>
                            <div class="tv-prop-color-dot" id="dot-color-f59e0b" style="background: #f59e0b;" onclick="setDrawingColor('#f59e0b', event)" title="Altın Sarısı"></div>
                            <div class="tv-prop-color-dot" id="dot-color-a855f7" style="background: #a855f7;" onclick="setDrawingColor('#a855f7', event)" title="Mor"></div>
                            <div class="tv-prop-color-dot" id="dot-color-ffffff" style="background: #ffffff;" onclick="setDrawingColor('#ffffff', event)" title="Beyaz"></div>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn" id="prop-w-1" onclick="setDrawingWidth(1, event)" title="1px İnce">1px</button>
                            <button class="tv-prop-btn" id="prop-w-2" onclick="setDrawingWidth(2, event)" title="2px Orta">2px</button>
                            <button class="tv-prop-btn" id="prop-w-4" onclick="setDrawingWidth(4, event)" title="4px Kalın">4px</button>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn" id="prop-style-solid" onclick="setDrawingStyle('solid', event)" title="Düz Çizgi">—</button>
                            <button class="tv-prop-btn" id="prop-style-dashed" onclick="setDrawingStyle('dashed', event)" title="Kesikli Çizgi">---</button>
                            <button class="tv-prop-btn" id="prop-style-dotted" onclick="setDrawingStyle('dotted', event)" title="Noktalı Çizgi">···</button>
                            <span style="width: 1px; height: 16px; background: #2a2e39; margin: 0 2px;"></span>
                            <button class="tv-prop-btn delete" onclick="deleteSelectedDrawing(event)" title="Seçili Çizimi Sil"><svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor"><path d="M18 7h5v1h-2l-1.3 14.6a1.5 1.5 0 0 1-1.5 1.4H9.8a1.5 1.5 0 0 1-1.5-1.4L7 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4Z"></path></svg></button>
                        </div>`;

content = content.replace(oldPropHtml, newPropHtml);

// 4. Update toggleBacktestMode
content = content.replace(
    /window\.toggleBacktestMode = function\(\) \{[\s\S]*?vbtCard\.style\.display = isBacktestActive \? 'flex' : 'none';\s*\};/,
    `window.toggleBacktestMode = function() {
            isBacktestActive = !isBacktestActive;
            const btn = document.getElementById('btn-backtest');
            if (btn) {
                btn.classList.toggle('active', isBacktestActive);
                btn.innerText = isBacktestActive ? 'Backtest: AÇIK' : 'Backtest Modu';
            }
        };`
);

// 5. Update updateVisibleBacktestSummary safely
const oldVbtUpdate = `            document.getElementById('vbt-total-sig').innerText = visibleSignals.length;
            document.getElementById('vbt-tp-count').innerText = tpCount;
            document.getElementById('vbt-sl-count').innerText = slCount;
            document.getElementById('vbt-open-count').innerText = openCount;
            document.getElementById('vbt-winrate').innerText = \`%\${winRate}\`;

            const finalBalanceElem = document.getElementById('vbt-final-balance');
            const netPnlElem = document.getElementById('vbt-net-pnl');

            finalBalanceElem.innerText = \`$\${currentCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
            
            if (netPnlPct >= 0) {
                finalBalanceElem.className = 'pnl-badge-up';
                netPnlElem.className = 'pnl-badge-up';
                netPnlElem.innerText = \`+\${netPnlPct.toFixed(2)}% (+$$\{(currentCapital - initialCapital).toFixed(2)})\`;
            } else {
                finalBalanceElem.className = 'pnl-badge-down';
                netPnlElem.className = 'pnl-badge-down';
                netPnlElem.innerText = \`\${netPnlPct.toFixed(2)}% (-$$\{(initialCapital - currentCapital).toFixed(2)})\`;
            }`;

const newVbtUpdate = `            const vbtTotal = document.getElementById('vbt-total-sig');
            if (vbtTotal) {
                vbtTotal.innerText = visibleSignals.length;
                const tpElem = document.getElementById('vbt-tp-count'); if (tpElem) tpElem.innerText = tpCount;
                const slElem = document.getElementById('vbt-sl-count'); if (slElem) slElem.innerText = slCount;
                const openElem = document.getElementById('vbt-open-count'); if (openElem) openElem.innerText = openCount;
                const winRateElem = document.getElementById('vbt-winrate'); if (winRateElem) winRateElem.innerText = \`%\${winRate}\`;
                const finalBalanceElem = document.getElementById('vbt-final-balance');
                const netPnlElem = document.getElementById('vbt-net-pnl');
                if (finalBalanceElem) {
                    finalBalanceElem.innerText = \`$\${currentCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
                    finalBalanceElem.className = netPnlPct >= 0 ? 'pnl-badge-up' : 'pnl-badge-down';
                }
                if (netPnlElem) {
                    netPnlElem.className = netPnlPct >= 0 ? 'pnl-badge-up' : 'pnl-badge-down';
                    netPnlElem.innerText = netPnlPct >= 0 ? \`+\${netPnlPct.toFixed(2)}% (+$$\{(currentCapital - initialCapital).toFixed(2)})\` : \`\${netPnlPct.toFixed(2)}% (-$$\{(initialCapital - currentCapital).toFixed(2)})\`;
                }
            }`;

content = content.replace(oldVbtUpdate, newVbtUpdate);

// 6. Fix mousedown and touchstart in canvasContainer to avoid pan while drawing
content = content.replace(
    /canvasContainer\.addEventListener\('mousedown', \(e\) => \{\s*startPan\(e\.clientX, e\.clientY\);\s*\}\);/,
    `canvasContainer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (drawingEngine) {
                if (drawingEngine.activeTool !== 'cursor') return; // Çizim aracı etkinken grafik kaymaz
                const rect = canvasContainer.getBoundingClientRect();
                const hit = drawingEngine.hitTest(e.clientX - rect.left, e.clientY - rect.top);
                if (hit.drawing || hit.handleIdx !== -1) return; // Çizim veya tutamaç seçilirken grafik kaymaz
            }
            startPan(e.clientX, e.clientY);
        });`
);

content = content.replace(
    /canvasContainer\.addEventListener\('touchstart', \(e\) => \{\s*if \(e\.touches\.length === 1\) \{\s*isTouching = true;\s*isChartDragging = true;/,
    `canvasContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                if (drawingEngine && drawingEngine.activeTool !== 'cursor') {
                    return; // Tablette çizim modu etkinken grafik kaydırılmaz
                }
                isTouching = true;
                isChartDragging = true;`
);

// 7. Update TradingViewDrawingEngine constructor with defaultStyle
content = content.replace(
    /this\.hideAll = false;\s*this\.drawings = \[\];/,
    `this.hideAll = false;
                this.defaultStyle = { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 };
                this.drawings = [];`
);

// 8. Update new drawings in engine to use defaultStyle
content = content.replace(
    /style: \{ color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0\.2 \}/g,
    'style: JSON.parse(JSON.stringify(this.defaultStyle))'
);

// 9. Update handleMouseDown to ignore clicks on toolbar or property bar
content = content.replace(
    /handleMouseDown\(e\) \{\s*if \(e\.button !== 0\) return;\s*const rect = this\.container\.getBoundingClientRect\(\);/,
    `handleMouseDown(e) {
                if (e.button !== 0) return;
                if (e.target && (e.target.closest('#tv-prop-toolbar') || e.target.closest('#tv-favorite-bar') || e.target.closest('.tv-left-toolbar') || e.target.closest('.tv-flyout-menu'))) {
                    return;
                }
                const rect = this.container.getBoundingClientRect();`
);

// 10. Update property toolbar functions at the bottom of the script
const oldBottomProp = `        function updatePropertyToolbar(drawing) {
            const bar = document.getElementById('tv-prop-toolbar');
            if (!bar) return;
            if (!drawing || !drawingEngine) {
                bar.style.display = 'none';
                return;
            }
            const p = drawing.points[0];
            if (!p) return;
            const sx = drawingEngine.indexToX(p.cIdx);
            const sy = drawingEngine.priceToY(p.price);
            bar.style.display = 'flex';
            bar.style.left = Math.max(10, Math.min(canvasContainer.clientWidth - 260, sx)) + 'px';
            bar.style.top = Math.max(10, sy - 45) + 'px';
        }

        window.setDrawingColor = function(c) {
            if (drawingEngine && drawingEngine.selectedDrawing) {
                drawingEngine.selectedDrawing.style.color = c;
            }
        };
        window.setDrawingWidth = function(w) {
            if (drawingEngine && drawingEngine.selectedDrawing) {
                drawingEngine.selectedDrawing.style.width = w;
            }
        };
        window.setDrawingStyle = function(s) {
            if (drawingEngine && drawingEngine.selectedDrawing) {
                drawingEngine.selectedDrawing.style.lineStyle = s;
            }
        };
        window.deleteSelectedDrawing = function() {
            if (drawingEngine && drawingEngine.selectedDrawing) {
                drawingEngine.drawings = drawingEngine.drawings.filter(d => d.id !== drawingEngine.selectedDrawing.id);
                drawingEngine.selectDrawing(null);
            }
        };`;

const newBottomProp = `        function updatePropertyToolbar(drawing) {
            const bar = document.getElementById('tv-prop-toolbar');
            if (!bar) return;
            if (!drawing || !drawingEngine) {
                bar.style.display = 'none';
                return;
            }
            const p = drawing.points[0];
            if (!p) return;
            const sx = drawingEngine.indexToX(p.cIdx);
            const sy = drawingEngine.priceToY(p.price);
            bar.style.display = 'flex';
            const barWidth = 320;
            const clampX = Math.max(10, Math.min(canvasContainer.clientWidth - barWidth, sx - barWidth / 2));
            const clampY = Math.max(10, Math.min(canvasContainer.clientHeight - 60, sy - 50));
            bar.style.left = clampX + 'px';
            bar.style.top = clampY + 'px';

            // Aktif rengi işaretle
            const curCol = (drawing.style.color || '#38bdf8').toLowerCase().replace('#', '');
            document.querySelectorAll('.tv-prop-color-dot').forEach(d => {
                d.classList.toggle('active', d.id === 'dot-color-' + curCol);
            });

            // Aktif kalınlığı işaretle
            const curW = drawing.style.width || 2;
            ['1', '2', '4'].forEach(w => {
                const b = document.getElementById('prop-w-' + w);
                if (b) b.classList.toggle('active', parseInt(w) === curW);
            });

            // Aktif stili işaretle
            const curStyle = drawing.style.lineStyle || 'solid';
            ['solid', 'dashed', 'dotted'].forEach(s => {
                const b = document.getElementById('prop-style-' + s);
                if (b) b.classList.toggle('active', s === curStyle);
            });
        }

        window.setDrawingColor = function(c, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (drawingEngine) {
                drawingEngine.defaultStyle.color = c;
                if (drawingEngine.selectedDrawing) {
                    drawingEngine.selectedDrawing.style.color = c;
                    const dInList = drawingEngine.drawings.find(d => d.id === drawingEngine.selectedDrawing.id);
                    if (dInList) dInList.style.color = c;
                }
                updatePropertyToolbar(drawingEngine.selectedDrawing);
            }
        };

        window.setDrawingWidth = function(w, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (drawingEngine) {
                drawingEngine.defaultStyle.width = w;
                if (drawingEngine.selectedDrawing) {
                    drawingEngine.selectedDrawing.style.width = w;
                    const dInList = drawingEngine.drawings.find(d => d.id === drawingEngine.selectedDrawing.id);
                    if (dInList) dInList.style.width = w;
                }
                updatePropertyToolbar(drawingEngine.selectedDrawing);
            }
        };

        window.setDrawingStyle = function(s, e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (drawingEngine) {
                drawingEngine.defaultStyle.lineStyle = s;
                if (drawingEngine.selectedDrawing) {
                    drawingEngine.selectedDrawing.style.lineStyle = s;
                    const dInList = drawingEngine.drawings.find(d => d.id === drawingEngine.selectedDrawing.id);
                    if (dInList) dInList.style.lineStyle = s;
                }
                updatePropertyToolbar(drawingEngine.selectedDrawing);
            }
        };

        window.deleteSelectedDrawing = function(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (drawingEngine && drawingEngine.selectedDrawing) {
                drawingEngine.drawings = drawingEngine.drawings.filter(d => d.id !== drawingEngine.selectedDrawing.id);
                drawingEngine.selectDrawing(null);
            }
        };

        // Kayan ayar çubuğunda event sızmasını engelle
        const propBarElem = document.getElementById('tv-prop-toolbar');
        if (propBarElem) {
            ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(evt => {
                propBarElem.addEventListener(evt, (e) => e.stopPropagation());
            });
        }`;

content = content.replace(oldBottomProp, newBottomProp);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Surgical update applied cleanly!');
