import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const targetLerp = `                    } else {
                        // Zoom in/out ve ivmeli serbest kaymada ipeksi LERP animasyonu
                        const priceLerp = 0.32;
                        const viewLerp = 0.35;
                        smoothViewStart += (viewStart - smoothViewStart) * viewLerp;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * viewLerp;
                        smoothMinPrice += (targetMinPrice - smoothMinPrice) * priceLerp;
                        smoothMaxPrice += (targetMaxPrice - smoothMaxPrice) * priceLerp;
                    }`;

const replacementLerp = `                    } else {
                        // 🌟 DOĞAL LOGARİTMİK (NATURAL LOGARITHMIC - ln) SİNEMATİK ZOOM MOTORU
                        // İnsan gözünün algısal ölçek algısına (Weber-Fechner Yasası) dayalı pürüzsüz geçiş:
                        // Ekrandaki mumların boyutu ne kadar farklı olursa olsun, doğrusal zıplama yerine
                        // doğal logaritmik hız eğrisiyle (ln) kademeli ve ipeksi bir şekilde büyür/küçülür.

                        const viewAlpha = 0.18;
                        smoothViewStart += (viewStart - smoothViewStart) * viewAlpha;
                        smoothViewEnd += (viewEnd - smoothViewEnd) * viewAlpha;

                        // Dikey Eksen: Doğal Logaritmik Fiyat Skalası Enterpolasyonu
                        const currSpan = Math.max(0.0001, smoothMaxPrice - smoothMinPrice);
                        const targetSpan = Math.max(0.0001, targetMaxPrice - targetMinPrice);
                        const currMid = (smoothMinPrice + smoothMaxPrice) / 2;
                        const targetMid = (targetMinPrice + targetMaxPrice) / 2;

                        // 1. Merkez Fiyat Geçişi (Mid-Price Smooth Drift)
                        const nextMid = currMid + (targetMid - currMid) * 0.16;

                        // 2. Skala Açıklığı Geçişi (Logarithmic Span Interpolation: ln(S))
                        const logCurr = Math.log(currSpan);
                        const logTarget = Math.log(targetSpan);
                        const logAlpha = 0.12; // Doğal logaritmik süzülme katsayısı
                        const nextLogSpan = logCurr + (logTarget - logCurr) * logAlpha;
                        const nextSpan = Math.exp(nextLogSpan);

                        smoothMinPrice = nextMid - (nextSpan / 2);
                        smoothMaxPrice = nextMid + (nextSpan / 2);
                    }`;

content = content.replace(targetLerp, replacementLerp);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully applied logarithmic scale zoom engine!');
