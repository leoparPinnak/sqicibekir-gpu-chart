import { chromium } from 'playwright';

async function testCleanChart() {
    console.log('--- Testing Clean Modular Chart with fx Indicators Button in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForSelector('#loading-overlay', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'scripts/clean_chart_screenshot.png' });
    console.log('Screenshot saved to scripts/clean_chart_screenshot.png');

    await browser.close();
}

testCleanChart().catch(console.error);
