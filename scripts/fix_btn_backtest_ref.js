import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

content = content.replace(
    /document\.getElementById\('btn-backtest'\)\.classList\.add\('active'\);/g,
    `// btn-backtest removed for clean modular chart`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Removed btn-backtest classList reference!');
