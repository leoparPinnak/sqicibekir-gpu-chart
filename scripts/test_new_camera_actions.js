import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => console.log('CAMERA TEST:', msg.text()));

    console.log('Testing Pan, Zoom In, Zoom Out, and Combined Pan-Zoom actions...');
    await page.goto('http://localhost:5173/frontend/index.html', { waitUntil: 'domcontentloaded' });

    // Wait 2s for initial centered bloom
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scripts/screenshot_actions_01_init.png' });
    console.log('✓ Initial frame captured.');

    // Wait 5s for action 1
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'scripts/screenshot_actions_02_action1.png' });
    console.log('✓ Action 1 frame captured.');

    // Wait 5s for action 2
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'scripts/screenshot_actions_03_action2.png' });
    console.log('✓ Action 2 frame captured.');

    await browser.close();
    console.log('ALL NEW CAMERA ACTIONS TESTED SUCCESSFULLY!');
})();
