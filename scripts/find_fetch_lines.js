import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('candleDataBase =') || lines[i].includes('totalCandles =') || lines[i].includes('fetchAllMultiTimeframeKlines')) {
        console.log(`L${i+1}: ${lines[i].trim()}`);
    }
}
