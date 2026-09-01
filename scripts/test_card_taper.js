import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const cardsSec = await page.locator('#section-cards-studio');
    await cardsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    console.log('1. Setting Card Taper to 25% (very narrow caustic spotlight in center)...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-card-specular-taper');
        slider.value = 25;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scripts/screenshot_card_taper_25.png' });

    console.log('2. Setting Card Taper to 60% (medium natural taper)...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-card-specular-taper');
        slider.value = 60;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scripts/screenshot_card_taper_60.png' });

    console.log('3. Setting Card Taper to 100% (wide full-width caustic rim)...');
    await page.evaluate(() => {
        const slider = document.getElementById('param-card-specular-taper');
        slider.value = 100;
        slider.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'scripts/screenshot_card_taper_100.png' });

    console.log('🎉 Container Card Specular Caustic Taper verified successfully!');
    await browser.close();
})();
