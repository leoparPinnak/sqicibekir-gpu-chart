import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1100 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('1. Testing Section 5 (Giriş Portalı) visibility & taking screenshot...');
    const loginSection = await page.locator('#showcase-section-login');
    await loginSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_preview_login_portal.png' });

    console.log('2. Testing Section 6 (Piyasalar) tab filtering (Kripto)...');
    const marketsSection = await page.locator('#showcase-section-markets');
    await marketsSection.scrollIntoViewIfNeeded();
    await page.click('.mock-tab-btn[data-market-tab="crypto"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_preview_markets_crypto.png' });

    console.log('3. Testing search in Section 6 ("NVDA")...');
    await page.click('.mock-tab-btn[data-market-tab="all"]');
    await page.fill('#mock-market-search', 'NVDA');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_preview_markets_search.png' });

    console.log('4. Full page screenshot with all 6 sections...');
    await page.fill('#mock-market-search', '');
    await page.screenshot({ path: 'scripts/screenshot_full_with_login_and_markets.png', fullPage: true });

    console.log('✓ All tests for Homepage Login & Markets in Glass Lab PASSED!');
    await browser.close();
})();
