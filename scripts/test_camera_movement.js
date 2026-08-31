import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', err => console.error('[BROWSER ERROR]:', err));

    console.log('Navigating to http://localhost:5173/frontend/index.html...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const frame = page.frames().find(f => f.url().includes('indikator_sablonu'));
    if (!frame) throw new Error('Iframe not found!');

    console.log('Monitoring background camera movement for 5 seconds...');
    const pos1 = await frame.evaluate(() => ({ start: window.viewStart, end: window.viewEnd }));
    console.log('Camera Position T=0s:', pos1);

    await page.waitForTimeout(2500);
    const pos2 = await frame.evaluate(() => ({ start: window.viewStart, end: window.viewEnd }));
    console.log('Camera Position T=2.5s:', pos2);

    await page.waitForTimeout(2500);
    const pos3 = await frame.evaluate(() => ({ start: window.viewStart, end: window.viewEnd }));
    console.log('Camera Position T=5.0s:', pos3);

    const isMoving = pos1.start !== pos2.start || pos2.start !== pos3.start;
    console.log('Is Autonomous Demo Camera Gliding Continuously?:', isMoving ? '✅ YES!' : '❌ NO');

    await page.screenshot({ path: 'scripts/screenshot_final_live_demo.png' });
    await browser.close();
})();
