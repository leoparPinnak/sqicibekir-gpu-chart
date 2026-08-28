import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Make hitTest more forgiving for touch and precision
content = content.replace(
    /if \(Math\.hypot\(mx - sx, my - sy\) <= 9\) \{/g,
    'if (Math.hypot(mx - sx, my - sy) <= 16) {'
);

content = content.replace(
    /if \(Math\.abs\(my - y1\) <= 6\) return/g,
    'if (Math.abs(my - y1) <= 12) return'
);

content = content.replace(
    /if \(dist <= 7\) return/g,
    'if (dist <= 12) return'
);

// 2. Ensure property toolbar stays on screen with high z-index
content = content.replace(
    /z-index: 35;\s*user-select: none;/,
    'z-index: 60;\n            user-select: none;\n            pointer-events: auto;'
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Hit test and property toolbar z-index updated!');
