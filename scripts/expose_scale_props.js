import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)
        let dragAxisLocked = null; // 'horizontal' | 'vertical' | null`;

const replacement = `        let isAutoPriceScale = true; // 🌟 Otomatik Fiyat Ölçekleme (OTO Modu)
        let dragAxisLocked = null; // 'horizontal' | 'vertical' | null
        Object.defineProperty(window, 'isAutoPriceScale', {
            get() { return isAutoPriceScale; },
            set(v) { isAutoPriceScale = v; }
        });
        Object.defineProperty(window, 'priceOffset', {
            get() { return priceOffset; },
            set(v) { priceOffset = v; }
        });`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Exposed window getters/setters for isAutoPriceScale and priceOffset!');
