import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace the artificial priceOffset clamping with unrestricted free vertical panning
const oldClamping = `                const span = Math.max(0.0001, maxP - minP);
                const pad = span * 0.12;
                const baseHalfSpan = (span / 2) + pad;
                const scaledHalfSpan = baseHalfSpan / priceScaleFactor;

                const maxAllowedOffset = pad * 1.2;
                priceOffset = Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, priceOffset));

                const midP = (minP + maxP) / 2;`;

const newClamping = `                const span = Math.max(0.0001, maxP - minP);
                const pad = span * 0.12;
                const baseHalfSpan = (span / 2) + pad;
                const scaledHalfSpan = baseHalfSpan / priceScaleFactor;

                // 🌟 SINIRSIZ SERBEST DİKEY KAYDIRMA (TradingView Free Vertical Pan)
                // Dikey eksendeki yapay sınır kaldırıldı; kullanıcı grafiği yukarı/aşağı tamamen özgürce kaydırabilir.

                const midP = (minP + maxP) / 2;`;

content = content.replace(oldClamping, newClamping);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Unrestricted free vertical panning applied successfully!');
