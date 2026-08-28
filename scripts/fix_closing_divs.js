import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

content = content.replace(
    /<!-- İndikatör Katmanları & Backtest & OttOnline Butonu -->\s*<div class="indicator-nav"><\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
    `<div class="indicator-nav"></div>\n        </div>`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed extra closing div tags in top toolbar!');
