import fs from 'fs';
import vm from 'vm';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Extract all <script> blocks (excluding x-shader types)
const scriptRegex = /<script(?![^>]*type=["']x-shader)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(content)) !== null) {
    count++;
    const jsCode = match[1];
    try {
        new vm.Script(jsCode);
        console.log(`Script tag #${count}: VALID JS (Length: ${jsCode.length} chars)`);
    } catch (err) {
        console.error(`Script tag #${count}: SYNTAX ERROR:`, err.message);
        // Find line of error
        const lines = jsCode.split('\n');
        console.log('Error around start of script:');
        console.log(lines.slice(0, 30).join('\n'));
    }
}
