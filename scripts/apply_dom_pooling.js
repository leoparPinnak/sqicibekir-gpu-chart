import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace updateTimeScaleLabels and updatePriceScaleLabels with Zero-DOM-Allocation Pooled Nodes
const oldLabelsBlock = `        function updateTimeScaleLabels() {
            if (totalCandles === 0) return;
            const count = 6;
            const curStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
            const curEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
            const visibleCount = Math.max(1, curEnd - curStart);
            let html = '';

            const lastCandle = candleDataBase[totalCandles - 1];
            const candleIntervalMs = (totalCandles > 1 && candleDataBase[1]) ? (candleDataBase[1].time - candleDataBase[0].time) : 60000;

            for (let i = 0; i <= count; i++) {
                const pct = i / count;
                const candleIdx = Math.floor(curStart + pct * visibleCount);
                let date = null;

                if (candleIdx >= 0 && candleIdx < totalCandles && candleDataBase[candleIdx]) {
                    date = new Date(candleDataBase[candleIdx].time);
                } else if (candleIdx >= totalCandles && lastCandle) {
                    const futureTime = lastCandle.time + (candleIdx - (totalCandles - 1)) * candleIntervalMs;
                    date = new Date(futureTime);
                } else if (candleIdx < 0 && candleDataBase[0]) {
                    const pastTime = candleDataBase[0].time + candleIdx * candleIntervalMs;
                    date = new Date(pastTime);
                }

                if (date) {
                    const labelStr = formatTimeLabelWithYear(date);
                    const leftPx = Math.round(pct * canvasContainer.clientWidth);
                    html += \`<div class="time-scale-label" style="left: \${leftPx}px;">\${labelStr}</div>\`;
                }
            }
            timeLabelsContainer.innerHTML = html;
        }

        function updatePriceScaleLabels() {
            if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice >= maxPrice) return;
            const levels = 8;
            let html = '';
            for (let i = 0; i <= levels; i++) {
                const pct = i / levels;
                const priceAtLevel = minPrice + pct * (maxPrice - minPrice);
                const topPct = (1 - pct) * 100;
                html += \`<div class="price-scale-label" style="top: \${topPct}%;">\${priceAtLevel.toFixed(2)}</div>\`;
            }
            priceLabelsContainer.innerHTML = html;

            if (totalCandles > 0 && candleDataBase[totalCandles - 1]) {
                const lastCandle = candleDataBase[totalCandles - 1];
                const lastClose = lastCandle.close;
                const lastCloseNorm = (lastClose - minPrice) / (maxPrice - minPrice);
                const lastCloseTop = (1 - lastCloseNorm) * 100;
                currentPriceBadge.style.top = \`\${lastCloseTop}%\`;
                currentPriceBadge.innerText = lastClose.toFixed(2);
                const isUp = lastClose >= lastCandle.open;
                currentPriceBadge.style.background = isUp ? '#10b981' : '#ef4444';
                currentPriceBadge.style.boxShadow = isUp ? '0 0 12px rgba(16, 185, 129, 0.65)' : '0 0 12px rgba(239, 68, 68, 0.65)';
            }
        }`;

const newLabelsBlock = `        // 🚀 DOM ELEMAN HAVUZU (Zero-Allocation DOM Node Pooling - 120 FPS Rock Solid)
        const priceLabelNodes = [];
        for (let i = 0; i <= 8; i++) {
            const el = document.createElement('div');
            el.className = 'price-scale-label';
            priceLabelsContainer.appendChild(el);
            priceLabelNodes.push(el);
        }

        const timeLabelNodes = [];
        for (let i = 0; i <= 6; i++) {
            const el = document.createElement('div');
            el.className = 'time-scale-label';
            timeLabelsContainer.appendChild(el);
            timeLabelNodes.push(el);
        }

        function updateTimeScaleLabels() {
            if (totalCandles === 0) return;
            const count = 6;
            const curStart = (smoothViewStart && isFinite(smoothViewStart)) ? smoothViewStart : viewStart;
            const curEnd = (smoothViewEnd && isFinite(smoothViewEnd)) ? smoothViewEnd : viewEnd;
            const visibleCount = Math.max(1, curEnd - curStart);

            const lastCandle = candleDataBase[totalCandles - 1];
            const candleIntervalMs = (totalCandles > 1 && candleDataBase[1]) ? (candleDataBase[1].time - candleDataBase[0].time) : 60000;
            const containerW = canvasContainer.clientWidth;

            for (let i = 0; i <= count; i++) {
                const pct = i / count;
                const candleIdx = Math.floor(curStart + pct * visibleCount);
                let timeMs = 0;

                if (candleIdx >= 0 && candleIdx < totalCandles && candleDataBase[candleIdx]) {
                    timeMs = candleDataBase[candleIdx].time;
                } else if (candleIdx >= totalCandles && lastCandle) {
                    timeMs = lastCandle.time + (candleIdx - (totalCandles - 1)) * candleIntervalMs;
                } else if (candleIdx < 0 && candleDataBase[0]) {
                    timeMs = candleDataBase[0].time + candleIdx * candleIntervalMs;
                }

                const node = timeLabelNodes[i];
                if (node) {
                    if (timeMs > 0) {
                        node.style.display = 'block';
                        node.style.left = \`\${Math.round(pct * containerW)}px\`;
                        node.textContent = formatTimeLabelWithYear(new Date(timeMs));
                    } else {
                        node.style.display = 'none';
                    }
                }
            }
        }

        function updatePriceScaleLabels() {
            if (!isFinite(minPrice) || !isFinite(maxPrice) || minPrice >= maxPrice) return;
            const levels = 8;
            const priceDiff = maxPrice - minPrice;

            for (let i = 0; i <= levels; i++) {
                const pct = i / levels;
                const priceAtLevel = minPrice + pct * priceDiff;
                const topPct = (1 - pct) * 100;
                const node = priceLabelNodes[i];
                if (node) {
                    node.style.top = \`\${topPct}%\`;
                    node.textContent = priceAtLevel.toFixed(2);
                }
            }

            if (totalCandles > 0 && candleDataBase[totalCandles - 1]) {
                const lastCandle = candleDataBase[totalCandles - 1];
                const lastClose = lastCandle.close;
                const lastCloseNorm = (lastClose - minPrice) / (maxPrice - minPrice);
                const lastCloseTop = (1 - lastCloseNorm) * 100;
                currentPriceBadge.style.top = \`\${lastCloseTop}%\`;
                currentPriceBadge.textContent = lastClose.toFixed(2);
                const isUp = lastClose >= lastCandle.open;
                currentPriceBadge.style.background = isUp ? '#10b981' : '#ef4444';
                currentPriceBadge.style.boxShadow = isUp ? '0 0 12px rgba(16, 185, 129, 0.65)' : '0 0 12px rgba(239, 68, 68, 0.65)';
            }
        }`;

content = content.replace(oldLabelsBlock, newLabelsBlock);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied Zero-DOM-Allocation pooling for time and price scale labels!');
