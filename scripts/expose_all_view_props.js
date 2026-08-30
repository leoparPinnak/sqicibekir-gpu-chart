import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `        Object.defineProperty(window, 'priceOffset', {
            get() { return priceOffset; },
            set(v) { priceOffset = v; }
        });`;

const replacement = `        Object.defineProperty(window, 'priceOffset', {
            get() { return priceOffset; },
            set(v) { priceOffset = v; }
        });
        Object.defineProperty(window, 'viewStart', {
            get() { return viewStart; },
            set(v) { viewStart = v; }
        });
        Object.defineProperty(window, 'viewEnd', {
            get() { return viewEnd; },
            set(v) { viewEnd = v; }
        });
        Object.defineProperty(window, 'smoothViewStart', {
            get() { return smoothViewStart; },
            set(v) { smoothViewStart = v; }
        });
        Object.defineProperty(window, 'smoothViewEnd', {
            get() { return smoothViewEnd; },
            set(v) { smoothViewEnd = v; }
        });
        Object.defineProperty(window, 'minPrice', {
            get() { return minPrice; },
            set(v) { minPrice = v; }
        });
        Object.defineProperty(window, 'maxPrice', {
            get() { return maxPrice; },
            set(v) { maxPrice = v; }
        });
        Object.defineProperty(window, 'smoothMinPrice', {
            get() { return smoothMinPrice; },
            set(v) { smoothMinPrice = v; }
        });
        Object.defineProperty(window, 'smoothMaxPrice', {
            get() { return smoothMaxPrice; },
            set(v) { smoothMaxPrice = v; }
        });`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Exposed all window scale and view properties!');
