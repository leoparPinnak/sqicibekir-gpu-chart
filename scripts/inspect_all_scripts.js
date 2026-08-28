import fs from 'fs';
import vm from 'vm';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Find all script tags
const matches = [...content.matchAll(/<script[\s\S]*?<\/script>/gi)];
console.log(`Found ${matches.length} total script tags in HTML.`);

for (let i = 0; i < matches.length; i++) {
    const raw = matches[i][0];
    const isShader = raw.includes('x-shader');
    const inner = raw.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    console.log(`Tag #${i + 1}: ${isShader ? 'SHADER' : 'JS'}, Length: ${inner.length} chars`);
    if (!isShader) {
        try {
            new vm.Script(inner);
            console.log(`  -> Syntax Valid!`);
        } catch (e) {
            console.log(`  -> Syntax ERROR:`, e.message);
            console.log(`  -> Starts with:`, inner.slice(0, 100));
        }
    }
}
