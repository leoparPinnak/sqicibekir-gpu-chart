import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Expand render method in TradingViewDrawingEngine
const oldRenderBody = `                    if (d.type === 'trendline') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    } else if (d.type === 'ray') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const scale = (w + 500) / (Math.hypot(dx, dy) || 1);
                        ctx.lineTo(x1 + dx * scale, y1 + dy * scale);
                        ctx.stroke();
                    } else if (d.type === 'horizontal') {
                        ctx.beginPath();
                        ctx.moveTo(0, y1);
                        ctx.lineTo(w, y1);
                        ctx.stroke();
                    } else if (d.type === 'horzray') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(w, y1);
                        ctx.stroke();
                    } else if (d.type === 'vertical') {
                        ctx.beginPath();
                        ctx.moveTo(x1, 0);
                        ctx.lineTo(x1, this.container.clientHeight);
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
                            ctx.font = '10px "SF Pro Text", sans-serif';
                            ctx.fillStyle = col;
                            ctx.fillText(\`\${(lvl * 100).toFixed(1)}% ($\${(p1.price + diff * lvl).toFixed(2)})\`, minX + 4, ly - 3);
                        }
                    } else if (d.type === 'long_pos' || d.type === 'short_pos') {
                        const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                        const midY = (y1 + y2) / 2;
                        const isLong = d.type === 'long_pos';
                        
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
                        ctx.fillRect(minX, isLong ? Math.min(y1, y2) : midY, rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                        ctx.fillRect(minX, isLong ? midY : Math.min(y1, y2), rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.strokeStyle = '#38bdf8';
                        ctx.beginPath();
                        ctx.moveTo(minX, midY);
                        ctx.lineTo(minX + rw, midY);
                        ctx.stroke();
                    } else if (d.type === 'text') {
                        ctx.font = 'bold 13px "SF Pro Text", "Segoe UI", sans-serif';
                        ctx.fillStyle = col;
                        ctx.fillText('Not: ' + (p1.price.toFixed(2)), x1, y1);
                    }`;

const newRenderBody = `                    if (d.type === 'trendline' || d.type === 'info_line' || d.type === 'extended_line' || d.type === 'trend_angle') {
                        ctx.beginPath();
                        if (d.type === 'extended_line') {
                            const dx = x2 - x1, dy = y2 - y1;
                            const scale = (w + 1000) / (Math.hypot(dx, dy) || 1);
                            ctx.moveTo(x1 - dx * scale, y1 - dy * scale);
                            ctx.lineTo(x1 + dx * scale, y1 + dy * scale);
                        } else {
                            ctx.moveTo(x1, y1);
                            ctx.lineTo(x2, y2);
                        }
                        ctx.stroke();

                        if (d.type === 'info_line') {
                            const dBars = Math.round(p2.cIdx - p1.cIdx);
                            const dPct = (((p2.price - p1.price) / (p1.price || 1)) * 100).toFixed(2);
                            const dPrice = (p2.price - p1.price).toFixed(2);
                            const infoText = \`\${dBars} Mum | \${dPrice}$ (\${dPct}%)\`;
                            ctx.font = '10px "SF Pro Text", sans-serif';
                            ctx.fillStyle = '#0f172a';
                            ctx.fillRect((x1 + x2)/2 - 40, (y1 + y2)/2 - 18, 80, 16);
                            ctx.fillStyle = col;
                            ctx.fillText(infoText, (x1 + x2)/2 - 36, (y1 + y2)/2 - 6);
                        }
                    } else if (d.type === 'ray') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        const dx = x2 - x1, dy = y2 - y1;
                        const scale = (w + 500) / (Math.hypot(dx, dy) || 1);
                        ctx.lineTo(x1 + dx * scale, y1 + dy * scale);
                        ctx.stroke();
                    } else if (d.type === 'horizontal') {
                        ctx.beginPath();
                        ctx.moveTo(0, y1);
                        ctx.lineTo(w, y1);
                        ctx.stroke();
                        ctx.font = '10px "SF Pro Text", sans-serif';
                        ctx.fillStyle = col;
                        ctx.fillText(\`\${p1.price.toFixed(2)}\`, w - 55, y1 - 4);
                    } else if (d.type === 'horzray') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(w, y1);
                        ctx.stroke();
                    } else if (d.type === 'vertical') {
                        ctx.beginPath();
                        ctx.moveTo(x1, 0);
                        ctx.lineTo(x1, this.container.clientHeight);
                        ctx.stroke();
                    } else if (d.type === 'crossline') {
                        ctx.beginPath();
                        ctx.moveTo(0, y1); ctx.lineTo(w, y1);
                        ctx.moveTo(x1, 0); ctx.lineTo(x1, this.container.clientHeight);
                        ctx.stroke();
                    } else if (d.type === 'parallel_channel' || d.type === 'regression_trend') {
                        const dy = y2 - y1;
                        const offset = 40;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                        ctx.moveTo(x1, y1 - offset); ctx.lineTo(x2, y2 - offset);
                        ctx.moveTo(x1, y1 + offset); ctx.lineTo(x2, y2 + offset);
                        ctx.stroke();
                        ctx.fillStyle = col;
                        ctx.globalAlpha = 0.10;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1 - offset); ctx.lineTo(x2, y2 - offset);
                        ctx.lineTo(x2, y2 + offset); ctx.lineTo(x1, y1 + offset);
                        ctx.closePath();
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                    } else if (d.type === 'rectangle' || d.type === 'rotated_rect') {
                        const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                        const minY = Math.min(y1, y2), rh = Math.abs(y2 - y1);
                        ctx.fillStyle = col;
                        ctx.globalAlpha = d.style.fillOpacity || 0.2;
                        ctx.fillRect(minX, minY, rw, rh);
                        ctx.globalAlpha = 1.0;
                        ctx.strokeRect(minX, minY, rw, rh);
                    } else if (d.type === 'circle') {
                        const rad = Math.hypot(x2 - x1, y2 - y1);
                        ctx.beginPath();
                        ctx.arc(x1, y1, rad, 0, Math.PI * 2);
                        ctx.fillStyle = col;
                        ctx.globalAlpha = 0.15;
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.stroke();
                    } else if (d.type === 'ellipse') {
                        const rx = Math.abs(x2 - x1) / 2;
                        const ry = Math.abs(y2 - y1) / 2;
                        const cx = (x1 + x2) / 2;
                        const cy = (y1 + y2) / 2;
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, Math.max(2, rx), Math.max(2, ry), 0, 0, Math.PI * 2);
                        ctx.fillStyle = col;
                        ctx.globalAlpha = 0.18;
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.stroke();
                    } else if (d.type === 'triangle') {
                        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
                        ctx.beginPath();
                        ctx.moveTo((minX + maxX)/2, minY);
                        ctx.lineTo(maxX, maxY);
                        ctx.lineTo(minX, maxY);
                        ctx.closePath();
                        ctx.fillStyle = col;
                        ctx.globalAlpha = 0.18;
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.stroke();
                    } else if (d.type === 'arrow' || d.type === 'arrow_marker') {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                        ctx.stroke();
                        const angle = Math.atan2(y2 - y1, x2 - x1);
                        ctx.beginPath();
                        ctx.moveTo(x2, y2);
                        ctx.lineTo(x2 - 14 * Math.cos(angle - Math.PI / 6), y2 - 14 * Math.sin(angle - Math.PI / 6));
                        ctx.lineTo(x2 - 14 * Math.cos(angle + Math.PI / 6), y2 - 14 * Math.sin(angle + Math.PI / 6));
                        ctx.closePath();
                        ctx.fillStyle = col;
                        ctx.fill();
                    } else if (d.type === 'arrow_up') {
                        ctx.fillStyle = '#10b981';
                        ctx.beginPath();
                        ctx.moveTo(x1, y1 - 16); ctx.lineTo(x1 + 10, y1 + 4); ctx.lineTo(x1 - 10, y1 + 4);
                        ctx.closePath();
                        ctx.fill();
                    } else if (d.type === 'arrow_down') {
                        ctx.fillStyle = '#ef4444';
                        ctx.beginPath();
                        ctx.moveTo(x1, y1 + 16); ctx.lineTo(x1 + 10, y1 - 4); ctx.lineTo(x1 - 10, y1 - 4);
                        ctx.closePath();
                        ctx.fill();
                    } else if (d.type === 'brush' || d.type === 'highlighter') {
                        ctx.lineWidth = (d.type === 'highlighter') ? 14 : 3;
                        ctx.globalAlpha = (d.type === 'highlighter') ? 0.35 : 0.9;
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    } else if (d.type === 'fibonacci' || d.type === 'fib_channel' || d.type === 'fib_extension') {
                        const fibs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.618];
                        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
                        const diff = p2.price - p1.price;
                        for (const lvl of fibs) {
                            const ly = this.priceToY(p1.price + diff * lvl);
                            ctx.beginPath();
                            ctx.moveTo(minX, ly);
                            ctx.lineTo(maxX, ly);
                            ctx.stroke();
                            ctx.font = '10px "SF Pro Text", sans-serif';
                            ctx.fillStyle = col;
                            ctx.fillText(\`\${(lvl * 100).toFixed(1)}% ($\${(p1.price + diff * lvl).toFixed(2)})\`, minX + 4, ly - 3);
                        }
                    } else if (d.type === 'long_pos' || d.type === 'short_pos') {
                        const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                        const midY = (y1 + y2) / 2;
                        const isLong = d.type === 'long_pos';
                        
                        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
                        ctx.fillRect(minX, isLong ? Math.min(y1, y2) : midY, rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                        ctx.fillRect(minX, isLong ? midY : Math.min(y1, y2), rw, Math.abs(y2 - y1) / 2);
                        
                        ctx.strokeStyle = '#38bdf8';
                        ctx.beginPath();
                        ctx.moveTo(minX, midY);
                        ctx.lineTo(minX + rw, midY);
                        ctx.stroke();

                        ctx.font = 'bold 11px "SF Pro Text", sans-serif';
                        ctx.fillStyle = '#10b981';
                        ctx.fillText('HEDEF (TP)', minX + 6, isLong ? Math.min(y1, y2) + 14 : Math.max(y1, y2) - 6);
                        ctx.fillStyle = '#ef4444';
                        ctx.fillText('ZARAR DURDUR (SL)', minX + 6, isLong ? Math.max(y1, y2) - 6 : Math.min(y1, y2) + 14);
                    } else if (d.type === 'measure' || d.type === 'price_range' || d.type === 'date_range' || d.type === 'date_price_range') {
                        const minX = Math.min(x1, x2), rw = Math.abs(x2 - x1);
                        const minY = Math.min(y1, y2), rh = Math.abs(y2 - y1);
                        const dBars = Math.abs(Math.round(p2.cIdx - p1.cIdx));
                        const dPct = (((p2.price - p1.price) / (p1.price || 1)) * 100);
                        const isUp = dPct >= 0;

                        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
                        ctx.fillRect(minX, minY, rw, rh);
                        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
                        ctx.strokeRect(minX, minY, rw, rh);

                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(minX + rw/2 - 60, minY + rh/2 - 18, 120, 36);
                        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
                        ctx.strokeRect(minX + rw/2 - 60, minY + rh/2 - 18, 120, 36);

                        ctx.font = 'bold 11px "SF Pro Text", sans-serif';
                        ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
                        ctx.fillText(\`\${isUp ? '+' : ''}\${dPct.toFixed(2)}% ($\${(p2.price - p1.price).toFixed(2)})\`, minX + rw/2 - 52, minY + rh/2 - 2);
                        ctx.font = '10px "SF Pro Text", sans-serif';
                        ctx.fillStyle = '#94a3b8';
                        ctx.fillText(\`\${dBars} Mum Aralığı\`, minX + rw/2 - 52, minY + rh/2 + 12);
                    } else if (d.type === 'text' || d.type === 'text_note' || d.type === 'price_note' || d.type === 'callout' || d.type === 'price_label') {
                        ctx.fillStyle = '#1e222d';
                        ctx.strokeStyle = col;
                        ctx.strokeRect(x1 - 4, y1 - 16, 100, 22);
                        ctx.fillRect(x1 - 4, y1 - 16, 100, 22);
                        ctx.font = 'bold 11px "SF Pro Text", "Segoe UI", sans-serif';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(\`Fiyat: \${p1.price.toFixed(2)}\`, x1 + 4, y1 - 1);
                    } else {
                        // Varsayılan çizgisel gösterim
                        ctx.beginPath();
                        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }`;

content = content.replace(oldRenderBody, newRenderBody);

// 2. Add smooth scrolling and auto-positioning for flyout menus
const oldFlyoutCss = `        .tv-flyout-menu {
            position: absolute;
            left: 48px;
            top: 0;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6);
            display: none;
            flex-direction: column;
            min-width: 220px;
            z-index: 100;
            padding: 6px 0;
        }`;

const newFlyoutCss = `        .tv-flyout-menu {
            position: absolute;
            left: 48px;
            top: 0;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.75);
            display: none;
            flex-direction: column;
            min-width: 240px;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #2a2e39 transparent;
            z-index: 100;
            padding: 6px 0;
        }
        .tv-flyout-menu::-webkit-scrollbar {
            width: 4px;
        }
        .tv-flyout-menu::-webkit-scrollbar-thumb {
            background: #2a2e39;
            border-radius: 2px;
        }
        .tv-flyout-title:not(:first-child) {
            border-top: 1px solid #2a2e39;
            margin-top: 4px;
            padding-top: 8px;
        }`;

content = content.replace(oldFlyoutCss, newFlyoutCss);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('TradingView drawing engine expanded with complete tool renderers and scrolling flyouts!');
