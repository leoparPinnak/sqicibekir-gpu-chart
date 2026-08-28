import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const safeBlock = `
            const totalSigElem = document.getElementById('vbt-total-sig');
            if (totalSigElem) {
                totalSigElem.innerText = visibleSignals.length;
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
            }
`;

content = content.replace(
    /document\.getElementById\('vbt-total-sig'\)\.innerText = visibleSignals\.length;[\s\S]*?netPnlElem\.innerText = `\$\{netPnlPct\.toFixed\(2\)\}% \(-[^\`]*`;\s*\}/,
    safeBlock.trim()
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('updateVisibleBacktestSummary safely guarded!');
