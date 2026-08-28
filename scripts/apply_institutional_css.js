import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

// Refine indicator-badge
content = content.replace(
    /\.indicator-badge \{[\s\S]*?\}/,
    `.indicator-badge {
            background: #1e222d;
            border: 1px solid #2a2e39;
            color: #f0f3fa;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 4px;
            letter-spacing: 0.5px;
        }`
);

// Refine symbol-select
content = content.replace(
    /\.symbol-select \{[\s\S]*?\}/,
    `.symbol-select {
            background: #1e222d;
            border: 1px solid #2a2e39;
            color: #f0f3fa;
            font-size: 12px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            outline: none;
        }`
);

// Refine tf-selector-group & tf-btn
content = content.replace(
    /\.tf-selector-group \{[\s\S]*?\}/,
    `.tf-selector-group {
            display: flex;
            align-items: center;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 4px;
            padding: 2px;
            gap: 2px;
        }`
);

content = content.replace(
    /\.tf-btn\.active \{[\s\S]*?\}/,
    `.tf-btn.active {
            background: #2962ff;
            color: #ffffff;
            font-weight: 700;
            box-shadow: none;
        }`
);

// Refine strategy-selector-group & strat-btn
content = content.replace(
    /\.strategy-selector-group \{[\s\S]*?\}/,
    `.strategy-selector-group {
            display: flex;
            align-items: center;
            background: #1e222d;
            border: 1px solid #2a2e39;
            border-radius: 4px;
            padding: 2px;
            gap: 2px;
        }`
);

content = content.replace(
    /\.strat-btn\.active \{[\s\S]*?\}/,
    `.strat-btn.active {
            background: #2962ff;
            border-color: #2962ff;
            color: #ffffff;
            font-weight: 700;
            box-shadow: none;
        }`
);

content = content.replace(
    /\.strat-btn\.highlight-btc\.active \{[\s\S]*?\}/,
    `.strat-btn.highlight-btc.active {
            background: #2962ff;
            border-color: #2962ff;
            box-shadow: none;
        }`
);

// Refine candle-depth-select
content = content.replace(
    /\.candle-depth-select \{[\s\S]*?\}/,
    `.candle-depth-select {
            background: #1e222d;
            border: 1px solid #2a2e39;
            color: #d1d4dc;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            outline: none;
        }`
);

// Refine ind-btn & backtest-btn
content = content.replace(
    /\.ind-btn \{[\s\S]*?\}/,
    `.ind-btn {
            background: #1e222d;
            border: 1px solid #2a2e39;
            color: #787b86;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s;
        }`
);

content = content.replace(
    /\.ind-btn\.active \{[\s\S]*?\}/,
    `.ind-btn.active {
            background: rgba(41, 98, 255, 0.15);
            border-color: #2962ff;
            color: #f0f3fa;
        }`
);

content = content.replace(
    /\.backtest-btn \{[\s\S]*?\}/,
    `.backtest-btn {
            background: #1e222d;
            border: 1px solid #2a2e39;
            color: #787b86;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s;
        }`
);

content = content.replace(
    /\.backtest-btn\.active \{[\s\S]*?\}/,
    `.backtest-btn.active {
            background: #059669;
            border-color: #10b981;
            color: #ffffff;
        }`
);

// Refine HUD cards
content = content.replace(
    /\.hud-overlay-card \{[\s\S]*?\}/,
    `.hud-overlay-card {
            position: absolute;
            top: 10px;
            left: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 15;
            pointer-events: none;
        }`
);

content = content.replace(
    /\.hud-badge-row \{[\s\S]*?\}/,
    `.hud-badge-row {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(19, 23, 34, 0.88);
            border: 1px solid #2a2e39;
            padding: 5px 8px;
            border-radius: 5px;
            backdrop-filter: blur(6px);
            font-size: 10.5px;
            color: #787b86;
            font-weight: 600;
        }`
);

content = content.replace(
    /\.visible-backtest-card \{[\s\S]*?\}/,
    `.visible-backtest-card {
            background: rgba(19, 23, 34, 0.92);
            border: 1px solid #2a2e39;
            padding: 8px 10px;
            border-radius: 5px;
            backdrop-filter: blur(8px);
            font-size: 11px;
            color: #d1d4dc;
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 320px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }`
);

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Institutional CSS applied successfully!');
