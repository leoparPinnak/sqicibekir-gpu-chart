import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

console.log('Contains CRLF:', content.includes('\r\n'));
console.log('Contains recalculateAllIndicators definition:', content.includes('window.recalculateAllIndicators'));
