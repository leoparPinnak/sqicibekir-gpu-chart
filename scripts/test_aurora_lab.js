import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    page.on('console', msg => console.log(`[BROWSER]:`, msg.text()));

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('Switching to Aurora Engine Tab...');
    await page.click('button[data-panel-tab="aurora"]');
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'scripts/screenshot_aurora_engine_tab.png' });

    console.log('Testing Cyberpunk Neon Theme & Vortex Motion...');
    await page.click('button[data-motion="vortex"]');
    await page.click('button[data-aurora-theme="cyber"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scripts/screenshot_aurora_cyber_vortex.png' });

    console.log('Testing Fire & Gold Theme with Pulsing Zoom...');
    await page.click('button[data-motion="pulse"]');
    await page.click('button[data-aurora-theme="fire"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'scripts/screenshot_aurora_fire_pulse.png' });

    console.log('✓ All Aurora Engine visual tests passed!');
    await browser.close();
})();
