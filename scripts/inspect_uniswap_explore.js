import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // 1. Go to explore page
    try {
        console.log('Navigating to https://app.uniswap.org/explore ...');
        await page.goto('https://app.uniswap.org/explore', { waitUntil: 'networkidle', timeout: 25000 });
    } catch (e) {
        console.warn('Continuing after timeout...');
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/uniswap_02_explore.png' });
    console.log('✓ Captured explore page: scripts/uniswap_02_explore.png');

    // 2. Go to a specific token chart page (ETH or BTC)
    try {
        console.log('Navigating to token chart page...');
        await page.goto('https://app.uniswap.org/explore/tokens/ethereum/NATIVE', { waitUntil: 'networkidle', timeout: 25000 });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'scripts/uniswap_03_token_chart.png' });
        console.log('✓ Captured token chart page: scripts/uniswap_03_token_chart.png');
    } catch(e) {
        console.warn('Token chart error:', e);
    }

    await browser.close();
    console.log('UNISWAP EXPLORE INSPECTION COMPLETE!');
})();
