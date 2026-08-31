import fs from 'fs';

function addShowcaseStyles() {
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const showcaseCss = `
/* ============================================================ */
/* 🌟 ROTATING ASSET SHOWCASE WITH BRAND LOGOS & MORPH ANIMATION */
/* ============================================================ */
.portal-card-row.showcase-row {
    padding: 12px 16px !important;
    min-height: 64px !important;
    cursor: pointer !important;
}

.showcase-content-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.showcase-content-wrap.morph-in {
    animation: showcaseMorphIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes showcaseMorphIn {
    0% {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
        filter: blur(4px);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
    }
}

.showcase-left-cluster {
    display: flex;
    align-items: center;
    gap: 12px;
}

.showcase-logo-box {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(15, 23, 42, 0.60);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-top: 1.5px solid rgba(255, 255, 255, 0.80);
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.50), 0 6px 16px rgba(0, 0, 0, 0.35);
    flex-shrink: 0;
    transition: transform 0.2s ease;
}

.portal-card-row.showcase-row:hover .showcase-logo-box {
    transform: scale(1.08) rotate(5deg);
}

.showcase-meta-cluster {
    display: flex;
    flex-direction: column;
    gap: 3px;
    text-align: left;
}

.showcase-symbol-line {
    display: flex;
    align-items: center;
    gap: 8px;
}

.showcase-ticker {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.2px;
}

.showcase-price-tag {
    font-family: 'SF Pro Text', 'Consolas', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #10b981;
    background: rgba(16, 185, 129, 0.14);
    border: 1px solid rgba(16, 185, 129, 0.35);
    padding: 1px 7px;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
}

.showcase-subline {
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

.showcase-bullet {
    color: #475569;
    font-size: 10px;
}

.showcase-change.up {
    color: #34d399;
    font-weight: 600;
}
    `;

    if (!css.includes('showcase-content-wrap')) {
        css += '\n' + showcaseCss;
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log('✓ Added Showcase CSS to frontend/styles/liquid-glass.css');
    }
}

addShowcaseStyles();
