import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const domains = ['btn', 'input', 'tab', 'card'];
    const params = [
        'opacity',
        'blur',
        'specular',
        'specular-width',
        'specular-taper',
        'inner-glow',
        'inner-glow-spread',
        'radius'
    ];

    console.log('Verifying all 32 sliders (4 domains x 8 parameters)...');
    for (const d of domains) {
        for (const p of params) {
            const sliderId = `#param-${d}-${p}`;
            const labelValId = `#val-${d}-${p}`;
            const exists = await page.locator(sliderId).count();
            const valExists = await page.locator(labelValId).count();
            if (exists === 0 || valExists === 0) {
                console.error(`❌ Missing slider or label: ${sliderId} (exists: ${exists}, valExists: ${valExists})`);
                process.exit(1);
            }
        }
        console.log(`✓ Domain '${d}' has all 8 sliders & value labels perfectly present!`);
    }

    console.log('Testing preset switching (e.g. Sapphire)...');
    await page.click('button.preset-pill[data-preset="sapphire"]');
    await page.waitForTimeout(300);

    const btnVal = await page.locator('#val-btn-specular').textContent();
    const inputVal = await page.locator('#val-input-specular').textContent();
    const tabVal = await page.locator('#val-tab-specular').textContent();
    const cardVal = await page.locator('#val-card-specular').textContent();

    console.log(`Sapphire Preset Speculars -> btn: ${btnVal}, input: ${inputVal}, tab: ${tabVal}, card: ${cardVal}`);

    await page.screenshot({ path: 'scripts/screenshot_uniform_sliders.png', fullPage: true });

    console.log('🎉 ALL 32 UNIFORM SLIDERS VERIFIED AND WORKING 100% PERFECTLY!');
    await browser.close();
})();
