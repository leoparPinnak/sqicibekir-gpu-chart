import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace all unsafe vbt / active-strat-footer assignments
content = content.replace(
    /document\.getElementById\('vbt-strat-title'\)\.innerText = [^;]+;/g,
    `const vbtTitle = document.getElementById('vbt-strat-title'); if (vbtTitle) vbtTitle.innerText = getStratTitle(activeStrategy, tf);`
);

content = content.replace(
    /document\.getElementById\('active-strat-footer'\)\.innerHTML = [^;]+;/g,
    `const stratFoot = document.getElementById('active-strat-footer'); if (stratFoot) stratFoot.innerHTML = getStratFooter(activeStrategy, tf);`
);

// In setStrategy:
content = content.replace(
    /document\.getElementById\('vbt-strat-title'\)\.innerText = getStratTitle\(stratId, currentTimeframe\);/,
    `const vbtTitle2 = document.getElementById('vbt-strat-title'); if (vbtTitle2) vbtTitle2.innerText = getStratTitle(stratId, currentTimeframe);`
);

content = content.replace(
    /document\.getElementById\('active-strat-footer'\)\.innerHTML = getStratFooter\(stratId, currentTimeframe\);/,
    `const stratFoot2 = document.getElementById('active-strat-footer'); if (stratFoot2) stratFoot2.innerHTML = getStratFooter(stratId, currentTimeframe);`
);

// In updateVisibleBacktestSummary:
content = content.replace(
    /document\.getElementById\('vbt-total-sig'\)\.innerText = visibleSignals\.length;/g,
    `const elTotal = document.getElementById('vbt-total-sig'); if (elTotal) elTotal.innerText = visibleSignals.length;`
);

content = content.replace(
    /document\.getElementById\('vbt-tp-count'\)\.innerText = tpCount;/g,
    `const elTp = document.getElementById('vbt-tp-count'); if (elTp) elTp.innerText = tpCount;`
);

content = content.replace(
    /document\.getElementById\('vbt-sl-count'\)\.innerText = slCount;/g,
    `const elSl = document.getElementById('vbt-sl-count'); if (elSl) elSl.innerText = slCount;`
);

content = content.replace(
    /document\.getElementById\('vbt-open-count'\)\.innerText = openCount;/g,
    `const elOpen = document.getElementById('vbt-open-count'); if (elOpen) elOpen.innerText = openCount;`
);

content = content.replace(
    /document\.getElementById\('vbt-winrate'\)\.innerText = `%\${winRate}`;/g,
    `const elWin = document.getElementById('vbt-winrate'); if (elWin) elWin.innerText = \`%\${winRate}\`;`
);

content = content.replace(
    /finalBalanceElem\.innerText = `\$\${currentCapital\.toLocaleString\('en-US', \{minimumFractionDigits: 2, maximumFractionDigits: 2\}\)}`;/g,
    `if (finalBalanceElem) finalBalanceElem.innerText = \`$\${currentCapital.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;`
);

content = content.replace(
    /finalBalanceElem\.className = 'pnl-badge-up';\s*netPnlElem\.className = 'pnl-badge-up';\s*netPnlElem\.innerText = `\+\${netPnlPct\.toFixed\(2\)}% \(\+\$\${/g,
    `if (finalBalanceElem) finalBalanceElem.className = 'pnl-badge-up';\n            if (netPnlElem) {\n                netPnlElem.className = 'pnl-badge-up';\n                netPnlElem.innerText = \`+\${netPnlPct.toFixed(2)}% (+\$\${`
);

content = content.replace(
    /finalBalanceElem\.className = 'pnl-badge-down';\s*netPnlElem\.className = 'pnl-badge-down';\s*netPnlElem\.innerText = `\${netPnlPct\.toFixed\(2\)}% \(-\$\${/g,
    `if (finalBalanceElem) finalBalanceElem.className = 'pnl-badge-down';\n            if (netPnlElem) {\n                netPnlElem.className = 'pnl-badge-down';\n                netPnlElem.innerText = \`\${netPnlPct.toFixed(2)}% (-\$\${`
);

// Close the if (netPnlElem) blocks cleanly
content = content.replace(
    /netPnlElem\.innerText = `\+\${netPnlPct\.toFixed\(2\)}% \(\+\$\${\(currentCapital - initialCapital\)\.toFixed\(2\)}\)\s*`;/g,
    `netPnlElem.innerText = \`+\${netPnlPct.toFixed(2)}% (+\$\${(currentCapital - initialCapital).toFixed(2)}) \`;\n            }`
);

content = content.replace(
    /netPnlElem\.innerText = `\${netPnlPct\.toFixed\(2\)}% \(-\$\${\(initialCapital - currentCapital\)\.toFixed\(2\)}\)\s*`;/g,
    `netPnlElem.innerText = \`\${netPnlPct.toFixed(2)}% (-\$\${(initialCapital - currentCapital).toFixed(2)}) \`;\n            }`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Safe null guards applied for all DOM elements!');
