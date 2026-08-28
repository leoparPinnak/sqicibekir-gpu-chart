import fs from 'fs';
import path from 'path';

const dir = 'tradingview_drawing_doms';

const flyoutConfigs = [
    {
        menuId: 'flyout-cursors',
        title: 'İmleçler',
        buttonId: 'tv-tool-cursor',
        mainIconSvg: '<svg viewBox="0 0 28 28"><g fill="currentColor"><path d="M18 15h8v-1h-8z"></path><path d="M14 18v8h1v-8zM14 3v8h1v-8zM3 15h8v-1h-8z"></path></g></svg>',
        defaultTool: 'cursor',
        items: [
            { label: 'Artı (Cross)', tool: 'cursor', hotkey: '', svg: '<svg viewBox="0 0 28 28"><g fill="currentColor"><path d="M18 15h8v-1h-8z"></path><path d="M14 18v8h1v-8zM14 3v8h1v-8zM3 15h8v-1h-8z"></path></g></svg>' },
            { label: 'Nokta (Dot)', tool: 'cursor_dot', hotkey: '', svg: '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="3.5" fill="currentColor"></circle></svg>' },
            { label: 'Ok (Arrow)', tool: 'cursor_arrow', hotkey: '', svg: '<svg viewBox="0 0 28 28"><path d="M8 6l12 8-5 1 4 7-2 1-4-7-5 4z" fill="currentColor"></path></svg>' },
            { label: 'Silgi (Eraser)', tool: 'cursor_eraser', hotkey: '', svg: '<svg viewBox="0 0 28 28"><path d="M7 17l7 7 10-10-7-7L7 17zm3-2l7-7 5 5-7 7-5-5z" fill="currentColor"></path></svg>' }
        ]
    },
    {
        menuId: 'flyout-lines',
        file: '02_flyout_trend_lines.html',
        buttonId: 'tv-tool-trendline',
        defaultTool: 'trendline',
        categories: [
            { title: 'Çizgiler', tools: ['LineToolTrendLine', 'LineToolRay', 'LineToolInfoLine', 'LineToolExtended', 'LineToolTrendAngle', 'LineToolHorzLine', 'LineToolHorzRay', 'LineToolVertLine', 'LineToolCrossLine'] },
            { title: 'Kanallar', tools: ['LineToolParallelChannel', 'LineToolRegressionTrend', 'LineToolFlatBottom', 'LineToolDisjointAngle'] },
            { title: 'Dirgenler', tools: ['LineToolPitchfork', 'LineToolSchiffPitchfork2', 'LineToolSchiffPitchfork', 'LineToolInsidePitchfork'] }
        ]
    },
    {
        menuId: 'flyout-fib',
        file: '03_flyout_gann_fibonacci.html',
        buttonId: 'tv-tool-fibonacci',
        defaultTool: 'fibonacci',
        categories: [
            { title: 'Fibonacci', tools: ['LineToolFibRetracement', 'LineToolTrendBasedFibExtension', 'LineToolFibChannel', 'LineToolFibTimeZone', 'LineToolFibSpeedResistanceFan', 'LineToolTrendBasedFibTime', 'LineToolFibCircles', 'LineToolFibSpiral', 'LineToolFibSpeedResistanceArcs', 'LineToolFibWedge'] },
            { title: 'Gann', tools: ['LineToolGannBox', 'LineToolGannSquareFixed', 'LineToolGannSquare', 'LineToolGannFan'] }
        ]
    },
    {
        menuId: 'flyout-shapes',
        file: '04_flyout_geometric_shapes.html',
        buttonId: 'tv-tool-rectangle',
        defaultTool: 'rectangle',
        categories: [
            { title: 'Fırçalar ve Oklar', tools: ['LineToolBrush', 'LineToolHighlighter', 'LineToolArrowMarker', 'LineToolArrow', 'LineToolArrowUp', 'LineToolArrowDown'] },
            { title: 'Şekiller', tools: ['LineToolRectangle', 'LineToolRotatedRectangle', 'LineToolPath', 'LineToolCircle', 'LineToolEllipse', 'LineToolPolyline', 'LineToolTriangle', 'LineToolArc', 'LineToolBezierQuadro', 'LineToolBezierCubic'] }
        ]
    },
    {
        menuId: 'flyout-text',
        file: '05_flyout_annotation.html',
        buttonId: 'tv-tool-text',
        defaultTool: 'text',
        categories: [
            { title: 'Metin ve Notlar', tools: ['LineToolText', 'LineToolTextNote', 'LineToolPriceNote', 'LineToolNote', 'LineToolTable', 'LineToolCallout', 'LineToolComment', 'LineToolPriceLabel', 'LineToolSignpost', 'LineToolFlagMark'] },
            { title: 'İçerik', tools: ['LineToolImage', 'LineToolTweet', 'LineToolIdea'] }
        ]
    },
    {
        menuId: 'flyout-patterns',
        file: '06_flyout_patterns.html',
        buttonId: 'tv-tool-patterns',
        defaultTool: 'pattern_xabcd',
        categories: [
            { title: 'Grafik Desenleri', tools: ['LineTool5PointsPattern', 'LineToolCypherPattern', 'LineToolHeadAndShoulders', 'LineToolABCD', 'LineToolTrianglePattern', 'LineToolThreeDrivers'] },
            { title: 'Elliott Dalgaları', tools: ['LineToolElliottImpulse', 'LineToolElliottCorrection', 'LineToolElliottTriangle', 'LineToolElliottDoubleCombo', 'LineToolElliottTripleCombo'] },
            { title: 'Döngüler', tools: ['LineToolCircleLines', 'LineToolTimeCycles', 'LineToolSineLine'] }
        ]
    },
    {
        menuId: 'flyout-measure',
        file: '07_flyout_prediction_measurement.html',
        buttonId: 'tv-tool-long_pos',
        defaultTool: 'long_pos',
        categories: [
            { title: 'Tahmin & Pozisyon', tools: ['LineToolRiskRewardLong', 'LineToolRiskRewardShort', 'LineToolPrediction', 'LineToolBarsPattern', 'LineToolGhostFeed', 'LineToolProjection'] },
            { title: 'Hacim Tabanlı', tools: ['LineToolAnchoredVWAP', 'LineToolFixedRangeVolumeProfile', 'LineToolAnchoredVolumeProfile'] },
            { title: 'Ölçümler', tools: ['LineToolPriceRange', 'LineToolDateRange', 'LineToolDateAndPriceRange'] }
        ]
    }
];

function extractToolMap(filename) {
    const html = fs.readFileSync(path.join(dir, filename), 'utf8');
    const regex = /<div role="row"[^>]*aria-label="([^"]+)"[^>]*data-name="([^"]+)"([\s\S]*?)(?=<div role="row"|<tr|$)/gi;
    let m;
    const map = {};
    while ((m = regex.exec(html)) !== null) {
        const label = m[1];
        const dataName = m[2];
        const content = m[3];
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
        const svg = svgMatch ? svgMatch[0] : '';
        const hotkeyMatch = content.match(/<div class="accessibleShortcut-[^"]*">([^<]+)<\/div>|<span class="accessibleShortcut-[^"]*">([^<]+)<\/span>/i);
        const hotkey = hotkeyMatch ? (hotkeyMatch[1] || hotkeyMatch[2]) : '';
        map[dataName] = { label, dataName, svg, hotkey };
    }
    return map;
}

// Convert dataName to simple internal tool ID
function toInternalToolId(dataName) {
    const mapping = {
        'LineToolTrendLine': 'trendline',
        'LineToolRay': 'ray',
        'LineToolInfoLine': 'info_line',
        'LineToolExtended': 'extended_line',
        'LineToolTrendAngle': 'trend_angle',
        'LineToolHorzLine': 'horizontal',
        'LineToolHorzRay': 'horzray',
        'LineToolVertLine': 'vertical',
        'LineToolCrossLine': 'crossline',
        'LineToolParallelChannel': 'parallel_channel',
        'LineToolRegressionTrend': 'regression_trend',
        'LineToolFlatBottom': 'flat_bottom',
        'LineToolDisjointAngle': 'disjoint_angle',
        'LineToolPitchfork': 'pitchfork',
        'LineToolSchiffPitchfork2': 'schiff_pitchfork',
        'LineToolSchiffPitchfork': 'mod_schiff_pitchfork',
        'LineToolInsidePitchfork': 'inside_pitchfork',

        'LineToolFibRetracement': 'fibonacci',
        'LineToolTrendBasedFibExtension': 'fib_extension',
        'LineToolFibChannel': 'fib_channel',
        'LineToolFibTimeZone': 'fib_timezone',
        'LineToolFibSpeedResistanceFan': 'fib_fan',
        'LineToolTrendBasedFibTime': 'fib_time',
        'LineToolFibCircles': 'fib_circles',
        'LineToolFibSpiral': 'fib_spiral',
        'LineToolFibSpeedResistanceArcs': 'fib_arcs',
        'LineToolFibWedge': 'fib_wedge',
        'LineToolGannBox': 'gann_box',
        'LineToolGannSquareFixed': 'gann_square_fixed',
        'LineToolGannSquare': 'gann_square',
        'LineToolGannFan': 'gann_fan',

        'LineToolBrush': 'brush',
        'LineToolHighlighter': 'highlighter',
        'LineToolArrowMarker': 'arrow_marker',
        'LineToolArrow': 'arrow',
        'LineToolArrowUp': 'arrow_up',
        'LineToolArrowDown': 'arrow_down',
        'LineToolRectangle': 'rectangle',
        'LineToolRotatedRectangle': 'rotated_rect',
        'LineToolPath': 'path',
        'LineToolCircle': 'circle',
        'LineToolEllipse': 'ellipse',
        'LineToolPolyline': 'polyline',
        'LineToolTriangle': 'triangle',
        'LineToolArc': 'arc',
        'LineToolBezierQuadro': 'curve',
        'LineToolBezierCubic': 'double_curve',

        'LineToolText': 'text',
        'LineToolTextNote': 'text_note',
        'LineToolPriceNote': 'price_note',
        'LineToolNote': 'pin_note',
        'LineToolTable': 'table',
        'LineToolCallout': 'callout',
        'LineToolComment': 'comment',
        'LineToolPriceLabel': 'price_label',
        'LineToolSignpost': 'signpost',
        'LineToolFlagMark': 'flag_mark',
        'LineToolImage': 'image_tool',
        'LineToolTweet': 'tweet_tool',
        'LineToolIdea': 'idea_tool',

        'LineTool5PointsPattern': 'pattern_xabcd',
        'LineToolCypherPattern': 'pattern_cypher',
        'LineToolHeadAndShoulders': 'pattern_head_shoulders',
        'LineToolABCD': 'pattern_abcd',
        'LineToolTrianglePattern': 'pattern_triangle',
        'LineToolThreeDrivers': 'pattern_three_drivers',
        'LineToolElliottImpulse': 'elliott_impulse',
        'LineToolElliottCorrection': 'elliott_correction',
        'LineToolElliottTriangle': 'elliott_triangle',
        'LineToolElliottDoubleCombo': 'elliott_double_combo',
        'LineToolElliottTripleCombo': 'elliott_triple_combo',
        'LineToolCircleLines': 'circle_lines',
        'LineToolTimeCycles': 'time_cycles',
        'LineToolSineLine': 'sine_line',

        'LineToolRiskRewardLong': 'long_pos',
        'LineToolRiskRewardShort': 'short_pos',
        'LineToolPrediction': 'pos_prediction',
        'LineToolBarsPattern': 'bars_pattern',
        'LineToolGhostFeed': 'ghost_feed',
        'LineToolProjection': 'projection',
        'LineToolAnchoredVWAP': 'anchored_vwap',
        'LineToolFixedRangeVolumeProfile': 'volume_profile_fixed',
        'LineToolAnchoredVolumeProfile': 'volume_profile_anchored',
        'LineToolPriceRange': 'price_range',
        'LineToolDateRange': 'date_range',
        'LineToolDateAndPriceRange': 'date_price_range'
    };
    return mapping[dataName] || dataName.toLowerCase();
}

console.log('Building full TradingView toolbar HTML...');

let toolbarHtml = `
            <!-- SOL ÇİZİM ARAÇ ÇUBUĞU (TRADINGVIEW OFFICIAL COMPLETE SUITE) -->
            <div id="drawing-toolbar" class="tv-left-toolbar">
                <div class="tv-tool-group">
`;

flyoutConfigs.forEach(cfg => {
    if (cfg.menuId === 'flyout-cursors') {
        toolbarHtml += `
                    <!-- 1. İmleçler (Cursors) -->
                    <div class="tv-tool-btn-wrap">
                        <button class="tv-tool-btn active" id="${cfg.buttonId}" onclick="selectTvTool('${cfg.defaultTool}', this)" title="İmleç / Artı">
                            ${cfg.mainIconSvg}
                        </button>
                        <div class="tv-arrow-btn" onclick="toggleFlyout('${cfg.menuId}', event)"><svg viewBox="0 0 10 16"><path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z"></path></svg></div>
                        <div class="tv-flyout-menu" id="${cfg.menuId}">
                            <div class="tv-flyout-title">İmleçler</div>
`;
        cfg.items.forEach(it => {
            toolbarHtml += `                            <div class="tv-flyout-item" onclick="selectTvTool('${it.tool}')"><div class="tv-flyout-item-left">${it.svg}<span>${it.label}</span></div></div>\n`;
        });
        toolbarHtml += `                        </div>\n                    </div>\n`;
        return;
    }

    const toolMap = extractToolMap(cfg.file);
    const mainToolItem = toolMap[Object.keys(toolMap)[0]];
    const mainSvg = mainToolItem ? mainToolItem.svg : '<svg></svg>';
    const mainLabel = mainToolItem ? mainToolItem.label : cfg.title;

    toolbarHtml += `
                    <!-- ${cfg.title} -->
                    <div class="tv-tool-btn-wrap">
                        <button class="tv-tool-btn" id="${cfg.buttonId}" onclick="selectTvTool('${cfg.defaultTool}', this)" title="${mainLabel}">
                            ${mainSvg}
                        </button>
                        <div class="tv-arrow-btn" onclick="toggleFlyout('${cfg.menuId}', event)"><svg viewBox="0 0 10 16"><path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z"></path></svg></div>
                        <div class="tv-flyout-menu" id="${cfg.menuId}">
`;

    cfg.categories.forEach(cat => {
        toolbarHtml += `                            <div class="tv-flyout-title">${cat.title}</div>\n`;
        cat.tools.forEach(toolName => {
            const item = toolMap[toolName];
            if (item) {
                const internalId = toInternalToolId(toolName);
                const hotkeyHtml = item.hotkey ? `<span class="tv-flyout-hotkey">${item.hotkey}</span>` : '';
                toolbarHtml += `                            <div class="tv-flyout-item" onclick="selectTvTool('${internalId}')"><div class="tv-flyout-item-left">${item.svg}<span>${item.label}</span></div>${hotkeyHtml}</div>\n`;
            }
        });
    });

    toolbarHtml += `                        </div>\n                    </div>\n`;
});

toolbarHtml += `                </div>

                <div class="tv-tool-separator"></div>

                <div class="tv-tool-group">
                    <!-- Ölçüm Cetveli (Measure) -->
                    <button class="tv-tool-btn" id="tv-tool-measure" onclick="selectTvTool('measure', this)" title="Ölçüm Cetveli (Shift + Tık)">
                        <svg width="28" height="28" viewBox="0 0 28 28"><path fill="currentColor" d="M2 9.75a1.5 1.5 0 0 0-1.5 1.5v5.5a1.5 1.5 0 0 0 1.5 1.5h24a1.5 1.5 0 0 0 1.5-1.5v-5.5a1.5 1.5 0 0 0-1.5-1.5zm0 1h3v2.5h1v-2.5h3.25v3.9h1v-3.9h3.25v2.5h1v-2.5h3.25v3.9h1v-3.9H22v2.5h1v-2.5h3a.5.5 0 0 1 .5.5v5.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-5.5a.5.5 0 0 1 .5-.5z" transform="rotate(-45 14 14)"></path></svg>
                    </button>

                    <!-- Yakınlaştır (Zoom) -->
                    <button class="tv-tool-btn" id="tv-tool-zoom" onclick="selectTvTool('zoom', this)" title="Yakınlaştır (Büyüteç)">
                        <svg viewBox="0 0 28 28" fill="currentColor"><path d="M17.646 18.354l4 4 .708-.708-4-4z"></path><path d="M12.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm0-1a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"></path><path d="M9 13h7v-1H9z"></path><path d="M13 16V9h-1v7z"></path></svg>
                    </button>

                    <!-- Mıknatıs Modu (Magnet) -->
                    <button class="tv-tool-btn" id="tv-tool-magnet" onclick="toggleTvMagnet(this)" title="Mıknatıs Modu: Mumların OHLC değerlerine yapışır">
                        <svg viewBox="0 0 28 28"><g fill="currentColor" fill-rule="evenodd"><path d="M14 10a2 2 0 0 0-2 2v11H6V12c0-4.416 3.584-8 8-8s8 3.584 8 8v11h-6V12a2 2 0 0 0-2-2zm-3 2a3 3 0 0 1 6 0v10h4V12c0-3.864-3.136-7-7-7s-7 3.136-7 7v10h4V12z"></path></g></svg>
                    </button>

                    <!-- Sürekli Çizim Modu -->
                    <button class="tv-tool-btn" id="tv-tool-continuous" onclick="toggleTvContinuous(this)" title="Çizim Modunda Kal (Stay in Drawing Mode)">
                        <svg viewBox="0 0 28 28"><path fill="currentColor" d="M17.27 4.56a2.5 2.5 0 0 0-3.54 0l-.58.59-9 9-1 1-.15.14V20h4.7l.15-.15 1-1 9-9 .59-.58a2.5 2.5 0 0 0 0-3.54l-1.17-1.17Z"></path></svg>
                    </button>

                    <!-- Tüm Çizimleri Kilitle -->
                    <button class="tv-tool-btn" id="tv-tool-lock" onclick="toggleTvLock(this)" title="Tüm Çizimleri Kilitle">
                        <svg viewBox="0 0 28 28"><path fill="currentColor" d="M9.8 3.6a4 4 0 0 1 5.5 1.3l.8-.5a3 3 0 0 0-5.5 2.2 3 3 0 0 0 .3.8l1 3.6H20a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 20.5v-7A2.5 2.5 0 0 1 9 11h1L8.6 9.1a4 4 0 0 1 1.2-5.5Z"></path></svg>
                    </button>

                    <!-- Tüm Çizimleri Gizle -->
                    <button class="tv-tool-btn" id="tv-tool-hide" onclick="toggleTvHide(this)" title="Tüm Çizimleri Gizle (Ctrl+Alt+H)">
                        <svg viewBox="0 0 28 28"><path fill="currentColor" d="M5 10.8a15 15 0 0 1 8-3.9 15 15 0 0 1 8 3.9 15 15 0 0 1-8 3.9 15 15 0 0 1-8-3.9ZM13 7.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z"></path></svg>
                    </button>

                    <!-- Tümünü Sil -->
                    <button class="tv-tool-btn" onclick="deleteTvDrawings()" title="Tüm Çizimleri Sil">
                        <svg viewBox="0 0 28 28"><path fill="currentColor" d="M18 7h5v1h-2l-1.3 14.6a1.5 1.5 0 0 1-1.5 1.4H9.8a1.5 1.5 0 0 1-1.5-1.4L7 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4Z"></path></svg>
                    </button>
                </div>

                <div style="flex: 1;"></div>

                <div class="tv-tool-group">
                    <!-- ⭐ Favori Çizim Araçları Kayan Barı Butonu -->
                    <button class="tv-tool-btn active" id="tv-tool-fav-toggle" onclick="toggleFavoriteFloatingBar(this)" title="Favori Çizim Araçları Kayan Barını Göster/Gizle">
                        <svg viewBox="0 0 28 28"><path fill="#f59e0b" d="m14 3 3.1 6.7 7.4.9-5.4 5.1 1.3 7.3L14 19.4 7.6 23l1.3-7.3-5.4-5.1 7.4-.9L14 3Z"></path></svg>
                    </button>
                </div>
            </div>`;

let html = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Replace old toolbar with new complete toolbar
html = html.replace(
    /<!-- SOL ÇİZİM ARAÇ ÇUBUĞU[\s\S]*?<\/div>\s*<\/div>\s*<!-- SOL: GRAFİK ALANI -->/,
    `${toolbarHtml}\n\n            <!-- SOL: GRAFİK ALANI -->`
);

fs.writeFileSync('indikator_sablonu.html', html, 'utf8');
console.log('Complete TradingView toolbar with all 80+ tools and flyouts integrated into HTML!');
