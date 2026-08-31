import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Inspecting Uniswap rendering pipeline...');
    await page.goto('https://app.uniswap.org/?intro=true', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const renderInfo = await page.evaluate(() => {
        // 1. Check for Canvas elements
        const canvases = Array.from(document.querySelectorAll('canvas')).map(c => {
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            const ctx2d = c.getContext('2d');
            return {
                id: c.id,
                className: c.className,
                width: c.width,
                height: c.height,
                isWebGL: !!gl,
                is2D: !!ctx2d
            };
        });

        // 2. Check for SVGs and DOM animated background orbs
        const svgs = document.querySelectorAll('svg').length;
        const allDivs = Array.from(document.querySelectorAll('div, span, img'));
        
        // Find background floating orbs
        const floatingElements = allDivs.filter(el => {
            const cs = window.getComputedStyle(el);
            return cs.filter.includes('blur') || cs.backgroundImage.includes('gradient') || cs.position === 'absolute' || cs.position === 'fixed';
        }).map(el => ({
            tagName: el.tagName,
            className: el.className,
            filter: window.getComputedStyle(el).filter,
            transform: window.getComputedStyle(el).transform,
            background: window.getComputedStyle(el).backgroundImage.slice(0, 100)
        }));

        return {
            canvasCount: canvases.length,
            canvases,
            svgCount: svgs,
            floatingElementsCount: floatingElements.length,
            floatingSamples: floatingElements.slice(0, 10)
        };
    });

    console.log('Uniswap Render Info:', JSON.stringify(renderInfo, null, 2));

    await browser.close();
})();
