import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const oldDragEngineBlock = `                // Canlı İvme Göstergesini Güncelle
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

const newDragEngineBlock = `                // Canlı İvme Göstergesini Güncelle
                const liveVxElem = document.getElementById('live-vx-val');
                const livePillElem = document.getElementById('live-status-pill');
                if (liveVxElem) liveVxElem.innerText = \`\${absVx.toFixed(2)} px/ms\`;

                // 🎯 İVMEYE VE YÖNE GÖRE KUSURSUZ KİLİTLEME:
                const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.15);

                if (isFastHorizontalSwipe) {
                    // 🌟 Kullanıcı eşiğin üzerinde hızlı yatay kaydırma yaptı -> Otomatik hizalama kilitlenir
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();

                    // 🌟 ESKİ KONUMA ASLA GERİ DÖNMEZ: Yeni baz noktası 0 olarak sabitlenir
                    origPriceOffset = 0;
                    priceOffset = 0;
                    chartDragStartY = e.clientY;

                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (dragAxisLocked !== 'horizontal' && (Math.abs(e.clientY - chartDragStartY) > 4 && absVy > absVx * 0.85 && absVy > 0.04)) {
                    // Kullanıcı kasıtlı olarak dikeyde yeni bir hareket başlattı -> Manuel moda geç
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
                    priceOffset = 0;
                } else {
                    const currentPriceSpan = maxPrice - minPrice;
                    if (currentPriceSpan > 0 && rect.height > 0) {
                        const pricePerPixel = currentPriceSpan / rect.height;
                        priceOffset = origPriceOffset + ((e.clientY - chartDragStartY) * pricePerPixel);
                    }
                }`;

content = content.replace(oldDragEngineBlock, newDragEngineBlock);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Fixed auto-fit position persistence so it never reverts to old offset!');
