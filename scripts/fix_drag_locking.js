import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const oldDragBlock = `                // Canlı İvme Göstergesini Güncelle
                const liveVxElem = document.getElementById('live-vx-val');
                const livePillElem = document.getElementById('live-status-pill');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;

                // 🎯 KULLANICI AYARLI İVMEYE GÖRE OTOMATİK HİZALAMA
                if (absVx >= velocityThreshold && absVx >= absVy * 1.15) {
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (absVy >= velocityThreshold && absVy > absVx * 1.3) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (livePillElem && !isAutoPriceScale) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                }

                // 1. Yatay Zaman Kaydırma (X-Axis)
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
                const minAllowedStart = -80;
                const maxAllowedEnd = totalCandles + maxRightSpace;

                if (nStart < minAllowedStart) {
                    nStart = minAllowedStart;
                    nEnd = minAllowedStart + candleSpan;
                }
                if (nEnd > maxAllowedEnd) {
                    nEnd = maxAllowedEnd;
                    nStart = maxAllowedEnd - candleSpan;
                }

                viewStart = nStart;
                viewEnd = nEnd;

                // 2. Dikey Eksen Yönetimi
                if (dragAxisLocked === 'horizontal' || isAutoPriceScale) {
                    priceOffset += (0 - priceOffset) * 0.22;
                    if (Math.abs(priceOffset) < 0.5) priceOffset = 0;
                } else {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }`;

const newDragBlock = `                // Canlı İvme Göstergesini Güncelle
                const liveVxElem = document.getElementById('live-vx-val');
                const livePillElem = document.getElementById('live-status-pill');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;

                // 🎯 İVMEYE VE YÖNE GÖRE KUSURSUZ KİLİTLEME:
                const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.15);

                if (isFastHorizontalSwipe) {
                    // Kullanıcı eşiğin üzerinde hızlı yatay kaydırma yaptı -> Otomatik hizalama kilitlenir
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (Math.abs(deltaPy) > 2 || (absVy > absVx * 0.8 && absVy > 0.04)) {
                    // Kullanıcı dikeyde hareket ettirdi -> Manuel mod anında serbest bırakılır
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }

                // 1. Yatay Zaman Kaydırma (X-Axis)
                const candleSpan = origViewEnd - origViewStart;
                const deltaCandles = (deltaPx / rect.width) * candleSpan;

                let nStart = origViewStart - deltaCandles;
                let nEnd = origViewEnd - deltaCandles;

                const maxRightSpace = Math.max(400, Math.round(totalCandles * 1.0));
                const minAllowedStart = -80;
                const maxAllowedEnd = totalCandles + maxRightSpace;

                if (nStart < minAllowedStart) {
                    nStart = minAllowedStart;
                    nEnd = minAllowedStart + candleSpan;
                }
                if (nEnd > maxAllowedEnd) {
                    nEnd = maxAllowedEnd;
                    nStart = maxAllowedEnd - candleSpan;
                }

                viewStart = nStart;
                viewEnd = nEnd;

                // 2. Dikey Eksen Yönetimi
                if (isAutoPriceScale) {
                    priceOffset += (0 - priceOffset) * 0.22;
                    if (Math.abs(priceOffset) < 0.5) priceOffset = 0;
                } else {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + (deltaPy * pricePerPixel);
                    }
                }`;

content = content.replace(oldDragBlock, newDragBlock);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed vertical drag locking when threshold is high!');
