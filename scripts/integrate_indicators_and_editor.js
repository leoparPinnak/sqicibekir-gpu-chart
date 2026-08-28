import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Add CSS for Indicator Modal, Subpanes, and Script Editor
const indicatorStyles = `
        /* ============================================================ */
        /* ⚡ GÖSTERGELER (FX) VE SUB-PANE SİSTEMİ STİLLERİ            */
        /* ============================================================ */
        .subpanes-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 2px;
            background: #131722;
            border-top: 1px solid #2a2e39;
        }
        .subpane-container {
            position: relative;
            width: 100%;
            height: 120px;
            background: #131722;
            border-bottom: 1px solid #1e222d;
            box-sizing: border-box;
        }
        .subpane-header {
            position: absolute;
            top: 4px;
            left: 10px;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'SF Pro Text', -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            background: rgba(19, 23, 34, 0.75);
            backdrop-filter: blur(4px);
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid rgba(42, 46, 57, 0.6);
            user-select: none;
        }
        .subpane-title {
            color: #f1f5f9;
        }
        .subpane-val {
            font-family: 'SF Mono', Monaco, monospace;
            font-weight: 800;
        }
        .subpane-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: 6px;
        }
        .subpane-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            font-size: 11px;
            padding: 1px 3px;
            border-radius: 3px;
            transition: all 0.15s ease;
        }
        .subpane-btn:hover {
            color: #38bdf8;
            background: rgba(56, 189, 248, 0.15);
        }
        .subpane-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        /* 🌟 FX GÖSTERGELER MODAL PENCERESİ */
        .fx-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .fx-modal-backdrop.active {
            display: flex;
        }
        .fx-modal-card {
            width: 680px;
            max-width: 95vw;
            max-height: 85vh;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: modalFadeIn 0.2s ease-out;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1.0); }
        }
        .fx-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-bottom: 1px solid #2a2e39;
            background: #181b24;
        }
        .fx-modal-title {
            font-size: 14px;
            font-weight: 800;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .fx-modal-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .fx-modal-close:hover {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.1);
        }
        .fx-search-bar {
            padding: 10px 18px;
            border-bottom: 1px solid #2a2e39;
            background: #131722;
        }
        .fx-search-input {
            width: 100%;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 8px 12px;
            color: #ffffff;
            font-size: 13px;
            outline: none;
        }
        .fx-search-input:focus {
            border-color: #38bdf8;
        }
        .fx-modal-tabs {
            display: flex;
            border-bottom: 1px solid #2a2e39;
            background: #131722;
            padding: 0 18px;
        }
        .fx-tab-btn {
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: #94a3b8;
            font-size: 12px;
            font-weight: 700;
            padding: 10px 14px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .fx-tab-btn.active {
            color: #38bdf8;
            border-bottom-color: #38bdf8;
        }
        .fx-modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 12px 18px;
        }
        .fx-indicator-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 4px;
            background: rgba(30, 34, 45, 0.5);
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }
        .fx-indicator-row:hover {
            background: #242936;
            border-color: #2a2e39;
        }
        .fx-ind-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .fx-ind-name {
            font-size: 13px;
            font-weight: 700;
            color: #f1f5f9;
        }
        .fx-ind-desc {
            font-size: 11px;
            color: #64748b;
        }
        .fx-btn-add {
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid #38bdf8;
            color: #38bdf8;
            font-size: 11.5px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .fx-btn-add:hover {
            background: #38bdf8;
            color: #0f172a;
        }

        /* ⚙️ GÖSTERGE AYARLAR MODALI */
        .fx-settings-modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10005;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .fx-settings-modal.active {
            display: flex;
        }
        .fx-settings-card {
            width: 420px;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
            overflow: hidden;
        }
        .fx-settings-body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .fx-setting-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .fx-setting-item label {
            font-size: 12px;
            font-weight: 700;
            color: #94a3b8;
        }
        .fx-setting-item input[type="number"], .fx-setting-item select {
            background: #131722;
            border: 1px solid #2a2e39;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            width: 90px;
        }
        .fx-setting-item input[type="color"] {
            background: transparent;
            border: none;
            width: 32px;
            height: 26px;
            cursor: pointer;
        }
        .fx-settings-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 12px 16px;
            background: #181b24;
            border-top: 1px solid #2a2e39;
        }

        /* 💻 DAHİLİ PINE / SCRIPT EDİTÖRÜ PANELİ */
        .pine-editor-panel {
            position: fixed;
            bottom: 30px;
            left: 50px;
            right: 50px;
            height: 320px;
            background: #141721;
            border: 1px solid #2a2e39;
            border-top: 2px solid #38bdf8;
            border-radius: 8px 8px 0 0;
            z-index: 9990;
            display: none;
            flex-direction: column;
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.7);
        }
        .pine-editor-panel.active {
            display: flex;
        }
        .pine-editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 14px;
            background: #1c202c;
            border-bottom: 1px solid #2a2e39;
        }
        .pine-editor-title {
            font-size: 12.5px;
            font-weight: 800;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .pine-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .pine-btn {
            background: #242936;
            border: 1px solid #2a2e39;
            color: #f1f5f9;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s ease;
        }
        .pine-btn:hover {
            border-color: #38bdf8;
            color: #38bdf8;
        }
        .pine-btn.primary {
            background: #38bdf8;
            color: #0f172a;
            border-color: #38bdf8;
        }
        .pine-btn.primary:hover {
            background: #7dd3fc;
        }
        .pine-code-container {
            flex: 1;
            position: relative;
            display: flex;
            background: #0d1017;
            overflow: hidden;
        }
        .pine-textarea {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            outline: none;
            color: #38bdf8;
            font-family: 'SF Mono', Monaco, 'Consolas', monospace;
            font-size: 12.5px;
            line-height: 1.6;
            padding: 10px 14px;
            resize: none;
            white-space: pre;
            tab-size: 4;
        }
        .pine-console {
            height: 32px;
            background: #10141f;
            border-top: 1px solid #2a2e39;
            padding: 4px 12px;
            display: flex;
            align-items: center;
            font-family: monospace;
            font-size: 11px;
            color: #10b981;
        }
        .pine-console.error {
            color: #ef4444;
        }
`;

content = content.replace('</style>', indicatorStyles + '\n    </style>');

// 2. Add Subpanes Wrapper to DOM below canvas-container
const oldCanvasContainerWrap = `<div class="canvas-container" id="canvas-container">`;
const subpanesWrapperHtml = `                    <div class="subpanes-wrapper" id="subpanes-wrapper"></div>`;

content = content.replace(
    '                    <!-- ALT TARİH / ZAMAN BARI -->\n                    <div class="time-axis-bar" id="time-axis"',
    subpanesWrapperHtml + '\n                    <!-- ALT TARİH / ZAMAN BARI -->\n                    <div class="time-axis-bar" id="time-axis"'
);

// 3. Add Script Editor Button in Top Navbar
const scriptEditorBtn = `
                <!-- 💻 PİNE / SCRIPT EDİTÖRÜ BUTONU -->
                <button class="ind-btn" id="btn-open-script-editor" onclick="toggleScriptEditor()" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #f59e0b; font-weight: 700; gap: 6px; padding: 4px 10px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;" title="Dahili Pine & JavaScript Script Editörünü Aç">
                    <svg viewBox="0 0 28 28" width="15" height="15" fill="currentColor"><path d="M9.5 7.5L3 14l6.5 6.5 1.4-1.4L5.8 14l5.1-5.1zM18.5 7.5l-1.4 1.4 5.1 5.1-5.1 5.1 1.4 1.4 6.5-6.5zM15.5 4l-5 20h2l5-20z"></path></svg>
                    <span>Script Editörü</span>
                </button>
`;

content = content.replace(
    '                <select class="candle-depth-select" id="candle-depth-select"',
    scriptEditorBtn + '\n                <select class="candle-depth-select" id="candle-depth-select"'
);

// 4. Add Indicator Modal HTML & Script Editor HTML at the end of body
const modalsHtml = `
    <!-- ============================================================ -->
    /* 🌟 GÖSTERGELER (FX) MODAL PENCERESİ                         */
    <!-- ============================================================ -->
    <div class="fx-modal-backdrop" id="fx-modal-backdrop" onclick="closeIndicatorModal(event)">
        <div class="fx-modal-card" onclick="event.stopPropagation()">
            <div class="fx-modal-header">
                <div class="fx-modal-title">
                    <svg viewBox="0 0 28 28" width="18" height="18" fill="#38bdf8"><path d="M11 6a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2h-9v3.1a6.5 6.5 0 0 1 2.37 1.83l.07.07h6.56a1 1 0 1 1 0 2h-5.26a6.5 6.5 0 0 1-.74 4H21a1 1 0 1 1 0 2h-6.2a6.5 6.5 0 0 1-5.8 4H5a1 1 0 1 1 0-2h3.1a6.5 6.5 0 0 1 2.37-1.83l.07-.07H4a1 1 0 1 1 0-2h5.26a6.5 6.5 0 0 1 .74-4H4a1 1 0 1 1 0-2h6.2a6.5 6.5 0 0 1 5.8-4H11V6Z"></path></svg>
                    <span>Göstergeler ve Stratejiler (fx)</span>
                </div>
                <button class="fx-modal-close" onclick="closeIndicatorModal()">✕</button>
            </div>
            <div class="fx-search-bar">
                <input type="text" class="fx-search-input" id="fx-search-input" placeholder="🔍 Göstergeleri ara (RSI, MACD, Bollinger, EMA...)" oninput="filterIndicators(this.value)">
            </div>
            <div class="fx-modal-tabs">
                <button class="fx-tab-btn active" id="fx-tab-tech" onclick="switchFxTab('tech')">Teknik Göstergeler (Dahili)</button>
                <button class="fx-tab-btn" id="fx-tab-active" onclick="switchFxTab('active')">Aktif Göstergeler (<span id="active-ind-count">0</span>)</button>
            </div>
            <div class="fx-modal-body" id="fx-modal-body">
                <!-- Dinamik Liste JS ile Doldurulacak -->
            </div>
        </div>
    </div>

    <!-- ⚙️ GÖSTERGE AYARLARI MODALI -->
    <div class="fx-settings-modal" id="fx-settings-modal" onclick="closeIndicatorSettings(event)">
        <div class="fx-settings-card" onclick="event.stopPropagation()">
            <div class="fx-modal-header">
                <div class="fx-modal-title" id="fx-settings-title">⚙️ Gösterge Ayarları</div>
                <button class="fx-modal-close" onclick="closeIndicatorSettings()">✕</button>
            </div>
            <div class="fx-settings-body" id="fx-settings-body"></div>
            <div class="fx-settings-footer">
                <button class="pine-btn" onclick="closeIndicatorSettings()">İptal</button>
                <button class="pine-btn primary" onclick="saveIndicatorSettings()">Kaydet ve Uygula</button>
            </div>
        </div>
    </div>

    <!-- 💻 PINE / SCRIPT EDİTÖRÜ PANELİ -->
    <div class="pine-editor-panel" id="pine-editor-panel">
        <div class="pine-editor-header">
            <div class="pine-editor-title">
                <svg viewBox="0 0 28 28" width="16" height="16" fill="#f59e0b"><path d="M9.5 7.5L3 14l6.5 6.5 1.4-1.4L5.8 14l5.1-5.1zM18.5 7.5l-1.4 1.4 5.1 5.1-5.1 5.1 1.4 1.4 6.5-6.5zM15.5 4l-5 20h2l5-20z"></path></svg>
                <span>TradeChart Pine & JavaScript Script Editörü</span>
            </div>
            <div class="pine-toolbar">
                <select id="pine-template-select" class="pine-btn" onchange="loadScriptTemplate(this.value)">
                    <option value="">📋 Hazır Şablon Seç...</option>
                    <option value="0">⚡ EMA 9 / 21 Kesişimi</option>
                    <option value="1">📊 Özel RSI (14) Osilatörü</option>
                    <option value="2">🎯 Bollinger Bantları (20, 2.0)</option>
                    <option value="3">📈 Hacim Momentum Histogramı</option>
                </select>
                <button class="pine-btn primary" onclick="runPineScript()">▶ Grafiğe Ekle</button>
                <button class="pine-btn" onclick="clearPineScript()">🗑️ Temizle</button>
                <button class="pine-btn" onclick="toggleScriptEditor()">✕ Kapat</button>
            </div>
        </div>
        <div class="pine-code-container">
            <textarea class="pine-textarea" id="pine-code-editor" spellcheck="false">// ⚡ EMA 9 ve EMA 21 Kesişimi
const ema9 = ema(close, 9);
const ema21 = ema(close, 21);

plot(ema9, "EMA 9", "#38bdf8", 2, true);
plot(ema21, "EMA 21", "#f59e0b", 2, true);
</textarea>
        </div>
        <div class="pine-console" id="pine-console">
            <span>✓ Hazır. Scriptinizi yazıp "▶ Grafiğe Ekle" butonuna tıklayın.</span>
        </div>
    </div>
`;

content = content.replace('</body>', modalsHtml + '\n</body>');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully integrated Indicator modal, Subpane layout, and Script Editor into DOM!');
