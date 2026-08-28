import { chromium } from 'playwright';

async function testRebranding() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    const title = await page.title();
    const badgeText = await page.locator('.indicator-badge').innerText();

    console.log('Page Title:', title);
    console.log('Navbar Badge Text:', badgeText);

    await browser.close();
}

testRebranding().catch(console.error);
