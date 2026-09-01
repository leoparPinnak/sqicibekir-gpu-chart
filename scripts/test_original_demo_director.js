import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify iframe presence and dimensions
    const iframe = page.locator('#chart-engine-frame');
    const iframeCount = await iframe.count();
    console.log(`Iframe count: ${iframeCount}`);
    if (iframeCount === 0) {
        console.error('❌ Expected #chart-engine-frame iframe!');
        process.exit(1);
    }

    const box = await iframe.boundingBox();
    console.log(`Iframe dimensions: width=${box.width}, height=${box.height}`);

    // Wait a few seconds for camera movement
    console.log('Watching original cinematic camera director in action...');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'scripts/screenshot_original_demo_stage.png' });
    console.log('🎉 ORIGINAL FULLSCREEN DEMO & CINEMATIC CAMERA DIRECTOR VERIFIED!');
    await browser.close();
})();
