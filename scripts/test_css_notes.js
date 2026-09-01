import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('Switching to JSON & CSS Save Tab...');
    await page.click('button[data-panel-tab="saved"]');
    await page.waitForTimeout(300);

    console.log('Filling custom preset title and description notes...');
    await page.fill('#save-preset-name-input', 'Apple VisionOS Translucent Sapphire');
    await page.fill('#save-preset-desc-input', 'Giriş ekranı butonları için %80 ipeksi elmas parıltısı ve derin cam bluru içeren özel stil.');
    
    console.log('Saving as CSS file...');
    await page.click('#save-css-file-btn');
    await page.waitForTimeout(400);

    console.log('Saving a 2nd preset with description...');
    await page.fill('#save-preset-name-input', 'Cyberpunk Neon Matrix');
    await page.fill('#save-preset-desc-input', 'Mor ve siyan neon ışık kırılması, arama ve şifre kapsülleri için ideal.');
    await page.click('#save-json-btn');
    await page.waitForTimeout(400);

    await page.screenshot({ path: 'scripts/screenshot_css_notes_save.png' });
    console.log('✓ Captured CSS & Description Save screenshot!');

    await browser.close();
})();
