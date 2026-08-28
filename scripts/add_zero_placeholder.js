import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Initialize placeholder data before fetch
const placeholderSetup = `        let candleDataBase = [];
        let candleDataEma = [];
        let candleDataRegime = [];

        // Başlangıçta ekranın ortasında 0 boyutta düz çizgi gibi duran başlangıç mumları
        (function initZeroHeightPlaceholder() {
            const now = Date.now();
            const initP = 75000;
            const dummyArr = [];
            for (let i = 0; i < 150; i++) {
                dummyArr.push({
                    time: now - (150 - i) * 60000,
                    open: initP,
                    high: initP,
                    low: initP,
                    close: initP,
                    vol: 1
                });
            }
            candleDataBase = dummyArr;
            candleDataEma = dummyArr;
            candleDataRegime = dummyArr;
            totalCandles = 150;
            viewStart = 0;
            viewEnd = 150;
        })();`;

content = content.replace(
    /let candleDataBase = \[\];\s*let candleDataEma = \[\];\s*let candleDataRegime = \[\];/,
    placeholderSetup
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Zero-height placeholder candle setup applied!');
