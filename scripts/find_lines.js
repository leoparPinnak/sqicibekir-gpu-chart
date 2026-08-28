import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('recalculateAllIndicators') || lines[i].includes('BUILTIN_INDICATOR_DEFS')) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
}
