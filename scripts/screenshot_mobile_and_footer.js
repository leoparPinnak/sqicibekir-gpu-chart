import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });

    // 1. Desktop Test
    const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log('1. Capturing Desktop Footer View...');
    await pageDesktop.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await pageDesktop.waitForTimeout(2000);
    await pageDesktop.screenshot({ path: 'scripts/screenshot_footer_clean.png' });
    console.log('✓ Desktop footer screenshot captured.');

    // 2. Mobile Test (iPhone / Phone viewport 390x844)
    const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    console.log('2. Capturing Mobile Device Restriction Overlay...');
    await pageMobile.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });
    await pageMobile.waitForTimeout(1000);
    await pageMobile.screenshot({ path: 'scripts/screenshot_mobile_warning.png' });
    console.log('✓ Mobile warning screenshot captured.');

    await browser.close();
    console.log('TEST COMPLETE!');
})();
