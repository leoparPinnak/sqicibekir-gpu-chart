import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// 1. Export window.drawingEngine & window.canvasContainer
content = content.replace(
    /const drawingEngine = new TradingViewDrawingEngine\(canvasContainer, overlayCanvas, \{[\s\S]*?\}\);/,
    `const drawingEngine = new TradingViewDrawingEngine(canvasContainer, overlayCanvas, {
            getPriceRange: () => ({ min: minPrice, max: maxPrice }),
            getViewRange: () => ({ start: smoothViewStart || viewStart, end: smoothViewEnd || viewEnd }),
            getCandleData: () => candleDataBase
        });
        window.drawingEngine = drawingEngine;
        window.canvasContainer = canvasContainer;`
);

// 2. Comprehensive single-point vs 2-point tools list in handleMouseUp
const singlePointToolsList = `['horizontal', 'horzray', 'vertical', 'crossline', 'arrow_up', 'arrow_down', 'text', 'text_note', 'price_note', 'pin_note', 'price_label', 'signpost', 'flag_mark', 'callout', 'comment', 'image_tool', 'tweet_tool', 'idea_tool']`;

content = content.replace(
    /\['horizontal', 'horzray', 'vertical'\]\.includes\(this\.activeTool\)/g,
    `${singlePointToolsList}.includes(this.activeTool)`
);

// 3. Cursor tools mapping in setTool
content = content.replace(
    /setTool\(toolName\) \{\s*this\.activeTool = toolName;/,
    `setTool(toolName) {
                if (toolName.startsWith('cursor')) {
                    this.activeTool = 'cursor';
                    this.cursorType = toolName;
                } else {
                    this.activeTool = toolName;
                }`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Exported window.drawingEngine and expanded tool classifications!');
