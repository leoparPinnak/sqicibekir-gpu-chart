import fs from 'fs';

let lines = fs.readFileSync('indikator_sablonu.html', 'utf8').split('\n');

lines.forEach((line, idx) => {
    if (line.includes('.save()') || line.includes('.restore()')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
