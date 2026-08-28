import { chromium } from 'playwright';

async function testVelocityCalibrationUI() {
    console.log('--- Testing Interactive Velocity Calibration Widget in Playwright ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 1. Click Velocity Settings Button
    const btn = await page.locator('#btn-velocity-settings');
    await btn.click();
    await page.waitForTimeout(300);

    // 2. Verify Popover Opened
    const isPopoverVisible = await page.locator('#velocity-popover').isVisible();
    console.log('1. Popover is visible:', isPopoverVisible);

    // 3. Click "Hızlı (1.40)" preset
    const presetBtn = await page.locator('.preset-btn', { hasText: 'Hızlı (1.40)' });
    await presetBtn.click();
    await page.waitForTimeout(200);

    const thresholdVal = await page.evaluate(() => window.velocityThreshold);
    const labelText = await page.locator('#current-threshold-label').innerText();
    console.log(`2. Updated Threshold Value: ${thresholdVal} | Label: ${labelText}`);

    await page.screenshot({ path: 'scripts/velocity_calibration_screenshot.png' });
    console.log('Screenshot saved to scripts/velocity_calibration_screenshot.png');

    await browser.close();

    if (isPopoverVisible && thresholdVal === 1.4 && labelText === '1.40') {
        console.log('\n--- ALL VERIFICATIONS PASSED: Velocity Calibration UI operates flawlessly! ---');
    } else {
        throw new Error('Calibration UI test failed!');
    }
}

testVelocityCalibrationUI().catch(console.error);
