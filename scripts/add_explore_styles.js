import fs from 'fs';

function addExploreStyles() {
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const exploreCss = `
/* ============================================================ */
/* 📊 UNISWAP V4 STYLE MARKET EXPLORE TABLE & CONTROLS         */
/* ============================================================ */
#landing-portal {
    overflow-y: auto !important;
    max-height: 100vh !important;
    scroll-behavior: smooth !important;
}

#landing-portal::-webkit-scrollbar {
    width: 6px;
}

#landing-portal::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
}

.explore-section-container {
    width: 100%;
    max-width: 1180px;
    margin: 60px auto 80px auto;
    padding: 0 24px;
}

.explore-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
    flex-wrap: wrap;
}

.explore-section-title {
    font-size: 32px;
    font-weight: 500;
    letter-spacing: -0.03em;
    color: #ffffff;
    font-family: 'Inter', -apple-system, sans-serif;
}

.explore-section-subtitle {
    font-size: 14px;
    color: #94a3b8;
    margin-top: 6px;
    font-family: 'Inter', -apple-system, sans-serif;
}

.explore-search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(18, 24, 38, 0.60);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-top: 1.5px solid rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(16px) saturate(180%);
    padding: 8px 16px;
    border-radius: 9999px;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.30);
    min-width: 320px;
}

.explore-search-box input {
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    width: 100%;
}

.explore-search-box input::placeholder {
    color: #64748b;
}

.explore-tabs-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 4px;
}

.explore-tab-btn {
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(18, 24, 38, 0.40);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top: 1px solid rgba(255, 255, 255, 0.30);
    border-radius: 9999px;
    cursor: pointer;
    backdrop-filter: blur(12px);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
}

.explore-tab-btn:hover {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%), rgba(255, 255, 255, 0.06);
    border-top-color: rgba(255, 255, 255, 0.60);
    transform: translateY(-1px);
}

.explore-tab-btn.active {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(41, 98, 255, 0.45) !important;
    border-color: rgba(255, 255, 255, 0.25);
    border-top: 1.5px solid rgba(255, 255, 255, 0.80);
    font-weight: 700;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.40), 0 4px 16px rgba(41, 98, 255, 0.30);
}

/* EXPLORE TABLO KARTI */
.explore-table-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 60%, rgba(255, 255, 255, 0.03) 100%), rgba(8, 14, 28, 0.45);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-top: 1.5px solid rgba(255, 255, 255, 0.50);
    border-radius: 24px;
    box-shadow: 
        inset 0 1.5px 2px rgba(255, 255, 255, 0.35),
        0 25px 60px rgba(0, 0, 0, 0.60);
    overflow: hidden;
}

.explore-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}

.explore-table th {
    padding: 16px 20px;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.explore-table td {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    vertical-align: middle;
}

.explore-table-row {
    cursor: pointer;
    transition: all 0.15s ease;
}

.explore-table-row:hover {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.explore-table-row:last-child td {
    border-bottom: none;
}

.explore-asset-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.explore-asset-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.20);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.30);
    flex-shrink: 0;
}

.explore-asset-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.explore-asset-symbol {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.2px;
}

.explore-asset-name {
    font-size: 12px;
    color: #94a3b8;
}

.explore-exchange-tag {
    color: #64748b;
    font-size: 11px;
}

.explore-change-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12.5px;
    font-weight: 700;
    font-family: monospace;
}

.explore-change-badge.positive {
    background: rgba(16, 185, 129, 0.14);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #34d399;
}

.explore-change-badge.negative {
    background: rgba(239, 68, 68, 0.14);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #f87171;
}

.explore-action-btn {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-top: 1.5px solid rgba(255, 255, 255, 0.70);
    backdrop-filter: blur(12px);
    color: #ffffff;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.40);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.explore-action-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(41, 98, 255, 0.30);
    border-top-color: #ffffff;
    transform: translateY(-1px);
    box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.60), 0 4px 14px rgba(41, 98, 255, 0.35);
}

.explore-empty-state {
    padding: 48px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #64748b;
    font-size: 14px;
}
    `;

    if (!css.includes('explore-section-container')) {
        css += '\n' + exploreCss;
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log('✓ Added Explore Section CSS to frontend/styles/liquid-glass.css');
    }
}

addExploreStyles();
