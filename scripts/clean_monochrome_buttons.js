import fs from 'fs';

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove dots from button markup in bottom-statusbar
    const oldButtons = `<button class="scale-mode-btn active mode-free" id="mode-btn-free" onclick="setScaleMode('free', event)" title="Serbest (Manuel) Mod">
                        <span class="mode-dot dot-free"></span>
                        <span>SERBEST</span>
                    </button>
                    <button class="scale-mode-btn mode-locked" id="mode-btn-locked" onclick="setScaleMode('locked', event)" title="Kilitli (Otomatik Mum Takip) Mod">
                        <span class="mode-dot dot-locked"></span>
                        <span>KİLİTLİ</span>
                    </button>`;

    const cleanButtons = `<button class="scale-mode-btn active mode-free" id="mode-btn-free" onclick="setScaleMode('free', event)" title="Serbest (Manuel) Mod">SERBEST</button>
                    <button class="scale-mode-btn mode-locked" id="mode-btn-locked" onclick="setScaleMode('locked', event)" title="Kilitli (Otomatik Mum Takip) Mod">KİLİTLİ</button>`;

    if (content.includes(oldButtons)) {
        content = content.replace(oldButtons, cleanButtons);
    }

    // 2. Clean CSS rules for scale-mode-btn: pure neutral text, distinct font and background
    const oldModeCssRegex = /\.scale-mode-btn\.active\.mode-free\s*\{[\s\S]*?\}\s*\.scale-mode-btn\.active\.mode-locked\s*\{[\s\S]*?\}/;
    const cleanModeCss = `.scale-mode-btn {
            background: transparent !important;
            border: 1px solid transparent !important;
            color: #8b949e !important;
            padding: 4px 14px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
        }
        .scale-mode-btn:hover {
            color: #f1f5f9 !important;
            background: #21262d !important;
        }
        .scale-mode-btn.active {
            background: #21262d !important;
            border: 1px solid #484f58 !important;
            color: #ffffff !important;
            font-weight: 800 !important;
        }
        body.light-theme .scale-mode-btn {
            color: #64748b !important;
        }
        body.light-theme .scale-mode-btn:hover {
            background: #e2e8f0 !important;
            color: #0f172a !important;
        }
        body.light-theme .scale-mode-btn.active {
            background: #e2e8f0 !important;
            border: 1px solid #94a3b8 !important;
            color: #0f172a !important;
            font-weight: 800 !important;
        }`;

    if (oldModeCssRegex.test(content)) {
        content = content.replace(oldModeCssRegex, cleanModeCss);
    }

    // Also remove any residual dot styles
    content = content.replace(/\.mode-dot\s*\{[\s\S]*?\}\s*\.dot-free\s*\{[\s\S]*?\}\s*\.dot-locked\s*\{[\s\S]*?\}/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned buttons in ${filePath}`);
}

updateFile('indikator_sablonu.html');
updateFile('index.html');
console.log('ALL BUTTONS CLEANED TO PURE MONOCHROME TEXT & BOLD HIGHLIGHT!');
