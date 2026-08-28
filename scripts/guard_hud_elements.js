import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const oldHudUpdates = `            const hudRegime = document.getElementById('hud-regime');
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

const newHudUpdates = `            const hudRegime = document.getElementById('hud-regime');
            const hudEma = document.getElementById('hud-ema');
            const hudTrend = document.getElementById('hud-trend');

            if (hudRegime) {
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
            }

            if (hudEma) {
                if (lastClose >= lastEma) {
                    hudEma.innerText = \`\${tfCfg.emaLabel}: ÜSTÜNDE (BOĞA)\`;
                    hudEma.className = 'hud-tag tag-bull';
                } else {
                    hudEma.innerText = \`\${tfCfg.emaLabel}: ALTINDA (AYI)\`;
                    hudEma.className = 'hud-tag tag-bear';
                }
            }

            if (hudTrend) {
                if (lastReg > 0.5 && lastClose >= lastEma) {
                    hudTrend.innerText = 'GÜÇLÜ BOĞA';
                    hudTrend.className = 'hud-tag tag-bull';
                } else if (lastReg < -0.5 && lastClose < lastEma) {
                    hudTrend.innerText = 'GÜÇLÜ AYI';
                    hudTrend.className = 'hud-tag tag-bear';
                } else {
                    hudTrend.innerText = 'NÖTR / DÖNÜŞ';
                    hudTrend.className = 'hud-tag tag-bull';
                }
            }`;

content = content.replace(oldHudUpdates, newHudUpdates);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Guarded all removed HUD elements in updateGpuTextures!');
