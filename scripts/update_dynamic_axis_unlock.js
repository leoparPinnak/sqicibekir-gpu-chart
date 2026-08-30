import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const targetChunk = `                // 🎯 İVMEYE VE YÖNE GÖRE KUSURSUZ KİLİTLEME:
                const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.15);

                if (isFastHorizontalSwipe) {
                    // ⚡ EŞİK AŞILDI & OTO KİLİT AKTİF
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();

                    origPriceOffset = 0;
                    priceOffset = 0;
                    chartDragStartY = e.clientY;

                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge alert-locked';
                        alertText.innerText = \`⚡ EŞİK AŞILDI (\${absVx.toFixed(2)} ≥ \${velocityThreshold.toFixed(2)})\`;
                    }
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else if (dragAxisLocked !== 'horizontal' && (Math.abs(e.clientY - chartDragStartY) > 4 && absVy > absVx * 0.85 && absVy > 0.04)) {
                    dragAxisLocked = 'vertical';
                    isAutoPriceScale = false;
                    updateOtoButtonState();
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                        alertText.innerText = 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = 'MANUEL SERBEST';
                        livePillElem.className = 'status-pill free';
                    }
                } else {
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                        alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }`;

const replacementChunk = `                // 🎯 İVMEYE VE YÖNE GÖRE DİNAMİK KİLİTLEME VE ÇÖZME (Continuous Gesture Dynamic Axis Lock & Unlock):
                const isFastHorizontalSwipe = (absVx >= velocityThreshold && absVx >= absVy * 1.15);

                if (isFastHorizontalSwipe) {
                    // ⚡ EŞİK AŞILDI & OTO KİLİT AKTİF
                    dragAxisLocked = 'horizontal';
                    isAutoPriceScale = true;
                    updateOtoButtonState();

                    origPriceOffset = 0;
                    priceOffset = 0;
                    chartDragStartY = e.clientY;

                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge alert-locked';
                        alertText.innerText = \`⚡ EŞİK AŞILDI (\${absVx.toFixed(2)} ≥ \${velocityThreshold.toFixed(2)})\`;
                    }
                    if (livePillElem) {
                        livePillElem.innerText = 'OTO KİLİTLENDİ';
                        livePillElem.className = 'status-pill locked';
                    }
                } else {
                    // 🔓 HIZ EŞİK ALTINA İNDİĞİNDE:
                    // Kullanıcı fareyi bırakmadan basılı tutmaya devam etse bile, hız eşiğin altına indiği an
                    // dikey hareket algılanır algılanmaz kilit anında çözülür ve serbest dikey kaydırmaya izin verilir!
                    if (alertBadge) {
                        alertBadge.className = 'hud-status-badge free';
                    }

                    const isVerticalIntent = Math.abs(e.clientY - chartDragStartY) > 3 || (absVy > 0.03 && absVy > absVx * 0.5);

                    if (isVerticalIntent && isAutoPriceScale) {
                        // OTO KİLİTTEN MANUEL DİKEY SÜRÜKLEMEYE KESİNTİSİZ GEÇİŞ
                        isAutoPriceScale = false;
                        dragAxisLocked = 'vertical';
                        updateOtoButtonState();
                        origPriceOffset = priceOffset;
                        chartDragStartY = e.clientY;
                    }

                    if (alertText) {
                        alertText.innerText = isAutoPriceScale ? 'OTO KİLİTLİ' : 'MANUEL SERBEST';
                    }
                    if (livePillElem) {
                        livePillElem.innerText = isAutoPriceScale ? 'OTO KİLİTLENDİ' : 'MANUEL SERBEST';
                        livePillElem.className = isAutoPriceScale ? 'status-pill locked' : 'status-pill free';
                    }
                }`;

content = content.replace(targetChunk, replacementChunk);
fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully updated dynamic axis unlock in indikator_sablonu.html!');
