import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('Switching to Aurora Engine Tab...');
    await page.click('button[data-panel-tab="aurora"]');
    await page.waitForTimeout(400);

    console.log('Testing Galaxy Spiral Mode with Screen Center...');
    await page.click('button[data-motion="galaxy"]');
    await page.click('button[data-pivot="center"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scripts/screenshot_galaxy_spiral_center.png' });

    console.log('Testing Galaxy Spiral Mode Behind Showcase Card...');
    await page.click('button[data-pivot="card"]');
    await page.click('button[data-aurora-theme="cyber"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scripts/screenshot_galaxy_spiral_card.png' });

    console.log('✓ Galaxy Spiral visual tests completed successfully!');
    await browser.close();
})();
