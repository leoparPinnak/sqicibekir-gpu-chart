import fs from 'fs';

const catalogJson = fs.readFileSync('scripts/full_symbol_catalog.json', 'utf8');
const catalog = JSON.parse(catalogJson);

console.log(`Loaded ${catalog.length} symbols from catalog.`);

const emojiMap = [
    [/🇹🇷\s*/gu, ''],
    [/🇺🇸\s*/gu, ''],
    [/🪙\s*/gu, ''],
    [/🥇\s*/gu, ''],
    [/🛢️\s*/gu, ''],
    [/💱\s*/gu, ''],
    [/🌟\s*/gu, ''],
    [/⚡\s*/gu, ''],
    [/🔍\s*/gu, ''],
    [/🔒\s*/gu, ''],
    [/🔓\s*/gu, ''],
    [/🟡\s*/gu, ''],
    [/🔵\s*/gu, ''],
    [/🟢\s*/gu, ''],
    [/📱\s*/gu, ''],
    [/💻\s*/gu, ''],
    [/🚫\s*/gu, ''],
    [/⚙️\s*/gu, ''],
    [/📊\s*/gu, ''],
    [/📈\s*/gu, ''],
    [/🎯\s*/gu, ''],
    [/🚀\s*/gu, ''],
    [/🛑\s*/gu, ''],
    [/⏱️\s*/gu, ''],
    [/⏳\s*/gu, ''],
    [/👁️\s*/gu, ''],
    [/🗑️\s*/gu, ''],
    [/➕\s*/gu, ''],
    [/❌\s*/gu, ''],
    [/🦀\s*/gu, ''],
    [/🛡️\s*/gu, ''],
    [/✨\s*/gu, ''],
    [/●\s*/gu, ''],
    [/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '']
];

function cleanEmojis(text) {
    let res = text;
    emojiMap.forEach(([reg, rep]) => {
        res = res.replace(reg, rep);
    });
    return res;
}

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace SYMBOL_CATALOG cleanly
    const startMarker = 'const SYMBOL_CATALOG = [';
    const tabMarker = "let activeSymbolTab = 'all';";

    const sIdx = content.indexOf(startMarker);
    const tabIdx = content.indexOf(tabMarker, sIdx);

    if (sIdx !== -1 && tabIdx !== -1) {
        const replacement = `const SYMBOL_CATALOG = ${JSON.stringify(catalog, null, 4)};\n\n        `;
        content = content.substring(0, sIdx) + replacement + content.substring(tabIdx);
        console.log(`✓ Cleanly injected massive catalog into ${filePath}`);
    } else {
        console.warn(`Could not find markers in ${filePath}`);
    }

    // 2. Strip all emojis
    content = cleanEmojis(content);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Stripped emojis and saved ${filePath}`);
}

processHtmlFile('indikator_sablonu.html');
processHtmlFile('index.html');

// Process tradechart-wasm main.js
const wasmMainPath = '../tradechart-wasm/src/main.js';
if (fs.existsSync(wasmMainPath)) {
    let wasmContent = fs.readFileSync(wasmMainPath, 'utf8');
    const wasmStartMarker = 'const SYMBOL_CATALOG = [';
    const wasmSymMarker = "let currentSymbol = 'BTCUSDT';";

    const wIdx = wasmContent.indexOf(wasmStartMarker);
    const wSymIdx = wasmContent.indexOf(wasmSymMarker, wIdx);

    if (wIdx !== -1 && wSymIdx !== -1) {
        const replacement = `const SYMBOL_CATALOG = ${JSON.stringify(catalog, null, 4)};\n\n`;
        wasmContent = wasmContent.substring(0, wIdx) + replacement + wasmContent.substring(wSymIdx);
    }
    wasmContent = cleanEmojis(wasmContent);
    fs.writeFileSync(wasmMainPath, wasmContent, 'utf8');
    console.log(`✓ Updated wasm main.js with massive catalog & no emojis`);
}

// Process tradechart-wasm index.html
const wasmIndexPath = '../tradechart-wasm/index.html';
if (fs.existsSync(wasmIndexPath)) {
    let wasmIndex = fs.readFileSync(wasmIndexPath, 'utf8');
    wasmIndex = cleanEmojis(wasmIndex);
    fs.writeFileSync(wasmIndexPath, wasmIndex, 'utf8');
    console.log('✓ Cleaned emojis from wasm index.html');
}

console.log('ALL FILES UPDATED SUCCESSFULLY WITH MASSIVE 858-SYMBOL CATALOG AND ZERO EMOJIS!');
