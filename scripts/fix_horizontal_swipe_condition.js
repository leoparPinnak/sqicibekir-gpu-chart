import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 3.0 && Math.abs(e.clientY - chartDragStartY) < 3);`;
const replacement = `const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.25);`;

content = content.replace(target, replacement);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully fixed horizontal swipe trigger condition!');
