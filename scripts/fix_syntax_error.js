import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const targetBrokenBlock = `            const lastIdx = totalCandles - 1;
            const lastClose = candleDataBase[lastIdx].close;
            const lastReg = ind.regime1D[lastIdx];
            const lastEma = ind.ema4H[lastIdx];

            // HUD labels removed else if (lastReg < -0.5 && lastClose < lastEma) {
                hudTrend.innerText = 'GÜÇLÜ AYI';
                hudTrend.className = 'hud-tag tag-bear';
            } else {
                hudTrend.innerText = 'NÖTR / DÖNÜŞ';
                hudTrend.className = 'hud-tag tag-bull';
            }

            document.getElementById('ohlc-atr').innerText = ind.atrArr[lastIdx].toFixed(2);
            updateVisibleBacktestSummary();`;

const cleanBlock = `            const lastIdx = totalCandles - 1;
            if (ind && ind.atrArr && ind.atrArr[lastIdx]) {
                const atrEl = document.getElementById('ohlc-atr');
                if (atrEl) atrEl.innerText = ind.atrArr[lastIdx].toFixed(2);
            }
            updateVisibleBacktestSummary();`;

content = content.replace(targetBrokenBlock, cleanBlock);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed broken else block in updateGpuTextures!');
