import fs from 'fs';

// 1. UPDATE FRONTEND (frontend/index.html & liquid-glass.css)
function updateFrontend() {
    const htmlPath = 'frontend/index.html';
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Clean up footer to keep ONLY 858+ Canlı Parite
    const oldFooter = `        <!-- FOOTER METRİKLER -->
        <footer class="portal-footer">
            <div class="portal-stat-group">
                <div class="portal-stat-item">
                    <span class="portal-stat-num">858+</span>
                    <span class="portal-stat-label">Canlı Parite</span>
                </div>
                <div class="portal-stat-item">
                    <span class="portal-stat-num">0 ms</span>
                    <span class="portal-stat-label">Gecikme</span>
                </div>
                <div class="portal-stat-item">
                    <span class="portal-stat-num">WebGL 2.0</span>
                    <span class="portal-stat-label">GPU Render</span>
                </div>
            </div>

            <div style="font-size: 12px; color: #64748b; font-family: monospace;">
                TRADINGCHART PRO · BETA v2.4
            </div>
        </footer>`;

    const newFooter = `        <!-- FOOTER METRİKLER -->
        <footer class="portal-footer">
            <div class="portal-stat-group">
                <div class="portal-stat-item">
                    <span class="portal-stat-num">858+</span>
                    <span class="portal-stat-label">Canlı Parite</span>
                </div>
            </div>

            <div style="font-size: 12px; color: #64748b; font-family: monospace;">
                TRADINGCHART PRO · BETA v2.4
            </div>
        </footer>`;

    html = html.replace(oldFooter, newFooter);

    // Mobile restriction overlay for frontend
    const mobileOverlay = `
    <!-- MOBİL UYARI EKRANI -->
    <div id="portal-mobile-overlay" class="portal-mobile-overlay">
        <div class="portal-mobile-card">
            <div class="portal-mobile-icon">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
            </div>
            <h2 class="portal-mobile-title">Mobil Desteklenmiyor</h2>
            <p class="portal-mobile-desc">Bu platform şu an için mobil cihazları desteklememektedir. Lütfen en iyi analiz deneyimi için masaüstü veya tablet tarayıcınızdan giriş yapın.</p>
        </div>
    </div>
    `;

    if (!html.includes('portal-mobile-overlay')) {
        html = html.replace('</body>', mobileOverlay + '\n</body>');
    }

    fs.writeFileSync(htmlPath, html, 'utf8');

    // Add mobile overlay styles to liquid-glass.css
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const mobileOverlayCss = `
/* ============================================================ */
/* 📱 SADE MOBİL UYARI EKRANI                                    */
/* ============================================================ */
.portal-mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(6, 9, 19, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 999999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
}

@media (max-width: 768px) {
    .portal-mobile-overlay {
        display: flex !important;
    }
}

.portal-mobile-card {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-top: 1.5px solid rgba(255, 255, 255, 0.45);
    border-radius: 24px;
    padding: 36px 24px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.portal-mobile-icon {
    width: 64px;
    height: 64px;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #38bdf8;
}

.portal-mobile-title {
    font-size: 20px;
    font-weight: 800;
    color: #f8fafc;
}

.portal-mobile-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #94a3b8;
}
    `;

    if (!css.includes('portal-mobile-overlay')) {
        css += '\n' + mobileOverlayCss;
        fs.writeFileSync(cssPath, css, 'utf8');
    }

    console.log('✓ Updated frontend/index.html & liquid-glass.css');
}

// 2. UPDATE MAIN ENGINE (indikator_sablonu.html & index.html)
function updateEngine(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace device warning text with clean minimal wording
    content = content.replace(
        /<div class="device-title">.*?<\/div>\s*<div class="device-desc">[\s\S]*?<\/div>\s*<div class="device-badge-row">[\s\S]*?<\/div>/i,
        `<div class="device-title">Mobil Desteklenmiyor</div>
            <div class="device-desc">
                Bu platform şu an için mobil cihazları desteklememektedir. Lütfen en iyi analiz deneyimi için bilgisayar veya tablet tarayıcınızdan giriş yapın.
            </div>`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated clean mobile warning in ${filePath}`);
}

updateFrontend();
updateEngine('indikator_sablonu.html');
updateEngine('index.html');
console.log('ALL UPDATES COMPLETE!');
