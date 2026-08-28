import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const modalOccurrences = [...content.matchAll(/id="fx-modal-backdrop"/g)].length;
const funcOccurrences = [...content.matchAll(/openIndicatorModal/g)].length;

console.log('modalOccurrences:', modalOccurrences);
console.log('openIndicatorModal occurrences:', funcOccurrences);

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('openIndicatorModal')) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
}
