import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

if (!content.includes('window.activeIndicators = activeIndicators;')) {
    content = content.replace('let activeIndicators = [];', 'let activeIndicators = [];\n        window.activeIndicators = activeIndicators;');
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Exposed window.activeIndicators!');
