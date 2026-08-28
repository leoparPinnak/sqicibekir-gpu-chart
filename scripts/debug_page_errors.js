import { chromium } from 'playwright';

async function debugPageErrors() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    await browser.close();
}

debugPageErrors().catch(console.error);
