import fs from 'fs';

let content = fs.readFileSync('indikator_sablonu.html', 'utf8');

const popoverCss = `
        /* ⚙️ İVME & HASSASİYET KALİBRASYON POPOVER */
        .velocity-settings-wrap {
            position: relative;
            display: inline-flex;
            align-items: center;
        }
        .velocity-settings-popover {
            display: none;
            position: absolute;
            bottom: calc(100% + 10px);
            left: 0;
            width: 290px;
            background: #1e222d;
            border: 1px solid #38bdf8;
            border-radius: 8px;
            padding: 12px 14px;
            box-shadow: 0 14px 40px rgba(0,0,0,0.95);
            z-index: 99999;
            font-size: 11px;
            color: #94a3b8;
        }
        .velocity-settings-popover.open {
            display: block;
        }
        .popover-title {
            font-weight: 800;
            color: #f1f5f9;
            font-size: 11px;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #2a2e39;
            padding-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .popover-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        .preset-row {
            display: flex;
            gap: 4px;
            margin-bottom: 10px;
        }
        .preset-btn {
            flex: 1;
            background: #131722;
            border: 1px solid #2a2e39;
            color: #cbd5e1;
            border-radius: 4px;
            padding: 5px 2px;
            font-size: 9.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .preset-btn:hover {
            background: #2a2e39;
            color: #38bdf8;
            border-color: #38bdf8;
        }
        .live-velocity-meter {
            background: #131722;
            border: 1px solid #2a2e39;
            border-radius: 6px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .status-pill {
            display: block;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            text-align: center;
            letter-spacing: 0.5px;
        }
        .status-pill.free {
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid #38bdf8;
        }
        .status-pill.locked {
            background: rgba(16, 185, 129, 0.20);
            color: #10b981;
            border: 1px solid #10b981;
        }
`;

content = content.replace('</style>', popoverCss + '\n    </style>');

fs.writeFileSync('indikator_sablonu.html', content, 'utf8');
console.log('Successfully injected popover CSS into <style> tag!');
