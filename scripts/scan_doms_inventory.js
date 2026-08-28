import fs from 'fs';
import path from 'path';

const dir = 'tradingview_drawing_doms';
const files = fs.readdirSync(dir);

console.log('=== TRADINGVIEW DRAWING DOMS TOOL INVENTORY ===');

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        const html = fs.readFileSync(filePath, 'utf8');
        
        // Find data-tool, data-name, title, or label occurrences
        const toolMatches = html.match(/data-tool="([^"]+)"|data-name="([^"]+)"|title="([^"]+)"|aria-label="([^"]+)"/g);
        console.log(`\nFile: ${file} (Size: ${html.length} bytes)`);
        
        // Match items with title / name
        const itemRegex = /<div[^>]*class="[^"]*item[^"]*"[^>]*title="([^"]*)"/gi;
        let m;
        const titles = [];
        while ((m = itemRegex.exec(html)) !== null) {
            if (m[1]) titles.push(m[1]);
        }
        
        // Also check for button titles or text spans
        const titleRegex = /title="([^"]+)"/gi;
        const allTitles = [];
        while ((m = titleRegex.exec(html)) !== null) {
            allTitles.push(m[1]);
        }
        
        console.log(`Found titles (${allTitles.length}):`, allTitles.slice(0, 15));
    }
});
