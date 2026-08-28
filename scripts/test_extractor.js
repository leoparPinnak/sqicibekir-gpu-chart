import fs from 'fs';
import path from 'path';

function extractToolsFromFlyout(filename) {
    const html = fs.readFileSync(path.join('tradingview_drawing_doms', filename), 'utf8');
    
    // Find all item rows
    // Pattern: aria-label="Label" data-name="ToolName"
    const regex = /<div role="row"[^>]*aria-label="([^"]+)"[^>]*data-name="([^"]+)"([\s\S]*?)(?=<div role="row"|<tr|$)/gi;
    let m;
    const tools = [];
    
    while ((m = regex.exec(html)) !== null) {
        const label = m[1];
        const dataName = m[2];
        const content = m[3];
        
        // Extract SVG
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
        const svg = svgMatch ? svgMatch[0] : '';
        
        // Extract hotkey
        const hotkeyMatch = content.match(/<div class="accessibleShortcut-[^"]*">([^<]+)<\/div>|<span class="accessibleShortcut-[^"]*">([^<]+)<\/span>/i);
        const hotkey = hotkeyMatch ? (hotkeyMatch[1] || hotkeyMatch[2]) : '';
        
        tools.push({ label, dataName, svg, hotkey });
    }
    return tools;
}

console.log('--- Trend Lines ---');
console.log(extractToolsFromFlyout('02_flyout_trend_lines.html'));
