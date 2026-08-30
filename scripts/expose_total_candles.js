import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `        Object.defineProperty(window, 'smoothMaxPrice', {
            get() { return smoothMaxPrice; },
            set(v) { smoothMaxPrice = v; }
        });`;

const replacement = `        Object.defineProperty(window, 'smoothMaxPrice', {
            get() { return smoothMaxPrice; },
            set(v) { smoothMaxPrice = v; }
        });
        Object.defineProperty(window, 'totalCandles', {
            get() { return totalCandles; },
            set(v) { totalCandles = v; }
        });`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Exposed window.totalCandles!');
