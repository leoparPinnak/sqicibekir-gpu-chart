import { chromium } from 'playwright';

async function checkVars() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    const info = await page.evaluate(() => ({
        viewStart: window.viewStart,
        viewEnd: window.viewEnd,
        minPrice: window.minPrice,
        maxPrice: window.maxPrice,
        smoothMinPrice: window.smoothMinPrice,
        smoothMaxPrice: window.smoothMaxPrice,
        isAutoPriceScale: window.isAutoPriceScale
    }));
    console.log('Runtime info after 3s:', info);

    await browser.close();
}

checkVars().catch(console.error);
