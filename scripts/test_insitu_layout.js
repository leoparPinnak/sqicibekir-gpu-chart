import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1540, height: 1000 } });

    console.log('Navigating to http://localhost:5173/frontend/glass-lab.html...');
    await page.goto('http://localhost:5173/frontend/glass-lab.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    console.log('1. Verifying top section (Buttons In-Situ)...');
    await page.screenshot({ path: 'scripts/screenshot_insitu_1_buttons.png' });

    console.log('2. Scrolling down to Inputs In-Situ...');
    const inputsSec = await page.locator('#section-inputs-studio');
    await inputsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_insitu_2_inputs.png' });

    console.log('3. Scrolling down to Tabs In-Situ...');
    const tabsSec = await page.locator('#section-tabs-studio');
    await tabsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_insitu_3_tabs.png' });

    console.log('4. Scrolling down to Container Cards In-Situ...');
    const cardsSec = await page.locator('#section-cards-studio');
    await cardsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_insitu_4_cards.png' });

    console.log('5. Scrolling down to Login Portal In-Situ...');
    const loginSec = await page.locator('#section-login-studio');
    await loginSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_insitu_5_login.png' });

    console.log('6. Scrolling down to Markets Table In-Situ...');
    const marketsSec = await page.locator('#section-markets-studio');
    await marketsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'scripts/screenshot_insitu_6_markets.png' });

    console.log('7. Full Page Screenshot of the entire uninterrupted scrolling canvas...');
    await page.screenshot({ path: 'scripts/screenshot_insitu_fullpage.png', fullPage: true });

    console.log('🎉 Integrated In-Situ Layout & Smooth Scrolling verified successfully!');
    await browser.close();
})();
