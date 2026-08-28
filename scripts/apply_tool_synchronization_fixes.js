import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Fix default magnetMode to false
content = content.replace(
    /this\.magnetMode = true;/,
    `this.magnetMode = false;`
);

// 2. Fix handleMouseUp in TradingViewDrawingEngine to use window.selectTvTool('cursor') when continuousDraw is false
content = content.replace(
    /if \(!this\.continuousDraw\) this\.setTool\('cursor'\);/g,
    `if (!this.continuousDraw) { window.selectTvTool('cursor'); } else { this.drawingState = 'idle'; this.drawingInProgress = null; }`
);

// 3. Replace selectTvTool with full TOOL_TO_GROUP_MAP synchronization
const oldSelectTvTool = `        window.selectTvTool = function(toolName, btnElem) {
            if (drawingEngine) drawingEngine.setTool(toolName);
            document.querySelectorAll('.tv-tool-btn').forEach(b => b.classList.remove('active'));
            if (btnElem) btnElem.classList.add('active');
            else {
                const b = document.getElementById('tv-tool-' + toolName);
                if (b) b.classList.add('active');
            }
            document.querySelectorAll('.tv-flyout-menu').forEach(m => m.classList.remove('open'));
        };`;

const newSelectTvTool = `        const TOOL_TO_GROUP_MAP = {
            'cursor': 'tv-tool-cursor',
            'cursor_dot': 'tv-tool-cursor',
            'cursor_arrow': 'tv-tool-cursor',
            'cursor_eraser': 'tv-tool-cursor',

            'trendline': 'tv-tool-trendline',
            'ray': 'tv-tool-trendline',
            'info_line': 'tv-tool-trendline',
            'extended_line': 'tv-tool-trendline',
            'trend_angle': 'tv-tool-trendline',
            'horizontal': 'tv-tool-trendline',
            'horzray': 'tv-tool-trendline',
            'vertical': 'tv-tool-trendline',
            'crossline': 'tv-tool-trendline',
            'parallel_channel': 'tv-tool-trendline',
            'regression_trend': 'tv-tool-trendline',
            'flat_bottom': 'tv-tool-trendline',
            'disjoint_angle': 'tv-tool-trendline',
            'pitchfork': 'tv-tool-trendline',
            'schiff_pitchfork': 'tv-tool-trendline',
            'mod_schiff_pitchfork': 'tv-tool-trendline',
            'inside_pitchfork': 'tv-tool-trendline',

            'fibonacci': 'tv-tool-fibonacci',
            'fib_extension': 'tv-tool-fibonacci',
            'fib_channel': 'tv-tool-fibonacci',
            'fib_timezone': 'tv-tool-fibonacci',
            'fib_fan': 'tv-tool-fibonacci',
            'fib_time': 'tv-tool-fibonacci',
            'fib_circles': 'tv-tool-fibonacci',
            'fib_spiral': 'tv-tool-fibonacci',
            'fib_arcs': 'tv-tool-fibonacci',
            'fib_wedge': 'tv-tool-fibonacci',
            'gann_box': 'tv-tool-fibonacci',
            'gann_square_fixed': 'tv-tool-fibonacci',
            'gann_square': 'tv-tool-fibonacci',
            'gann_fan': 'tv-tool-fibonacci',

            'rectangle': 'tv-tool-rectangle',
            'rotated_rect': 'tv-tool-rectangle',
            'path': 'tv-tool-rectangle',
            'circle': 'tv-tool-rectangle',
            'ellipse': 'tv-tool-rectangle',
            'polyline': 'tv-tool-rectangle',
            'triangle': 'tv-tool-rectangle',
            'arc': 'tv-tool-rectangle',
            'curve': 'tv-tool-rectangle',
            'double_curve': 'tv-tool-rectangle',
            'brush': 'tv-tool-rectangle',
            'highlighter': 'tv-tool-rectangle',
            'arrow_marker': 'tv-tool-rectangle',
            'arrow': 'tv-tool-rectangle',
            'arrow_up': 'tv-tool-rectangle',
            'arrow_down': 'tv-tool-rectangle',

            'text': 'tv-tool-text',
            'text_note': 'tv-tool-text',
            'price_note': 'tv-tool-text',
            'pin_note': 'tv-tool-text',
            'table': 'tv-tool-text',
            'callout': 'tv-tool-text',
            'comment': 'tv-tool-text',
            'price_label': 'tv-tool-text',
            'signpost': 'tv-tool-text',
            'flag_mark': 'tv-tool-text',
            'image_tool': 'tv-tool-text',
            'tweet_tool': 'tv-tool-text',
            'idea_tool': 'tv-tool-text',

            'pattern_xabcd': 'tv-tool-patterns',
            'pattern_cypher': 'tv-tool-patterns',
            'pattern_head_shoulders': 'tv-tool-patterns',
            'pattern_abcd': 'tv-tool-patterns',
            'pattern_triangle': 'tv-tool-patterns',
            'pattern_three_drivers': 'tv-tool-patterns',
            'elliott_impulse': 'tv-tool-patterns',
            'elliott_correction': 'tv-tool-patterns',
            'elliott_triangle': 'tv-tool-patterns',
            'elliott_double_combo': 'tv-tool-patterns',
            'elliott_triple_combo': 'tv-tool-patterns',
            'circle_lines': 'tv-tool-patterns',
            'time_cycles': 'tv-tool-patterns',
            'sine_line': 'tv-tool-patterns',

            'long_pos': 'tv-tool-long_pos',
            'short_pos': 'tv-tool-long_pos',
            'pos_prediction': 'tv-tool-long_pos',
            'bars_pattern': 'tv-tool-long_pos',
            'ghost_feed': 'tv-tool-long_pos',
            'projection': 'tv-tool-long_pos',
            'anchored_vwap': 'tv-tool-long_pos',
            'volume_profile_fixed': 'tv-tool-long_pos',
            'volume_profile_anchored': 'tv-tool-long_pos',
            'price_range': 'tv-tool-long_pos',
            'date_range': 'tv-tool-long_pos',
            'date_price_range': 'tv-tool-long_pos',
            'measure': 'tv-tool-measure',
            'zoom': 'tv-tool-zoom'
        };

        window.selectTvTool = function(toolName, btnElem) {
            if (drawingEngine) {
                drawingEngine.setTool(toolName);
            }
            
            // 1. Sol araç çubuğundaki temel çizim butonlarının active durumunu sıfırla
            document.querySelectorAll('.tv-left-toolbar .tv-tool-btn').forEach(b => {
                const isUtilityBtn = ['tv-tool-magnet', 'tv-tool-continuous', 'tv-tool-lock', 'tv-tool-hide', 'tv-tool-fav-toggle'].includes(b.id);
                if (!isUtilityBtn) {
                    b.classList.remove('active');
                }
            });

            // 2. Kayan favori çubuğundaki seçimleri sıfırla
            document.querySelectorAll('.tv-fav-item').forEach(it => it.classList.remove('active'));

            // 3. Sol araç çubuğundaki ilgili grup butonunu aktifleştir
            const groupBtnId = TOOL_TO_GROUP_MAP[toolName] || ('tv-tool-' + toolName);
            const groupBtn = document.getElementById(groupBtnId);
            if (groupBtn) groupBtn.classList.add('active');

            // 4. Kayan favori barında karşılık gelen araç varsa onu da senkronize aktifleştir
            const favItem = document.querySelector(\`.tv-fav-item[onclick*="'\${toolName}'"]\`);
            if (favItem) favItem.classList.add('active');

            // 5. Açık olan tüm flyout menülerini kapat
            document.querySelectorAll('.tv-flyout-menu').forEach(m => m.classList.remove('open'));
        };`;

content = content.replace(oldSelectTvTool, newSelectTvTool);

// 4. Update cancelDrawing to use window.selectTvTool('cursor')
content = content.replace(
    /cancelDrawing\(\) \{\s*this\.drawingInProgress = null;\s*this\.drawingState = 'idle';\s*this\.setTool\('cursor'\);\s*this\.selectDrawing\(null\);\s*\}/,
    `cancelDrawing() {
                this.drawingInProgress = null;
                this.drawingState = 'idle';
                window.selectTvTool('cursor');
                this.selectDrawing(null);
            }`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Applied full fixes for magnet default state, continuous drawing synchronization, and navbar sync!');
