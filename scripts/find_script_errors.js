import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Find all occurrences of <!-- inside <script>
const scriptStartIdx = content.indexOf('<script>\n        // ============================================================');
if (scriptStartIdx !== -1) {
    const scriptContent = content.substring(scriptStartIdx);
    const matches = [...scriptContent.matchAll(/<!--[\s\S]*?-->/g)];
    console.log('HTML comments found inside script:', matches.map(m => m[0]));
} else {
    console.log('Main script block not found with expected string');
}
