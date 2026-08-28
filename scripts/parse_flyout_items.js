import fs from 'fs';
import path from 'path';

const files = [
    { name: 'Trend Çizgileri', file: '02_flyout_trend_lines.html', id: 'tv-menu-lines' },
    { name: 'Gann ve Fibonacci', file: '03_flyout_gann_fibonacci.html', id: 'tv-menu-fib' },
    { name: 'Geometrik Şekiller', file: '04_flyout_geometric_shapes.html', id: 'tv-menu-shapes' },
    { name: 'Açıklama Araçları', file: '05_flyout_annotation.html', id: 'tv-menu-text' },
    { name: 'Formasyonlar / Desenler', file: '06_flyout_patterns.html', id: 'tv-menu-patterns' },
    { name: 'Tahmin ve Ölçüm', file: '07_flyout_prediction_measurement.html', id: 'tv-menu-measure' },
    { name: 'İkonlar & Çıkartmalar', file: '08_flyout_font_icons.html', id: 'tv-menu-icons' }
];

const result = {};

files.forEach(f => {
    const html = fs.readFileSync(path.join('tradingview_drawing_doms', f.file), 'utf8');
    
    // Parse items inside the flyout
    // Look for data-name or title or label
    const itemRegex = /<div[^>]*data-name="([^"]+)"[^>]*>([\s\S]*?)<\/div>(?=(?:<div[^>]*data-name=)|$)/gi;
    
    // Also look for item classes
    const matchItems = html.match(/<tr[^>]*data-name="([^"]+)"|<div[^>]*data-name="([^"]+)"/g);
    console.log(`\n=== ${f.name} (${f.file}) ===`);
    console.log(matchItems);
});
