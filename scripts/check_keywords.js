import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');
console.log('File length:', content.length);

const keywords = ['velocity', 'Threshold', 'autoPrice', 'isAutoPriceScale', 'startPan', 'isPanning', 'onPan'];
for (const kw of keywords) {
    const count = (content.match(new RegExp(kw, 'gi')) || []).length;
    console.log(`${kw}: ${count} matches`);
}
