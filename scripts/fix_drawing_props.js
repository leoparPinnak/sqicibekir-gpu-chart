import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add active states to CSS for property toolbar
const propCssAdditions = `
        .tv-prop-color-dot.active {
            box-shadow: 0 0 0 2px #ffffff, 0 0 8px rgba(255, 255, 255, 0.6);
            transform: scale(1.2);
        }
        .tv-prop-btn.active {
            background: #2962ff !important;
            color: #ffffff !important;
            font-weight: 700;
        }
`;
content = content.replace(
    /\.tv-prop-btn\.delete:hover \{ background: rgba\(239, 68, 68, 0\.2\); color: #ef4444; \}/,
    `.tv-prop-btn.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }${propCssAdditions}`
);

// 2. Update HTML of tv-prop-toolbar with ids for width and style buttons
const updatedPropToolbarHtml = `
                        <!-- ÇİZİM SEÇİM KAYAN AYAR ÇUBUĞU -->
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
                        </div>
`;

content = content.replace(
    /<!-- ️ ÇİZİM SEÇİM KAYAN AYAR ÇUBUĞU -->[\s\S]*?<\/div>\s*<\/div>/,
    updatedPropToolbarHtml.trim() + '\n                    </div>'
);

// 3. Update TradingViewDrawingEngine constructor with defaultStyle
content = content.replace(
    /this\.hideAll = false;\s*this\.drawings = \[\];/,
    `this.hideAll = false;
                this.defaultStyle = { color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0.2 };
                this.drawings = [];`
);

// 4. Update new drawings to use defaultStyle
content = content.replace(
    /style: \{ color: '#38bdf8', width: 2, lineStyle: 'solid', fillOpacity: 0\.2 \}/g,
    'style: JSON.parse(JSON.stringify(this.defaultStyle))'
);

// 5. Update handleMouseDown to ignore clicks on toolbar/propbar
content = content.replace(
    /handleMouseDown\(e\) \{\s*if \(e\.button !== 0\) return;/,
    `handleMouseDown(e) {
                if (e.button !== 0) return;
                if (e.target && (e.target.closest('#tv-prop-toolbar') || e.target.closest('#tv-favorite-bar') || e.target.closest('.tv-left-toolbar') || e.target.closest('.tv-flyout-menu'))) {
                    return;
                }`
);

// 6. Update property toolbar functions
const newPropertyFunctions = `
        function updatePropertyToolbar(drawing) {
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

            // Renk aktifliğini güncelle
            const curCol = (drawing.style.color || '#38bdf8').toLowerCase().replace('#', '');
            document.querySelectorAll('.tv-prop-color-dot').forEach(d => {
                d.classList.toggle('active', d.id === 'dot-color-' + curCol);
            });

            // Kalınlık aktifliğini güncelle
            const curW = drawing.style.width || 2;
            ['1', '2', '4'].forEach(w => {
                const b = document.getElementById('prop-w-' + w);
                if (b) b.classList.toggle('active', parseInt(w) === curW);
            });

            // Stil aktifliğini güncelle
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

        // Kayan panellerde event sızmasını kesin olarak durdur
        const propBarElem = document.getElementById('tv-prop-toolbar');
        if (propBarElem) {
            ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(evt => {
                propBarElem.addEventListener(evt, (e) => e.stopPropagation());
            });
        }
`;

content = content.replace(
    /function updatePropertyToolbar\(drawing\) \{[\s\S]*?window\.deleteSelectedDrawing = function\(\) \{[\s\S]*?drawingEngine\.selectDrawing\(null\);\s*\}\s*\};/,
    newPropertyFunctions.trim()
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated drawing property specifications logic!');
