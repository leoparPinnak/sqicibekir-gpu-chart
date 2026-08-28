import fs from 'fs';
import path from 'path';

const dir = 'tradingview_drawing_doms';

// Function to extract items from a flyout HTML file
function parseFlyoutHtml(filename) {
    const html = fs.readFileSync(path.join(dir, filename), 'utf8');
    const items = [];
    
    // Match rows: <div role="row" ... data-name="LineTool..." ...> ... </div>
    // or titles: <div ... class="title-..." ...>
    const rowRegex = /<div role="row"[^>]*aria-label="([^"]+)"[^>]*data-name="([^"]+)"[\s\S]*?<\/tr>|<div role="row"[^>]*aria-label="([^"]+)"[^>]*data-name="([^"]+)"[\s\S]*?(?=<div role="row"|<tr|$)/gi;
    
    // Simpler regex matching aria-label, data-name, and SVG
    const itemBlockRegex = /<div role="row"[^>]*aria-label="([^"]+)"[^>]*data-name="([^"]+)"([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    
    return html;
}

console.log('DOM parser script ready');
