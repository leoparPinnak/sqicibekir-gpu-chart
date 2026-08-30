import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('startPan') || lines[i].includes('velocityHistory') || lines[i].includes('isAutoPriceScale') || lines[i].includes('velocityThreshold') || lines[i].includes('hud-alert-badge')) {
        console.log(`L${i+1}: ${lines[i].trim()}`);
    }
}
