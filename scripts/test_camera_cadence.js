import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log('DEMO BROWSER:', msg.text()));

    console.log('Testing initial centered entry and pause delays...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    
    // 1. Capture at T = 1.2s (Initial centered state)
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'scripts/screenshot_cadence_01_centered.png' });
    console.log('✓ Captured T=1.2s initial centered frame.');

    // 2. Capture at T = 5.0s (First movement in progress)
    await page.waitForTimeout(3800);
    await page.screenshot({ path: 'scripts/screenshot_cadence_02_moving.png' });
    console.log('✓ Captured T=5.0s moving frame.');

    // 3. Capture at T = 8.5s (Pause/Second action)
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'scripts/screenshot_cadence_03_pause_next.png' });
    console.log('✓ Captured T=8.5s next frame.');

    await browser.close();
    console.log('CADENCE TEST FINISHED SUCCESSFULLY!');
})();
