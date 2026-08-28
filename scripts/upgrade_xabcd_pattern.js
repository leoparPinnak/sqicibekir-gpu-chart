import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Tool point counts mapping and helpers
const toolPointCountsCode = `
        const TV_TOOL_POINT_COUNTS = {
            'pattern_xabcd': 5,
            'pattern_cypher': 5,
            'pattern_abcd': 4,
            'pattern_head_shoulders': 7,
            'pattern_triangle': 4,
            'pattern_three_drivers': 6,
            'elliott_impulse': 6,
            'elliott_correction': 4,
            'elliott_triangle': 6,
            'elliott_double_combo': 4,
            'elliott_triple_combo': 6,
            'polyline': Infinity,
            'path': Infinity
        };
`;

content = content.replace('class TradingViewDrawingEngine {', toolPointCountsCode + '\n        class TradingViewDrawingEngine {');

// 2. Upgrade handleMouseMove in TradingViewDrawingEngine to update the active floating point in multi-point tools
const oldMouseMoveDrawing = `                // 🟢 Çizim modunda Nokta 2 fareyi canlı olarak izler (Grafik çerçevesi içinde sınırlandırılmış)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const clampedX = Math.max(0, Math.min(rect.width, mx));
                    const clampedY = Math.max(0, Math.min(rect.height, my));
                    const snapped = this.snapToOHLC(this.xToIndex(clampedX), this.yToPrice(clampedY));
                    this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    return;
                }`;

const newMouseMoveDrawing = `                // 🟢 Çizim modunda aktif son nokta fareyi canlı olarak izler (Multi-Point / XABCD desteği)
                if (this.drawingState === 'drawing' && this.drawingInProgress) {
                    const clampedX = Math.max(0, Math.min(rect.width, mx));
                    const clampedY = Math.max(0, Math.min(rect.height, my));
                    const snapped = this.snapToOHLC(this.xToIndex(clampedX), this.yToPrice(clampedY));
                    const pts = this.drawingInProgress.points;
                    pts[pts.length - 1] = { cIdx: snapped.cIdx, price: snapped.price };
                    this.container.style.cursor = isChartDragging ? 'grabbing' : 'crosshair';
                    if (this.canvas) this.canvas.style.cursor = this.container.style.cursor;
                    return;
                }`;

content = content.replace(oldMouseMoveDrawing, newMouseMoveDrawing);

// 3. Upgrade handleMouseUp to support multi-point sequential clicking for XABCD and all patterns
const oldMouseUpDrawing = `                        if (this.drawingState === 'idle') {
                            // Tek tıklamalı araçlar (Yatay / Dikey Çizgiler)
                            if (['horizontal', 'horzray', 'vertical', 'crossline', 'arrow_up', 'arrow_down', 'text', 'text_note', 'price_note', 'pin_note', 'price_label', 'signpost', 'flag_mark', 'callout', 'comment', 'image_tool', 'tweet_tool', 'idea_tool'].includes(this.activeTool)) {
                                const newD = {
                                    id: 'draw_' + Date.now(),
                                    type: this.activeTool,
                                    points: [{ cIdx: snapped.cIdx, price: snapped.price }],
                                    style: JSON.parse(JSON.stringify(this.defaultStyle)),
                                    locked: false
                                };
                                this.drawings.push(newD);
                                this.selectDrawing(newD);
                                this.drawingInProgress = null;
                                this.drawingState = 'idle';
                                // 🌟 Araç kullanıcı kapatana kadar aktif kalmaya devam eder
                            } else {
                                // 🌟 1. CLICK: Başlangıç Noktası (Point 1) Belirlendi!
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
                            }
                        } else if (this.drawingState === 'drawing' && this.drawingInProgress) {
                            // 🏁 2. CLICK: Bitiş Noktası (Point 2) Belirlendi ve Çizim Tamamlandı!
                            this.drawingInProgress.points[1] = { cIdx: snapped.cIdx, price: snapped.price };
                            this.drawings.push(this.drawingInProgress);
                            this.selectDrawing(this.drawingInProgress);
                            this.drawingInProgress = null;
                            this.drawingState = 'idle';
                            // 🌟 Araç kullanıcı kapatana kadar aktif kalmaya devam eder (Peş peşe çizim)
                        }`;

const newMouseUpDrawing = `                        const targetCount = TV_TOOL_POINT_COUNTS[this.activeTool] || 2;

                        if (this.drawingState === 'idle') {
                            if (['horizontal', 'horzray', 'vertical', 'crossline', 'arrow_up', 'arrow_down', 'text', 'text_note', 'price_note', 'pin_note', 'price_label', 'signpost', 'flag_mark', 'callout', 'comment', 'image_tool', 'tweet_tool', 'idea_tool'].includes(this.activeTool)) {
                                const newD = {
                                    id: 'draw_' + Date.now(),
                                    type: this.activeTool,
                                    points: [{ cIdx: snapped.cIdx, price: snapped.price }],
                                    style: JSON.parse(JSON.stringify(this.defaultStyle)),
                                    locked: false
                                };
                                this.drawings.push(newD);
                                this.selectDrawing(newD);
                                this.drawingInProgress = null;
                                this.drawingState = 'idle';
                            } else {
                                // 🌟 1. CLICK: 1. Nokta konuldu, 2. nokta farenin ucuna bağlandı
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
                            }
                        } else if (this.drawingState === 'drawing' && this.drawingInProgress) {
                            const pts = this.drawingInProgress.points;
                            // Mevcut noktayı sabitle
                            pts[pts.length - 1] = { cIdx: snapped.cIdx, price: snapped.price };

                            if (pts.length < targetCount) {
                                // 🌟 Ara Nokta Sabitlendi (Örn: XABCD için A, B, C noktaları) -> Yeni takip noktası ekle
                                pts.push({ cIdx: snapped.cIdx, price: snapped.price });
                            } else {
                                // 🏁 Son Nokta (Örn: XABCD için D noktası) -> Çizim Tamamlandı!
                                this.drawings.push(this.drawingInProgress);
                                this.selectDrawing(this.drawingInProgress);
                                this.drawingInProgress = null;
                                this.drawingState = 'idle';
                            }
                        }`;

content = content.replace(oldMouseUpDrawing, newMouseUpDrawing);

// 4. Add comprehensive rendering logic for XABCD, Cypher, ABCD, Elliott Waves, and Harmonics inside render()
const harmonicRenderBlock = `
                    // 🌟 3. HARMONIC VE GRAFİK DESENLERİ (XABCD, CYPHER, ABCD, ELLIOTT, ÜÇGEN)
                    if (d.type === 'pattern_xabcd' || d.type === 'pattern_cypher') {
                        const labels = ['X', 'A', 'B', 'C', 'D'];
                        const screenPts = d.points.map(p => ({
                            x: this.indexToX(p.cIdx),
                            y: this.priceToY(p.price),
                            price: p.price
                        }));

                        // A. Doldurulmuş Harmonik Üçgenler (X-A-B ve B-C-D)
                        if (screenPts.length >= 3) {
                            ctx.fillStyle = col.startsWith('#') ? hexToRgbA(col, 0.15) : 'rgba(56, 189, 248, 0.15)';
                            ctx.beginPath();
                            ctx.moveTo(screenPts[0].x, screenPts[0].y);
                            ctx.lineTo(screenPts[1].x, screenPts[1].y);
                            ctx.lineTo(screenPts[2].x, screenPts[2].y);
                            ctx.closePath();
                            ctx.fill();
                        }
                        if (screenPts.length >= 5) {
                            ctx.fillStyle = col.startsWith('#') ? hexToRgbA(col, 0.15) : 'rgba(56, 189, 248, 0.15)';
                            ctx.beginPath();
                            ctx.moveTo(screenPts[2].x, screenPts[2].y);
                            ctx.lineTo(screenPts[3].x, screenPts[3].y);
                            ctx.lineTo(screenPts[4].x, screenPts[4].y);
                            ctx.closePath();
                            ctx.fill();
                        }

                        // B. Dış Kenar Çizgileri (Solid Dış Hatlar)
                        ctx.beginPath();
                        ctx.moveTo(screenPts[0].x, screenPts[0].y);
                        for (let i = 1; i < screenPts.length; i++) {
                            ctx.lineTo(screenPts[i].x, screenPts[i].y);
                        }
                        ctx.stroke();

                        // C. Kesikli İç Çizgiler & Fibonacci Oranları
                        ctx.save();
                        ctx.setLineDash([4, 4]);
                        ctx.lineWidth = Math.max(1, lw - 1);
                        ctx.strokeStyle = col;

                        function drawRatioLabel(pA, pB, ratioVal, labelStr) {
                            const mx = (pA.x + pB.x) / 2;
                            const my = (pA.y + pB.y) / 2;
                            ctx.beginPath();
                            ctx.moveTo(pA.x, pA.y);
                            ctx.lineTo(pB.x, pA.y !== pB.y ? pB.y : pB.y);
                            ctx.stroke();

                            if (ratioVal && isFinite(ratioVal)) {
                                const text = \`\${labelStr}: \${ratioVal.toFixed(3)}\`;
                                ctx.font = 'bold 9.5px "SF Mono", Monaco, sans-serif';
                                const tw = ctx.measureText(text).width;
                                ctx.fillStyle = '#0f172a';
                                ctx.fillRect(mx - tw/2 - 4, my - 8, tw + 8, 16);
                                ctx.strokeStyle = col;
                                ctx.strokeRect(mx - tw/2 - 4, my - 8, tw + 8, 16);
                                ctx.fillStyle = '#f8fafc';
                                ctx.fillText(text, mx - tw/2, my + 3.5);
                            }
                        }

                        // X -> B Oranı
                        if (screenPts.length >= 3) {
                            const xaSpan = Math.abs(screenPts[1].price - screenPts[0].price) || 1;
                            const abSpan = Math.abs(screenPts[2].price - screenPts[1].price);
                            const xbRatio = abSpan / xaSpan;
                            drawRatioLabel(screenPts[0], screenPts[2], xbRatio, 'XB');
                        }
                        // A -> C Oranı
                        if (screenPts.length >= 4) {
                            const abSpan = Math.abs(screenPts[2].price - screenPts[1].price) || 1;
                            const bcSpan = Math.abs(screenPts[3].price - screenPts[2].price);
                            const acRatio = bcSpan / abSpan;
                            drawRatioLabel(screenPts[1], screenPts[3], acRatio, 'AC');
                        }
                        // B -> D ve X -> D Oranları
                        if (screenPts.length >= 5) {
                            const bcSpan = Math.abs(screenPts[3].price - screenPts[2].price) || 1;
                            const cdSpan = Math.abs(screenPts[4].price - screenPts[3].price);
                            const bdRatio = cdSpan / bcSpan;
                            drawRatioLabel(screenPts[2], screenPts[4], bdRatio, 'BD');

                            const xaSpan = Math.abs(screenPts[1].price - screenPts[0].price) || 1;
                            const xdSpan = Math.abs(screenPts[4].price - screenPts[0].price);
                            const xdRatio = xdSpan / xaSpan;
                            drawRatioLabel(screenPts[0], screenPts[4], xdRatio, 'XD');
                        }
                        ctx.restore();

                        // D. Harf Rozetleri (X, A, B, C, D)
                        for (let i = 0; i < screenPts.length; i++) {
                            const sp = screenPts[i];
                            ctx.beginPath();
                            ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
                            ctx.fillStyle = '#0f172a';
                            ctx.fill();
                            ctx.lineWidth = 2;
                            ctx.strokeStyle = col;
                            ctx.stroke();

                            ctx.font = 'bold 11px "SF Pro Text", sans-serif';
                            ctx.fillStyle = col;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(labels[i] || '', sp.x, sp.y);
                        }
                        ctx.textAlign = 'start';
                        ctx.textBaseline = 'alphabetic';
                    } else if (d.type === 'pattern_abcd') {
                        const labels = ['A', 'B', 'C', 'D'];
                        const screenPts = d.points.map(p => ({
                            x: this.indexToX(p.cIdx),
                            y: this.priceToY(p.price),
                            price: p.price
                        }));

                        ctx.beginPath();
                        ctx.moveTo(screenPts[0].x, screenPts[0].y);
                        for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
                        ctx.stroke();

                        for (let i = 0; i < screenPts.length; i++) {
                            const sp = screenPts[i];
                            ctx.beginPath();
                            ctx.arc(sp.x, sp.y, 9, 0, Math.PI * 2);
                            ctx.fillStyle = '#0f172a';
                            ctx.fill();
                            ctx.strokeStyle = col;
                            ctx.stroke();
                            ctx.font = 'bold 10.5px sans-serif';
                            ctx.fillStyle = col;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(labels[i] || '', sp.x, sp.y);
                        }
                        ctx.textAlign = 'start';
                        ctx.textBaseline = 'alphabetic';
                    } else if (d.type === 'elliott_impulse' || d.type === 'elliott_triangle') {
                        const labels = d.type === 'elliott_impulse' ? ['(0)', '(1)', '(2)', '(3)', '(4)', '(5)'] : ['(A)', '(B)', '(C)', '(D)', '(E)'];
                        const screenPts = d.points.map(p => ({
                            x: this.indexToX(p.cIdx),
                            y: this.priceToY(p.price)
                        }));

                        ctx.beginPath();
                        ctx.moveTo(screenPts[0].x, screenPts[0].y);
                        for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
                        ctx.stroke();

                        for (let i = 0; i < screenPts.length; i++) {
                            const sp = screenPts[i];
                            ctx.font = 'bold 11px sans-serif';
                            ctx.fillStyle = col;
                            ctx.fillText(labels[i] || \`(\${i})\`, sp.x + 6, sp.y - 6);
                        }
                    } else if (d.type === 'elliott_correction') {
                        const labels = ['(0)', '(A)', '(B)', '(C)'];
                        const screenPts = d.points.map(p => ({
                            x: this.indexToX(p.cIdx),
                            y: this.priceToY(p.price)
                        }));

                        ctx.beginPath();
                        ctx.moveTo(screenPts[0].x, screenPts[0].y);
                        for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
                        ctx.stroke();

                        for (let i = 0; i < screenPts.length; i++) {
                            const sp = screenPts[i];
                            ctx.font = 'bold 11px sans-serif';
                            ctx.fillStyle = col;
                            ctx.fillText(labels[i] || \`(\${i})\`, sp.x + 6, sp.y - 6);
                        }
                    } else `;

// Replace the start of render shape condition
content = content.replace(
    /if \(d\.type === 'trendline' \|\| d\.type === 'info_line'/,
    harmonicRenderBlock + `if (d.type === 'trendline' || d.type === 'info_line'`
);

// Add helper hexToRgbA if not exists
const hexHelper = `
        function hexToRgbA(hex, alpha) {
            let c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
            }
            return 'rgba(56, 189, 248, ' + alpha + ')';
        }
`;
content = content.replace('class TradingViewDrawingEngine {', hexHelper + '\n        class TradingViewDrawingEngine {');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully upgraded XABCD Harmonic Pattern engine with multi-point clicks, triangles, ratios, and letter badges!');
