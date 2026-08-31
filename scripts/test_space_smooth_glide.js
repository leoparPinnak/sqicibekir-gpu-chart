import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173/indikator_sablonu.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const canvasBox = await page.locator('#glcanvas').boundingBox();
    const cx = canvasBox.x + canvasBox.width / 2;
    const cy = canvasBox.y + canvasBox.height / 2;

    // 1. Drag chart far away to disrupt position
    console.log('Dragging chart to offset position...');
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 300, cy - 150, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_space_01_offset.png' });

    // 2. Press Space to trigger smooth auto-fit glide
    console.log('Pressing Space key for smooth 120 FPS glide...');
    await page.keyboard.press('Space');
    
    // Capture mid-glide frame (100ms into animation)
    await page.waitForTimeout(100);
    await page.screenshot({ path: 'scripts/screenshot_space_02_mid_glide.png' });
    
    // Capture final settled frame (400ms after Space)
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_space_03_settled.png' });
    console.log('Space smooth glide completed successfully!');

    await browser.close();
})();
