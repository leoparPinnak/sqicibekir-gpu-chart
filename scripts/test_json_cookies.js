import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('Switching to JSON Kayıt Tab...');
    await page.click('button[data-panel-tab="saved"]');
    await page.waitForTimeout(300);

    console.log('Filling custom preset name and saving #1...');
    await page.fill('#save-preset-name-input', 'Safir VisionOS Galaksi');
    await page.click('#save-json-btn');
    await page.waitForTimeout(400);

    console.log('Saving #2 with Cyberpunk theme...');
    await page.fill('#save-preset-name-input', 'Cyberpunk Neon Girdap');
    await page.click('#save-json-btn');
    await page.waitForTimeout(400);

    // Read cookies
    const cookies = await page.context().cookies();
    const seqCookie = cookies.find(c => c.name === 'liquid_glass_seq_num');
    console.log('Cookie value for liquid_glass_seq_num:', seqCookie ? seqCookie.value : 'None');

    await page.screenshot({ path: 'scripts/screenshot_json_saved_tab.png' });
    console.log('✓ Captured JSON Saved Tab screenshot!');

    await browser.close();
})();
