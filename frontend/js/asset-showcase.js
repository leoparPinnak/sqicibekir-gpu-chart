/**
 * 🌟 ASSET SHOWCASE DIRECTOR (ROTATING MULTI-MARKET LOGO & ASSET SHOWCASE)
 * Cycles through top crypto, BIST, US stocks, and forex commodities with GPU pre-warmed original logos.
 */

import './logo-preloader.js';

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
        logoUrl: './assets/logos/btc.png'
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
        logoUrl: './assets/logos/thyao.png'
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
        logoUrl: './assets/logos/nvda.png'
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
        logoUrl: './assets/logos/eth.png'
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
        logoUrl: './assets/logos/xauusd.svg'
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
        logoUrl: './assets/logos/aapl.png'
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
        logoUrl: './assets/logos/asels.png'
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
        logoUrl: './assets/logos/sol.png'
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
                        <img src="${asset.logoUrl}" alt="${asset.name}" width="26" height="26" loading="eager" decoding="async" style="border-radius: 50%; object-fit: contain;">
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
