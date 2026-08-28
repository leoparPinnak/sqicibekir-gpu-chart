import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const placeholder = `        window.openIndicatorModal = function() {
            alert('📊 İndikatör ve Göstergeler Modülü hazırlanıyor! Çok yakında RSI, MACD, Bollinger, EMA ve Özel Kod Editörü eklenecek.');
        };`;

content = content.replace(placeholder, '');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Removed old placeholder window.openIndicatorModal!');
