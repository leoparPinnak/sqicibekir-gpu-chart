import { chromium } from 'playwright';

async function checkConsoleErrors() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err));

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const hasAddInd = await page.evaluate(() => typeof window.addIndicator);
    console.log('typeof window.addIndicator:', hasAddInd);

    await browser.close();
}

checkConsoleErrors().catch(console.error);
