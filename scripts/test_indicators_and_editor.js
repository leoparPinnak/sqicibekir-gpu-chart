import { chromium } from 'playwright';

async function testIndicatorsAndScriptEditor() {
    console.log('--- Testing Modular Indicators & Script Editor in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Open Indicator Modal
    console.log('1. Opening Göstergeler (fx) Modal via Toolbar Button...');
    await page.locator('#btn-open-indicators').click();
    await page.waitForTimeout(400);

    const isModalActive = await page.evaluate(() => document.getElementById('fx-modal-backdrop').classList.contains('active'));
    console.log(`Modal visible: ${isModalActive}`);

    // 2. Add Built-in Indicators: RSI, MACD, Bollinger Bands, EMA
    console.log('2. Adding RSI, MACD, Bollinger Bands, and EMA...');
    await page.evaluate(() => {
        window.addIndicator('rsi');
        window.addIndicator('macd');
        window.addIndicator('bollinger');
        window.addIndicator('ema');
    });
    await page.waitForTimeout(600);

    // Switch to Active Tab
    await page.locator('#fx-tab-active').click();
    await page.waitForTimeout(300);
    const activeCount = await page.locator('#active-ind-count').innerText();
    console.log(`Active indicators count in tab: ${activeCount}`);

    // Close Modal
    await page.locator('#btn-close-fx-modal').click();
    await page.waitForTimeout(400);

    // 3. Open Indicator Settings Modal for RSI
    console.log('3. Opening Settings for RSI...');
    await page.evaluate(() => {
        const rsiInd = window.activeIndicators.find(i => i.defId === 'rsi');
        if (rsiInd) window.openIndicatorSettings(rsiInd.id);
    });
    await page.waitForTimeout(400);
    const isSettingsActive = await page.evaluate(() => document.getElementById('fx-settings-modal').classList.contains('active'));
    console.log(`Settings Modal visible: ${isSettingsActive}`);
    await page.evaluate(() => window.closeIndicatorSettings());
    await page.waitForTimeout(300);

    // 4. Open Script Editor and run custom Pine/JS formula
    console.log('4. Opening Script Editor and executing custom Pine/JS script...');
    await page.locator('#btn-open-script-editor').click();
    await page.waitForTimeout(400);

    const isEditorActive = await page.evaluate(() => document.getElementById('pine-editor-panel').classList.contains('active'));
    console.log(`Script editor visible: ${isEditorActive}`);

    await page.evaluate(() => {
        const editor = document.getElementById('pine-code-editor');
        editor.value = `// ⚡ Özel Scalp Trend Göstergesi
const fastEma = ema(close, 7);
const slowEma = ema(close, 25);
plot(fastEma, "Hızlı EMA (7)", "#10b981", 2.5, true);
plot(slowEma, "Yavaş EMA (25)", "#f43f5e", 2.5, true);
`;
        window.runPineScript();
    });
    await page.waitForTimeout(600);

    const consoleMsg = await page.locator('#pine-console').innerText();
    console.log(`Script console status: "${consoleMsg}"`);

    // Verify subpanes exist in DOM
    const subpaneCount = await page.evaluate(() => document.querySelectorAll('.subpane-container').length);
    console.log(`Rendered subpanes in DOM: ${subpaneCount}`);

    await page.screenshot({ path: 'scripts/indicators_and_script_editor_screenshot.png' });
    console.log('Screenshot saved to scripts/indicators_and_script_editor_screenshot.png');

    await browser.close();

    if (isModalActive && parseInt(activeCount, 10) >= 4 && subpaneCount >= 2 && consoleMsg.includes('Başarılı')) {
        console.log('\n--- ALL CHECKS PASSED: Modular Indicator Modal & Script Editor System successfully verified! ---');
    } else {
        throw new Error('Indicator system verification failed!');
    }
}

testIndicatorsAndScriptEditor().catch(err => {
    console.error(err);
    process.exit(1);
});
