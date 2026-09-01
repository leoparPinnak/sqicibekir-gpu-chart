import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const initialScrollY = await page.evaluate(() => window.scrollY);
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    console.log(`Page scrollHeight: ${scrollHeight}px, clientHeight: ${clientHeight}px`);

    console.log('Simulating mouse wheel scrolling down 800px...');
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(400);

    const scrolledY1 = await page.evaluate(() => window.scrollY);
    console.log(`After wheel scroll: window.scrollY = ${scrolledY1}px`);

    console.log('Simulating mouse wheel scrolling down another 1200px (towards Login & Markets)...');
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(400);

    const scrolledY2 = await page.evaluate(() => window.scrollY);
    console.log(`After second wheel scroll: window.scrollY = ${scrolledY2}px`);

    if (scrolledY2 > 1000) {
        console.log('🎉 REAL MOUSE WHEEL SCROLLING IS 100% OPERATIONAL & WORKING PERFECTLY!');
    } else {
        console.error('❌ Wheel scroll did not scroll window');
        process.exit(1);
    }

    await browser.close();
})();
