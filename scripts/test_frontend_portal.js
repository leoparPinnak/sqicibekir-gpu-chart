import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log('PORTAL BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('PORTAL BROWSER ERROR:', err));

    console.log('Opening http://localhost:5173/frontend/index.html ...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 1. Capture Landing Portal with Autonomous Background Chart
    await page.screenshot({ path: 'scripts/screenshot_portal_01_landing.png' });
    console.log('✓ Landing portal captured: scripts/screenshot_portal_01_landing.png');

    // 2. Click "CANLI GRAFİK TERMİNALİNİ AÇ"
    console.log('Launching live terminal...');
    await page.click('.portal-card-btn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshot_portal_02_terminal_active.png' });
    console.log('✓ Live terminal active captured: scripts/screenshot_portal_02_terminal_active.png');

    // 3. Click "Portal / Ana Sayfaya Dön"
    console.log('Returning to landing portal...');
    await page.click('#return-to-portal-btn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshot_portal_03_returned.png' });
    console.log('✓ Returned to landing portal captured: scripts/screenshot_portal_03_returned.png');

    await browser.close();
    console.log('ALL FRONTEND PORTAL TESTS PASSED!');
})();
