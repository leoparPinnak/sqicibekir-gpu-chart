/**
 * 🌟 ASSET SHOWCASE DIRECTOR (ROTATING MULTI-MARKET LOGO & ASSET SHOWCASE)
 * Cycles through top crypto, BIST, US stocks, and forex commodities with SVG logos,
 * live price tickers, and liquid morph animations.
 */

export const SHOWCASE_ASSETS = [
    {
        id: 'BTCUSDT',
        symbol: 'BTC / USDT',
        name: 'Bitcoin',
        category: 'Kripto',
        exchange: 'Binance Spot',
        price: '$78,650.00',
        change: '+3.42%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#btc-grad)"/>
            <path d="M21.2 13.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.3-.3l.7-2.7-1.7-.4-.7 2.7c-.4-.1-.7-.2-1.1-.2l-2.3-.6-.5 1.8s1.2.3 1.2.3c.7.2.8.6.8.9l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.1 4.5c-.1.2-.3.6-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.3.3l-.7 2.7 1.7.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.4c-.5 2-3.9.9-5 .6l.9-3.6c1.1.3 4.6.8 4.1 3zm.5-5.5c-.5 1.8-3.3.9-4.3.6l.8-3.2c1 .3 3.9.8 3.5 2.6z" fill="#ffffff"/>
            <defs>
                <linearGradient id="btc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59e0b"/>
                    <stop offset="100%" stop-color="#d97706"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'THYAO',
        symbol: 'THYAO',
        name: 'Türk Hava Yolları',
        category: 'BIST 100',
        exchange: 'Borsa İstanbul',
        price: '₺312.50',
        change: '+2.15%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#thy-grad)"/>
            <path d="M7 17.5c2.5-3.5 7.5-6.5 12-7l-8 4.5 13-1.5c-4 3.5-9 6-13.5 6.5l8-2.5-11.5 0z" fill="#ffffff"/>
            <defs>
                <linearGradient id="thy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ef4444"/>
                    <stop offset="100%" stop-color="#991b1b"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'NVDA',
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        category: 'NASDAQ',
        exchange: 'NASDAQ',
        price: '$128.40',
        change: '+4.80%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#nvda-grad)"/>
            <path d="M11 11c3.5-3 8.5-2 11 1-2.5 3-7 4-11 2v4c5.5 1.5 11.5-.5 14-4.5-3.5-5-10.5-5.5-15-1.5v-1zm0 7.5c2.5-1.5 5.5-1 7.5.5-1.5 1.5-4 2-7.5 1v-1.5z" fill="#ffffff"/>
            <defs>
                <linearGradient id="nvda-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#10b981"/>
                    <stop offset="100%" stop-color="#047857"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'ETHUSDT',
        symbol: 'ETH / USDT',
        name: 'Ethereum',
        category: 'Kripto',
        exchange: 'Binance Spot',
        price: '$3,145.20',
        change: '+1.90%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#eth-grad)"/>
            <path d="M16 6l-6.5 10.8L16 20.7l6.5-3.9L16 6zm0 15.8l-6.5-3.8L16 26l6.5-8-6.5 3.8z" fill="#ffffff"/>
            <defs>
                <linearGradient id="eth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#3b82f6"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'XAUUSD',
        symbol: 'XAU / USD',
        name: 'Ons Altın Spot',
        category: 'Emtia & FX',
        exchange: 'Emtia & FX',
        price: '$2,648.80',
        change: '+0.75%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#gold-grad)"/>
            <path d="M8 12h16l-2 9H10l-2-9zm3 2l.8 5h8.4l.8-5h-10zm2.5 1h5v1.5h-5V15zm0 2h5v1h-5v-1z" fill="#ffffff"/>
            <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fbbf24"/>
                    <stop offset="100%" stop-color="#b45309"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'AAPL',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        category: 'NASDAQ',
        exchange: 'NASDAQ',
        price: '$228.60',
        change: '+1.12%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#apple-grad)"/>
            <path d="M19.8 16.7c0-2.3 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.8 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.3 1.1 0 1.6-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.2-.8-2.2-3.8zm-2.2-6.5c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3z" fill="#ffffff"/>
            <defs>
                <linearGradient id="apple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#94a3b8"/>
                    <stop offset="100%" stop-color="#475569"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'ASELS',
        symbol: 'ASELS',
        name: 'Aselsan Elektronik',
        category: 'BIST 100',
        exchange: 'Borsa İstanbul',
        price: '₺62.40',
        change: '+3.10%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#asels-grad)"/>
            <path d="M16 6l3 7h6l-5 4 2 7-6-4.5L10 24l2-7-5-4h6l3-7z" fill="#ffffff"/>
            <defs>
                <linearGradient id="asels-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0284c7"/>
                    <stop offset="100%" stop-color="#0369a1"/>
                </linearGradient>
            </defs>
        </svg>`
    },
    {
        id: 'SOLUSDT',
        symbol: 'SOL / USDT',
        name: 'Solana',
        category: 'Kripto',
        exchange: 'Binance Spot',
        price: '$188.50',
        change: '+5.60%',
        isPositive: true,
        logoSvg: `<svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="16" fill="url(#sol-grad)"/>
            <path d="M8.5 21.5l2-2h13l-2 2h-13zm0-5.5l2-2h13l-2 2h-13zm0-5.5l2-2h13l-2 2h-13z" fill="#ffffff"/>
            <defs>
                <linearGradient id="sol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ec4899"/>
                    <stop offset="100%" stop-color="#06b6d4"/>
                </linearGradient>
            </defs>
        </svg>`
    }
];

export class AssetShowcaseDirector {
    constructor(containerEl) {
        this.container = containerEl;
        this.currentIndex = 0;
        this.intervalTimer = null;
        this.isHovered = false;
        this.onAssetSelectCallback = null;
    }

    start(intervalMs = 2800) {
        if (!this.container) return;
        this.renderCurrentAsset(false);

        if (this.intervalTimer) clearInterval(this.intervalTimer);
        this.intervalTimer = setInterval(() => {
            if (!this.isHovered) {
                this.nextAsset();
            }
        }, intervalMs);

        this.container.addEventListener('mouseenter', () => this.isHovered = true);
        this.container.addEventListener('mouseleave', () => this.isHovered = false);
    }

    stop() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
    }

    nextAsset() {
        this.currentIndex = (this.currentIndex + 1) % SHOWCASE_ASSETS.length;
        this.renderCurrentAsset(true);
    }

    getCurrentAsset() {
        return SHOWCASE_ASSETS[this.currentIndex];
    }

    renderCurrentAsset(animate = true) {
        const asset = SHOWCASE_ASSETS[this.currentIndex];
        if (!this.container) return;

        const html = `
            <div class="showcase-content-wrap ${animate ? 'morph-in' : ''}">
                <div class="showcase-left-cluster">
                    <div class="showcase-logo-box">
                        ${asset.logoSvg}
                    </div>
                    <div class="showcase-meta-cluster">
                        <div class="showcase-symbol-line">
                            <span class="showcase-ticker">${asset.symbol}</span>
                            <span class="showcase-price-tag">${asset.price}</span>
                        </div>
                        <div class="showcase-subline">
                            <span class="showcase-asset-name">${asset.name}</span>
                            <span class="showcase-bullet">•</span>
                            <span class="showcase-change ${asset.isPositive ? 'up' : 'down'}">${asset.change}</span>
                        </div>
                    </div>
                </div>

                <div class="portal-market-pill" onclick="launchTerminal(); return false;">
                    <span>${asset.exchange}</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        if (typeof this.onAssetSelectCallback === 'function') {
            this.onAssetSelectCallback(asset);
        }
    }
}
