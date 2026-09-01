import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    console.log('Filling note and description directly next to Live CSS code box in Tab 1...');
    await page.fill('#save-preset-name-input', 'VisionOS Mavi Giriş Kapsülü');
    await page.fill('#save-preset-desc-input', 'Canlı CSS kutusunun hemen yanından girilen özel açıklama: %80 ipeksi elmas parıltısı ve 20px blur.');

    console.log('Clicking 🍪 Çerezlere & JSON Kaydet...');
    await page.click('#save-json-btn');
    await page.waitForTimeout(500);

    const cookies = await page.context().cookies();
    const seqCookie = cookies.find(c => c.name === 'liquid_glass_seq_num');
    const presetsCookie = cookies.find(c => c.name === 'liquid_glass_presets_cookie');

    console.log('Found Cookies:', {
        seqCookie: seqCookie ? seqCookie.value : 'missing',
        presetsCookieFound: !!presetsCookie
    });

    console.log('Taking screenshot of integrated Live CSS + Note & Cookie Save interface...');
    await page.screenshot({ path: 'scripts/screenshot_inline_css_cookie_save.png' });

    console.log('✓ Visual test completed!');
    await browser.close();
})();
