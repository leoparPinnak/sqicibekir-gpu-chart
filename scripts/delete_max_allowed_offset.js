import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Completely remove the maxAllowedOffset clamping block
const targetToReplace = `                const maxAllowedOffset = pad * 1.2;
                priceOffset = Math.max(-maxAllowedOffset, Math.min(maxAllowedOffset, priceOffset));`;

if (content.includes(targetToReplace)) {
    content = content.replace(targetToReplace, `                // 🌟 SINIRSIZ DİKEY KAYDIRMA: maxAllowedOffset tamamen kaldırıldı`);
    console.log('Successfully found and removed maxAllowedOffset clamping block!');
} else {
    console.log('Warning: targetToReplace not found, searching with regex...');
    content = content.replace(
        /const maxAllowedOffset\s*=\s*pad\s*\*\s*1\.2;\s*priceOffset\s*=\s*Math\.max\(-maxAllowedOffset,\s*Math\.min\(maxAllowedOffset,\s*priceOffset\)\);/g,
        `// 🌟 SINIRSIZ DİKEY KAYDIRMA: maxAllowedOffset tamamen kaldırıldı`
    );
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
