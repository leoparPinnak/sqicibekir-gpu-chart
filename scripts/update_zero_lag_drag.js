import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const target = `                if (!smoothMinPrice || !isFinite(smoothMinPrice) || smoothMinPrice === 0) {
                    smoothMinPrice = targetMinPrice;
                    smoothMaxPrice = targetMaxPrice;
                    smoothViewStart = viewStart;
                    smoothViewEnd = viewEnd;
                } else {
                    const priceLerp = isChartDragging ? 0.45 : 0.32;
                    const viewLerp = isChartDragging ? 0.48 : 0.35;
                    smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                    smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                    smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                    smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                }`;

const replacement = `                if (!smoothMinPrice || !isFinite(smoothMinPrice) || smoothMinPrice === 0) {
                    smoothMinPrice = targetMinPrice;
                    smoothMaxPrice = targetMaxPrice;
                    smoothViewStart = viewStart;
                    smoothViewEnd = viewEnd;
                } else {
                    if (isChartDragging) {
                        // 🚀 SÜRÜKLEME ANINDA 0ms GECİKME (1:1 BİREBİR VE ANLIK İMLEÇ TAKİBİ - SIFIR TAKILMA)
                        smoothViewStart = viewStart;
                        smoothViewEnd = viewEnd;
                        if (!isAutoPriceScale) {
                            smoothMinPrice = targetMinPrice;
                            smoothMaxPrice = targetMaxPrice;
                        } else {
                            const priceLerp = 0.50;
                            smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                            smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                        }
                    } else {
                        // Zoom in/out ve ivmeli serbest kaymada ipeksi LERP animasyonu
                        const priceLerp = 0.32;
                        const viewLerp = 0.35;
                        smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                    }
                }`;

content = content.replace(target, replacement);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated zero-lag drag rendering in indikator_sablonu.html!');
