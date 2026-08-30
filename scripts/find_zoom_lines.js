import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('wheel') || lines[i].includes('deltaY') || lines[i].includes('zoom') || lines[i].includes('smoothMinPrice')) {
        console.log(`L${i+1}: ${lines[i].trim()}`);
    }
}
