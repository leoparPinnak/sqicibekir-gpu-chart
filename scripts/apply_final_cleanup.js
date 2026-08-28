import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Remove strategy-selector-group and add fx button
content = content.replace(
    /<div class="strategy-selector-group">[\s\S]*?<\/div>/,
    `<div class="fx-indicator-btn-group">
                    <button class="ind-btn active-fx" id="btn-open-indicators" onclick="openIndicatorModal()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-weight: 700; gap: 6px; padding: 4px 12px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;">
                        <svg viewBox="0 0 28 28" width="16" height="16" fill="currentColor"><path d="M11 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2h-9v3.1a6.5 6.5 0 0 1 2.37 1.83l.07.07h6.56a1 1 0 1 1 0 2h-5.26a6.5 6.5 0 0 1-.74 4H21a1 1 0 1 1 0 2h-6.2a6.5 6.5 0 0 1-5.8 4H5a1 1 0 1 1 0-2h3.1a6.5 6.5 0 0 1 2.37-1.83l.07-.07H4a1 1 0 1 1 0-2h5.26a6.5 6.5 0 0 1 .74-4H4a1 1 0 1 1 0-2h6.2a6.5 6.5 0 0 1 5.8-4H11V6Z"></path></svg>
                        <b>Göstergeler (fx)</b>
                    </button>
                </div>`
);

// 2. Remove indicator-nav buttons
content = content.replace(
    /<div class="indicator-nav">[\s\S]*?<\/div>/,
    `<div class="indicator-nav"></div>`
);

// 3. Remove hardcoded HUD items except candle info and OHLC
content = content.replace(
    /<span>1D HTF REJİM:[\s\S]*?<span>MUM BİLGİSİ:/,
    `<span>MUM BİLGİSİ:`
);

// 4. Set default layers to 0
content = content.replace(
    /const layers = \{ cloud: \d, ema: \d, signals: \d, bg: \d \};/,
    `const layers = { cloud: 0, ema: 0, signals: 0, bg: 0 };`
);

// 5. Expand velocity slider and presets
content = content.replace(
    /id="velocity-threshold-slider" min="[\d\.]+" max="[\d\.]+" step="[\d\.]+" value="[\d\.]+"/,
    `id="velocity-threshold-slider" min="0.10" max="15.00" step="0.10" value="1.50"`
);

content = content.replace(
    /<div class="preset-row">[\s\S]*?<\/div>/,
    `<div class="preset-row">
                            <button class="preset-btn" onclick="setThresholdPreset(0.40)">Hassas (0.4)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(1.50)">Dengeli (1.5)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(4.00)">Hızlı (4.0)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(8.00)">Çok Katı (8.0)</button>
                            <button class="preset-btn" onclick="setThresholdPreset(99.00)">Kapalı</button>
                        </div>`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Cleaned chart UI, removed strategy buttons, and upgraded velocity slider range!');
