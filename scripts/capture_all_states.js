import { chromium } from 'playwright';

async function captureAllStates() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Add RSI & MACD & Bollinger Bands
    await page.evaluate(() => {
        window.addIndicator('rsi');
        window.addIndicator('macd');
        window.addIndicator('bollinger');
    });
    await page.waitForTimeout(600);

    // State 1: Subpanes open on chart
    await page.screenshot({ path: 'scripts/chart_with_subpanes_screenshot.png' });
    console.log('Saved scripts/chart_with_subpanes_screenshot.png');

    // State 2: Open Göstergeler (fx) Modal
    await page.locator('#btn-open-indicators').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/indicators_modal_screenshot.png' });
    console.log('Saved scripts/indicators_modal_screenshot.png');

    // Switch to Active Tab
    await page.locator('#fx-tab-active').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/active_indicators_tab_screenshot.png' });
    console.log('Saved scripts/active_indicators_tab_screenshot.png');

    await browser.close();
}

captureAllStates().catch(console.error);
