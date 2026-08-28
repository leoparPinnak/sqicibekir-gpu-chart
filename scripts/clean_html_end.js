import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Cut off everything after the first </html>
const htmlEndIdx = content.indexOf('</html>');
if (htmlEndIdx !== -1) {
    content = content.substring(0, htmlEndIdx + 7) + '\n';
}

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cleaned HTML after </html>');
