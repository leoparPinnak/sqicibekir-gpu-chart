import { chromium } from 'playwright';

async function debugGL() {
    const browser = await chromium.launch({
        headless: true,
        args: ['--enable-webgl', '--enable-gpu', '--ignore-gpu-blocklist', '--use-gl=angle']
    });
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const state = await page.evaluate(() => {
        return {
            totalCandles: window.totalCandles || (typeof totalCandles !== 'undefined' ? totalCandles : null),
            isGpuActive: window.isGpuActive || (typeof isGpuActive !== 'undefined' ? isGpuActive : null),
            viewStart: typeof viewStart !== 'undefined' ? viewStart : null,
            viewEnd: typeof viewEnd !== 'undefined' ? viewEnd : null,
            smoothMinPrice: typeof smoothMinPrice !== 'undefined' ? smoothMinPrice : null,
            smoothMaxPrice: typeof smoothMaxPrice !== 'undefined' ? smoothMaxPrice : null,
            canvasW: document.getElementById('glcanvas') ? document.getElementById('glcanvas').width : null,
            canvasH: document.getElementById('glcanvas') ? document.getElementById('glcanvas').height : null,
            canvasStyleDisplay: document.getElementById('glcanvas') ? document.getElementById('glcanvas').style.display : null
        };
    });

    console.log('GL State:', state);

    await browser.close();
}

debugGL().catch(console.error);
