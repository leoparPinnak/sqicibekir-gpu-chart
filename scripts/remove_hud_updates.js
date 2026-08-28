import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace lines 2452-2485 completely
const targetBlock = `            const hudRegime = document.getElementById('hud-regime');
            const hudEma = document.getElementById('hud-ema');
            const hudTrend = document.getElementById('hud-trend');

            if (lastReg > 0.5) {
                hudRegime.innerText = \`\${tfCfg.regimeLabel}: BOĞA (YEŞİL)\`;
                hudRegime.className = 'hud-tag tag-bull';
            } else if (lastReg < -0.5) {
                hudRegime.innerText = \`\${tfCfg.regimeLabel}: AYI (KIRMIZI)\`;
                hudRegime.className = 'hud-tag tag-bear';
            } else {
                hudRegime.innerText = \`\${tfCfg.regimeLabel}: NÖTR\`;
                hudRegime.className = 'hud-tag tag-bull';
            }

            if (lastClose >= lastEma) {
                hudEma.innerText = \`\${tfCfg.emaLabel}: ÜSTÜNDE (BOĞA)\`;
                hudEma.className = 'hud-tag tag-bull';
            } else {
                hudEma.innerText = \`\${tfCfg.emaLabel}: ALTINDA (AYI)\`;
                hudEma.className = 'hud-tag tag-bear';
            }

            if (lastReg > 0.5 && lastClose >= lastEma) {
                hudTrend.innerText = 'GÜÇLÜ BOĞA';
                hudTrend.className = 'hud-tag tag-bull';
            } else if (lastReg < -0.5 && lastClose < lastEma) {
                hudTrend.innerText = 'GÜÇLÜ AYI';
                hudTrend.className = 'hud-tag tag-bear';
            } else {
                hudTrend.innerText = 'NÖTR / DÖNÜŞ';
                hudTrend.className = 'hud-tag tag-bull';
            }`;

content = content.replace(targetBlock, '// HUD labels removed for clean chart');

// Also check if any remaining hudRegime / hudEma references exist
content = content.replace(/const hudRegime\s*=\s*document\.getElementById\('hud-regime'\);[\s\S]*?hudTrend\.className\s*=\s*'hud-tag tag-bull';\s*\}/m, '// HUD labels removed');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Removed HUD text updates cleanly!');
