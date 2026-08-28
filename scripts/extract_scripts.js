import fs from 'fs';

let html = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Extract all <script> contents (excluding shaders)
const scriptRegex = /<script(?![^>]*type=['"]x-shader)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
    count++;
    const code = match[1];
    fs.writeFileSync(`scripts/temp_extracted_script_${count}.js`, code, 'utf8');
    console.log(`Extracted script ${count}, length: ${code.length}`);
}
