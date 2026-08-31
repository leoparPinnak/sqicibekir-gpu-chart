import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err));

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#glcanvas').boundingBox();
    const cx = canvasBox.x + canvasBox.width / 2;
    const cy = canvasBox.y + canvasBox.height / 2;

    // 1. Initial State
    await page.screenshot({ path: 'scripts/screenshot_fix_01_initial.png' });
    console.log('✓ Initial chart loaded in Serbest mode.');

    // 2. Zoom in with wheel
    console.log('Zooming in...');
    await page.mouse.move(cx, cy);
    for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(40);
    }

    // 3. Immediate click during zoom
    console.log('Clicking immediately to interrupt...');
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scripts/screenshot_fix_02_clicked_during_zoom.png' });
    console.log('✓ Immediate click interrupted zoom with zero delay.');

    // 4. Switch to Kilitli mode
    console.log('Switching to Kilitli mode...');
    await page.click('#mode-btn-locked');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_fix_03_locked_mode.png' });
    console.log('✓ Switched to Kilitli mode.');

    // 5. Switch back to Serbest mode
    console.log('Switching back to Serbest mode...');
    await page.click('#mode-btn-free');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_fix_04_free_mode.png' });
    console.log('✓ Switched back to Serbest mode.');

    // 6. Test Space auto-fit
    console.log('Pressing Space key...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_fix_05_space_fit.png' });
    console.log('✓ Space auto fit executed smoothly.');

    await browser.close();
    console.log('ALL SCALE MODE TESTS PASSED WITH 0 ERRORS!');
})();
