import fs from 'fs';

function applyUpdates(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update CSS: Add Light Theme rules, Sharp 0px Button Radius, Pulsing Live Green Dot, Mode Highlights
    const customCss = `
        /* ============================================================ */
        /* TRADINGVIEW STİLİ KESKİN VE PROFESYONEL BUTONLAR (RADIUS: 0)  */
        /* ============================================================ */
        button, .tf-btn, .ind-btn, .scale-mode-btn, .fit-all-btn, 
        .axis-corner-reset, .symbol-btn-wrapper, .tv-tool-btn, 
        .pine-btn, .fx-tab-btn, .symbol-tab-btn, .fx-btn-add, 
        .status-badge, .theme-toggle-btn, .candle-depth-select {
            border-radius: 0px !important;
        }

        /* CANLI ROZETİ (AÇIK PARLAK YEŞİL YANIP SÖNEN GLOW) */
        .status-badge.live {
            background: rgba(34, 197, 94, 0.12) !important;
            border: 1px solid rgba(34, 197, 94, 0.4) !important;
            color: #22c55e !important;
            font-weight: 800 !important;
            letter-spacing: 0.5px !important;
        }
        .status-badge.live .live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50% !important;
            background: #22c55e;
            box-shadow: 0 0 10px #22c55e, 0 0 4px #22c55e;
            animation: liveGlowPulse 1.6s infinite ease-in-out;
        }
        @keyframes liveGlowPulse {
            0%, 100% { transform: scale(1.0); opacity: 1; box-shadow: 0 0 10px #22c55e, 0 0 4px #22c55e; }
            50% { transform: scale(1.35); opacity: 0.75; box-shadow: 0 0 18px #22c55e, 0 0 8px #4ade80; }
        }

        /* SERBEST / KİLİTLİ SEÇİCİ VE NET DURUM VURGULARI */
        .scale-mode-segmented-group {
            display: inline-flex;
            align-items: center;
            background: #111622;
            border: 1px solid #30363d;
            border-radius: 0px !important;
            padding: 2px;
            gap: 2px;
        }
        .scale-mode-btn {
            background: transparent;
            border: 1px solid transparent;
            color: #8b949e;
            padding: 3px 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
        }
        .scale-mode-btn:hover {
            color: #f1f5f9;
            background: #1c212c;
        }
        .scale-mode-btn.active.mode-free {
            background: rgba(234, 179, 8, 0.18) !important;
            border: 1px solid #eab308 !important;
            color: #fef08a !important;
            box-shadow: 0 0 8px rgba(234, 179, 8, 0.25);
        }
        .scale-mode-btn.active.mode-locked {
            background: rgba(34, 197, 94, 0.18) !important;
            border: 1px solid #22c55e !important;
            color: #86efac !important;
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.25);
        }
        .mode-dot {
            width: 6px;
            height: 6px;
            border-radius: 50% !important;
        }
        .dot-free { background: #eab308; box-shadow: 0 0 6px #eab308; }
        .dot-locked { background: #22c55e; box-shadow: 0 0 6px #22c55e; }

        /* TEMA SEÇİCİ BUTONU */
        .theme-toggle-btn {
            background: #161b22;
            border: 1px solid #30363d;
            color: #cbd5e1;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
        }
        .theme-toggle-btn:hover {
            background: #21262d;
            color: #ffffff;
            border-color: #484f58;
        }

        /* ARKA PLAN BETA BİLGİLENDİRME WATERMARK'I */
        .chart-beta-watermark {
            position: absolute;
            bottom: 35px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1;
            pointer-events: none;
            user-select: none;
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.04);
            white-space: nowrap;
            transition: color 0.3s ease;
        }

        /* ============================================================ */
        /* TRADINGVIEW RESMİ BEYAZ / AÇIK TEMA (LIGHT THEME) STİLLERİ    */
        /* ============================================================ */
        body.light-theme, html.light-theme {
            background-color: #ffffff !important;
            color: #131722 !important;
        }
        body.light-theme #app-root {
            background-color: #ffffff !important;
        }
        body.light-theme .top-toolbar {
            background: #ffffff !important;
            border-bottom: 1px solid #e0e3eb !important;
        }
        body.light-theme .indicator-badge {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .symbol-btn-wrapper {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .symbol-ticker {
            color: #131722 !important;
        }
        body.light-theme .symbol-exchange-tag {
            color: #787b86 !important;
        }
        body.light-theme .tf-btn {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #787b86 !important;
        }
        body.light-theme .tf-btn:hover {
            background: #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .tf-btn.active {
            background: #2962ff !important;
            border-color: #2962ff !important;
            color: #ffffff !important;
        }
        body.light-theme .ind-btn {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .ind-btn:hover {
            background: #e0e3eb !important;
        }
        body.light-theme .candle-depth-select {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .live-price-box {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .live-price-box #price-val {
            color: #089981 !important;
        }
        body.light-theme .api-source-badge {
            background: #e0e3eb !important;
            color: #787b86 !important;
        }
        body.light-theme .tv-left-toolbar {
            background: #ffffff !important;
            border-right: 1px solid #e0e3eb !important;
        }
        body.light-theme .tv-tool-btn {
            color: #787b86 !important;
        }
        body.light-theme .tv-tool-btn:hover, body.light-theme .tv-tool-btn.active {
            background: #f0f3fa !important;
            color: #2962ff !important;
        }
        body.light-theme .bottom-statusbar {
            background: #ffffff !important;
            border-top: 1px solid #e0e3eb !important;
            color: #787b86 !important;
        }
        body.light-theme .scale-mode-segmented-group {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
        }
        body.light-theme .scale-mode-btn {
            color: #787b86 !important;
        }
        body.light-theme .scale-mode-btn:hover {
            background: #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .scale-mode-btn.active.mode-free {
            background: rgba(234, 179, 8, 0.22) !important;
            border: 1px solid #ca8a04 !important;
            color: #854d0e !important;
        }
        body.light-theme .scale-mode-btn.active.mode-locked {
            background: rgba(34, 197, 94, 0.22) !important;
            border: 1px solid #16a34a !important;
            color: #14532d !important;
        }
        body.light-theme .fit-all-btn {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .fit-all-btn:hover {
            background: #e0e3eb !important;
        }
        body.light-theme .price-axis-sidebar, body.light-theme .time-axis-bar {
            background: #ffffff !important;
            border-color: #e0e3eb !important;
        }
        body.light-theme .axis-corner-reset {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #787b86 !important;
        }
        body.light-theme .axis-corner-reset:hover {
            background: #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .subpanes-wrapper {
            background: #ffffff !important;
            border-top: 1px solid #e0e3eb !important;
        }
        body.light-theme .subpane-container {
            background: #ffffff !important;
            border-bottom: 1px solid #e0e3eb !important;
        }
        body.light-theme .subpane-header {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .subpane-title {
            color: #131722 !important;
        }
        body.light-theme .subpane-val {
            color: #131722 !important;
        }
        body.light-theme .symbol-modal-card, body.light-theme .fx-modal-card, body.light-theme .pine-editor-card {
            background: #ffffff !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }
        body.light-theme .symbol-tab-btn, body.light-theme .fx-tab-btn, body.light-theme .pine-btn {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #787b86 !important;
        }
        body.light-theme .symbol-tab-btn.active, body.light-theme .fx-tab-btn.active {
            background: #2962ff !important;
            border-color: #2962ff !important;
            color: #ffffff !important;
        }
        body.light-theme .symbol-search-input, body.light-theme .fx-search-input {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .symbol-item:hover, body.light-theme .fx-item:hover, body.light-theme .fx-indicator-item:hover {
            background: #f0f3fa !important;
        }
        body.light-theme .fx-indicator-item {
            background: #ffffff !important;
            border: 1px solid #e0e3eb !important;
        }
        body.light-theme .fx-indicator-name {
            color: #131722 !important;
        }
        body.light-theme .fx-indicator-desc {
            color: #787b86 !important;
        }
        body.light-theme .theme-toggle-btn {
            background: #f0f3fa !important;
            border: 1px solid #e0e3eb !important;
            color: #131722 !important;
        }
        body.light-theme .chart-beta-watermark {
            color: rgba(0, 0, 0, 0.05) !important;
        }
    `;

    // Inject CSS before </style>
    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + customCss + content.substring(styleEndIdx);
    }

    // 2. Add Theme Toggle Button to Top Toolbar and Watermark to Canvas Container
    // Search top toolbar
    const toolbarTarget = '<div class="indicator-nav"></div>';
    const cleanToolbarAddon = `
                <!-- TEMA DEĞİŞTİRME BUTONU (BEYAZ / SİYAH TEMA) -->
                <button class="theme-toggle-btn" id="btn-theme-toggle" onclick="toggleTheme()" title="Açık (Beyaz) / Koyu Tema">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    <span id="theme-btn-label">BEYAZ TEMA</span>
                </button>
            </div>

            <div class="indicator-nav"></div>`;

    content = content.replace(toolbarTarget, cleanToolbarAddon);

    // Add Beta Watermark inside canvas-container
    const canvasContainerTarget = '<div class="canvas-container" id="canvas-container">';
    const cleanCanvasWatermark = `<div class="canvas-container" id="canvas-container">
                    <div class="chart-beta-watermark" id="chart-beta-watermark">TRADINGCHART · BETA (GELİŞTİRME SÜRECİ DEVAM ETMEKTEDİR)</div>`;

    content = content.replace(canvasContainerTarget, cleanCanvasWatermark);

    // 3. Update bottom status bar with pulsing green dot & clear mode dots
    const oldBottomBarStart = '<div class="bottom-statusbar">';
    const oldBottomBarEnd = '<!-- ==================== VERTEX SHADER ==================== -->';
    const bStart = content.indexOf(oldBottomBarStart);
    const bEnd = content.indexOf(oldBottomBarEnd, bStart);

    if (bStart !== -1 && bEnd !== -1) {
        const cleanBottomBar = `<div class="bottom-statusbar">
            <div class="status-left">
                <span class="status-badge live" title="Canlı Veri Akışı Aktif">
                    <span class="live-dot"></span>
                    <span>CANLI</span>
                </span>

                <div class="scale-mode-segmented-group" id="scale-mode-group" title="Fiyat Ölçekleme Modu">
                    <button class="scale-mode-btn active mode-free" id="mode-btn-free" onclick="setScaleMode('free', event)" title="Serbest (Manuel) Mod">
                        <span class="mode-dot dot-free"></span>
                        <span>SERBEST</span>
                    </button>
                    <button class="scale-mode-btn mode-locked" id="mode-btn-locked" onclick="setScaleMode('locked', event)" title="Kilitli (Otomatik Mum Takip) Mod">
                        <span class="mode-dot dot-locked"></span>
                        <span>KİLİTLİ</span>
                    </button>
                </div>

                <button class="fit-all-btn" onclick="triggerSpaceAutoFit()" title="Görünür mumları dikeyde yumuşakça sığdır [Space]">SPACE: SIGDIR</button>
            </div>

            <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: #8b949e; font-family: monospace;">
                <span>% log</span>
                <span>UTC+3 (Istanbul)</span>
            </div>
        </div>

    </div>

    `;
        content = content.substring(0, bStart) + cleanBottomBar + content.substring(bEnd);
    }

    // 4. Add Theme Switcher JavaScript Runtime Logic
    const themeJsLogic = `
        // ============================================================
        // 🌓 TRADINGVIEW AÇIK / KOYU TEMA YÖNETİMİ
        // ============================================================
        let currentTheme = localStorage.getItem('tradechart_theme') || 'dark';
        window.currentTheme = currentTheme;

        function applyTheme(theme) {
            currentTheme = theme;
            window.currentTheme = currentTheme;
            localStorage.setItem('tradechart_theme', currentTheme);

            const btnLabel = document.getElementById('theme-btn-label');
            if (currentTheme === 'light') {
                document.body.classList.add('light-theme');
                document.documentElement.classList.add('light-theme');
                if (btnLabel) btnLabel.innerText = 'KOYU TEMA';
            } else {
                document.body.classList.remove('light-theme');
                document.documentElement.classList.remove('light-theme');
                if (btnLabel) btnLabel.innerText = 'BEYAZ TEMA';
            }
        }

        window.toggleTheme = function() {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        };

        // Initialize Theme on startup
        applyTheme(currentTheme);
    `;

    // Inject themeJsLogic into script
    const scriptTag = '<script>';
    const sIdx = content.indexOf(scriptTag);
    if (sIdx !== -1) {
        content = content.substring(0, sIdx + scriptTag.length) + '\n' + themeJsLogic + '\n' + content.substring(sIdx + scriptTag.length);
    }

    // 5. Update updateScaleModeUI function for clear visual indicator
    const updateScaleModeUIRegex = /function\s+updateScaleModeUI\(\)\s*\{[\s\S]*?\}/;
    const cleanUpdateScaleModeUI = `function updateScaleModeUI() {
            const btnFree = document.getElementById('mode-btn-free');
            const btnLocked = document.getElementById('mode-btn-locked');
            if (btnFree) {
                btnFree.className = 'scale-mode-btn mode-free' + (scaleMode === 'free' ? ' active' : '');
            }
            if (btnLocked) {
                btnLocked.className = 'scale-mode-btn mode-locked' + (scaleMode === 'locked' ? ' active' : '');
            }
            const cornerReset = document.querySelector('.axis-corner-reset');
            if (cornerReset) {
                cornerReset.classList.toggle('active', scaleMode === 'locked');
            }
        }`;
    if (updateScaleModeUIRegex.test(content)) {
        content = content.replace(updateScaleModeUIRegex, cleanUpdateScaleModeUI);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Applied TradingView style, sharp buttons, green live glow, beta watermark and light theme to ${filePath}`);
}

applyUpdates('indikator_sablonu.html');
applyUpdates('index.html');
console.log('ALL UPDATES COMPLETE!');
