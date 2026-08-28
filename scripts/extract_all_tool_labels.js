import fs from 'fs';
import path from 'path';

const dir = 'tradingview_drawing_doms';
const flyoutFiles = [
    '01_left_drawing_toolbar.html',
    '02_flyout_trend_lines.html',
    '03_flyout_gann_fibonacci.html',
    '04_flyout_geometric_shapes.html',
    '05_flyout_annotation.html',
    '06_flyout_patterns.html',
    '07_flyout_prediction_measurement.html',
    '08_flyout_font_icons.html',
    '09_drawing_floating_property_toolbar.html',
    '14_favorite_floating_draggable_toolbar.html'
];

flyoutFiles.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Extract text contents inside items / labels / spans
    const labelMatches = html.match(/<span[^>]*class="[^"]*(?:title|label|text)[^"]*"[^>]*>([^<]+)<\/span>|<div[^>]*class="[^"]*(?:title|label|text)[^"]*"[^>]*>([^<]+)<\/div>|data-name="([^"]+)"|data-tool="([^"]+)"/gi);
    
    console.log(`\n========================================`);
    console.log(`FILE: ${file}`);
    console.log(`========================================`);
    
    // Extract text nodes with Turkish names
    const textRegex = />([A-ZÇĞİÖŞÜa-zçğıöşü0-9\s\+\-\/\:\(\)\.\,\%\&]+)</g;
    let m;
    const extracted = new Set();
    while ((m = textRegex.exec(html)) !== null) {
        const str = m[1].trim();
        if (str.length > 1 && !str.startsWith('http') && !str.includes('{') && !str.includes('}') && !str.includes('function') && !str.includes('px') && !str.includes('var(')) {
            extracted.add(str);
        }
    }
    console.log(Array.from(extracted));
});
