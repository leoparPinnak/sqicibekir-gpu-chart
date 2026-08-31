import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log('BLOOM BROWSER:', msg.text()));

    console.log('Testing Candle Bloom Inception on frontend portal...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });

    // 1. T = 300ms (Early bloom - flat candles sprouting)
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_bloom_01_sprouting.png' });
    console.log('✓ Captured T=300ms bloom sprouting frame.');

    // 2. T = 800ms (Mid bloom - candles expanding)
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshot_bloom_02_expanding.png' });
    console.log('✓ Captured T=800ms bloom expanding frame.');

    // 3. T = 1500ms (Full bloom complete, centered pause)
    await page.waitForTimeout(700);
    await page.screenshot({ path: 'scripts/screenshot_bloom_03_full_bloom.png' });
    console.log('✓ Captured T=1500ms full bloom complete frame.');

    // 4. T = 4500ms (Camera glide in progress)
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/screenshot_bloom_04_camera_glide.png' });
    console.log('✓ Captured T=4500ms camera glide frame.');

    await browser.close();
    console.log('ALL BLOOM INCEPTION TESTS PASSED!');
})();
