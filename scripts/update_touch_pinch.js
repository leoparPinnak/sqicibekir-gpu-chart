import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `            } else if (e.touches.length === 2 && touchStartDist > 0) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;`;

const replacement = `            } else if (e.touches.length === 2 && touchStartDist > 0) {
                isAutoPriceScale = true;
                priceOffset = 0;
                priceScaleFactor = 1.0;
                updateOtoButtonState();
                const dx = e.touches[0].clientX - e.touches[1].clientX;`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Added auto-scale reset to touch pinch zoom!');
