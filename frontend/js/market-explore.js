/**
 * 📊 UNISWAP V4 STYLE MARKET EXPLORE DIRECTOR
 * Renders interactive stock, crypto, US market, and forex tables with live search,
 * category tabs, SVG sparkline trend graphs, and direct terminal launching.
 */

export const POPULAR_MARKET_ASSETS = [
    // BIST 100
    { id: 'THYAO', symbol: 'THYAO', name: 'Türk Hava Yolları A.O.', category: 'bist', exchange: 'BIST', price: '₺312.50', priceNum: 312.50, change: '+3.42%', isPositive: true, volume: '₺5.84 Milyar', color: '#ef4444', sparkline: [40, 42, 41, 45, 48, 47, 52] },
    { id: 'ASELS', symbol: 'ASELS', name: 'Aselsan Elektronik Sanayi', category: 'bist', exchange: 'BIST', price: '₺62.40', priceNum: 62.40, change: '+4.18%', isPositive: true, volume: '₺3.20 Milyar', color: '#0284c7', sparkline: [20, 22, 21, 24, 23, 26, 28] },
    { id: 'EREGL', symbol: 'EREGL', name: 'Ereğli Demir ve Çelik', category: 'bist', exchange: 'BIST', price: '₺48.90', priceNum: 48.90, change: '-0.85%', isPositive: false, volume: '₺2.15 Milyar', color: '#f59e0b', sparkline: [35, 34, 36, 33, 34, 32, 31] },
    { id: 'GARAN', symbol: 'GARAN', name: 'Türkiye Garanti Bankası', category: 'bist', exchange: 'BIST', price: '₺118.60', priceNum: 118.60, change: '+2.45%', isPositive: true, volume: '₺4.10 Milyar', color: '#10b981', sparkline: [60, 62, 61, 65, 68, 70, 74] },
    { id: 'TUPRS', symbol: 'TUPRS', name: 'Tüpraş Türkiye Petrol Rafinerileri', category: 'bist', exchange: 'BIST', price: '₺165.20', priceNum: 165.20, change: '+1.90%', isPositive: true, volume: '₺3.75 Milyar', color: '#6366f1', sparkline: [50, 51, 49, 53, 54, 52, 56] },
    { id: 'BIMAS', symbol: 'BIMAS', name: 'BİM Birleşik Mağazalar', category: 'bist', exchange: 'BIST', price: '₺486.00', priceNum: 486.00, change: '+0.75%', isPositive: true, volume: '₺1.90 Milyar', color: '#3b82f6', sparkline: [40, 41, 42, 41, 43, 44, 45] },
    { id: 'KCHOL', symbol: 'KCHOL', name: 'Koç Holding A.Ş.', category: 'bist', exchange: 'BIST', price: '₺216.00', priceNum: 216.00, change: '+1.60%', isPositive: true, volume: '₺2.40 Milyar', color: '#a855f7', sparkline: [30, 31, 33, 32, 34, 35, 37] },
    { id: 'SISE', symbol: 'SISE', name: 'Şişecam Fabrikaları', category: 'bist', exchange: 'BIST', price: '₺46.90', priceNum: 46.90, change: '+1.10%', isPositive: true, volume: '₺1.65 Milyar', color: '#06b6d4', sparkline: [25, 26, 25, 27, 26, 28, 29] },

    // ABD HİSSELERİ (NASDAQ / NYSE)
    { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'stocks', exchange: 'NASDAQ', price: '$128.40', priceNum: 128.40, change: '+5.60%', isPositive: true, volume: '$48.2 Milyar', color: '#10b981', sparkline: [50, 53, 52, 58, 62, 60, 68] },
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', exchange: 'NASDAQ', price: '$228.60', priceNum: 228.60, change: '+1.35%', isPositive: true, volume: '$32.1 Milyar', color: '#94a3b8', sparkline: [70, 71, 70, 73, 72, 75, 76] },
    { id: 'TSLA', symbol: 'TSLA', name: 'Tesla Motors Inc.', category: 'stocks', exchange: 'NASDAQ', price: '$242.30', priceNum: 242.30, change: '+4.20%', isPositive: true, volume: '$28.4 Milyar', color: '#ef4444', sparkline: [45, 48, 46, 52, 55, 53, 60] },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft Corporation', category: 'stocks', exchange: 'NASDAQ', price: '$448.50', priceNum: 448.50, change: '+1.10%', isPositive: true, volume: '$22.5 Milyar', color: '#0284c7', sparkline: [65, 66, 68, 67, 69, 70, 72] },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', category: 'stocks', exchange: 'NASDAQ', price: '$182.20', priceNum: 182.20, change: '-0.45%', isPositive: false, volume: '$18.9 Milyar', color: '#f59e0b', sparkline: [50, 52, 51, 49, 50, 48, 47] },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', exchange: 'NASDAQ', price: '$186.40', priceNum: 186.40, change: '+2.05%', isPositive: true, volume: '$21.3 Milyar', color: '#f97316', sparkline: [40, 41, 43, 42, 45, 46, 48] },

    // KRİPTO (BINANCE SPOT)
    { id: 'BTCUSDT', symbol: 'BTC / USDT', name: 'Bitcoin', category: 'crypto', exchange: 'Binance', price: '$78,650.00', priceNum: 78650, change: '+3.42%', isPositive: true, volume: '$42.5 Milyar', color: '#f59e0b', sparkline: [60, 63, 62, 68, 72, 70, 78] },
    { id: 'ETHUSDT', symbol: 'ETH / USDT', name: 'Ethereum', category: 'crypto', exchange: 'Binance', price: '$3,145.20', priceNum: 3145.2, change: '+2.80%', isPositive: true, volume: '$24.8 Milyar', color: '#6366f1', sparkline: [45, 47, 46, 50, 53, 51, 56] },
    { id: 'SOLUSDT', symbol: 'SOL / USDT', name: 'Solana', category: 'crypto', exchange: 'Binance', price: '$188.50', priceNum: 188.5, change: '+6.15%', isPositive: true, volume: '$12.4 Milyar', color: '#ec4899', sparkline: [30, 34, 33, 39, 44, 42, 48] },
    { id: 'BNBUSDT', symbol: 'BNB / USDT', name: 'BNB Coin', category: 'crypto', exchange: 'Binance', price: '$585.40', priceNum: 585.4, change: '+1.45%', isPositive: true, volume: '$3.80 Milyar', color: '#eab308', sparkline: [50, 51, 50, 53, 54, 55, 56] },
    { id: 'XRPUSDT', symbol: 'XRP / USDT', name: 'Ripple', category: 'crypto', exchange: 'Binance', price: '$0.5820', priceNum: 0.582, change: '+4.90%', isPositive: true, volume: '$2.90 Milyar', color: '#38bdf8', sparkline: [20, 22, 21, 25, 27, 26, 30] },
    { id: 'AVAXUSDT', symbol: 'AVAX / USDT', name: 'Avalanche', category: 'crypto', exchange: 'Binance', price: '$28.40', priceNum: 28.4, change: '+3.75%', isPositive: true, volume: '$1.40 Milyar', color: '#ef4444', sparkline: [30, 32, 31, 35, 37, 36, 40] },

    // EMTİA & FOREX
    { id: 'XAUUSD', symbol: 'XAU / USD', name: 'Ons Altın Spot (Gold)', category: 'fx', exchange: 'Emtia & FX', price: '$2,648.80', priceNum: 2648.8, change: '+0.75%', isPositive: true, volume: '$84.5 Milyar', color: '#fbbf24', sparkline: [70, 71, 72, 71, 73, 74, 76] },
    { id: 'USDTRY', symbol: 'USD / TRY', name: 'Amerikan Doları / TL', category: 'fx', exchange: 'Forex', price: '₺34.15', priceNum: 34.15, change: '+0.12%', isPositive: true, volume: '$4.20 Milyar', color: '#10b981', sparkline: [50, 50.1, 50.2, 50.3, 50.4, 50.5, 50.6] },
    { id: 'BRENT', symbol: 'BRENT', name: 'Brent Ham Petrol', category: 'fx', exchange: 'Emtia', price: '$78.40', priceNum: 78.40, change: '-1.40%', isPositive: false, volume: '$16.2 Milyar', color: '#475569', sparkline: [55, 54, 56, 52, 53, 50, 48] }
];

export class MarketExploreDirector {
    constructor(containerEl) {
        this.container = containerEl;
        this.currentTab = 'all';
        this.searchQuery = '';
        this.sortBy = 'volume';
    }

    init() {
        if (!this.container) return;
        this.render();
    }

    setTab(tab) {
        this.currentTab = tab;
        this.render();
    }

    setSearch(query) {
        this.searchQuery = (query || '').toLowerCase().trim();
        this.render();
    }

    getFilteredAssets() {
        return POPULAR_MARKET_ASSETS.filter(item => {
            const matchesTab = this.currentTab === 'all' || item.category === this.currentTab;
            const matchesSearch = !this.searchQuery || 
                item.symbol.toLowerCase().includes(this.searchQuery) || 
                item.name.toLowerCase().includes(this.searchQuery) ||
                item.exchange.toLowerCase().includes(this.searchQuery);
            return matchesTab && matchesSearch;
        });
    }

    generateSparklineSvg(data, isPositive, color) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const width = 110;
        const height = 32;

        const points = data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * (height - 8) - 4;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        const strokeColor = isPositive ? '#10b981' : '#ef4444';
        const fillId = `spark-grad-${Math.random().toString(36).substring(2, 7)}`;

        return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="explore-sparkline">
                <defs>
                    <linearGradient id="${fillId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.30"/>
                        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                <polygon points="0,${height} ${points} ${width},${height}" fill="url(#${fillId})"/>
                <polyline points="${points}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }

    render() {
        if (!this.container) return;
        const filtered = this.getFilteredAssets();

        const html = `
            <div class="explore-wrapper">
                
                <!-- BAŞLIK VE KATEGORİ SEKMELERİ -->
                <div class="explore-header-row">
                    <div>
                        <h2 class="explore-section-title">Piyasaları Keşfedin</h2>
                        <p class="explore-section-subtitle">Borsa İstanbul, ABD Hisseleri, Kripto Para ve Emtia piyasalarında anlık canlı grafikler ve hacimler.</p>
                    </div>

                    <!-- CANLI ARAMA KUTUSU -->
                    <div class="explore-search-box">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" placeholder="Sembol veya şirket ara (THYAO, NVDA, BTC...)" id="explore-search-input" value="${this.searchQuery}" oninput="window.__exploreDirector.setSearch(this.value)" autocomplete="off">
                    </div>
                </div>

                <!-- TABS BAR (UNISWAP STYLE) -->
                <div class="explore-tabs-bar">
                    <button class="explore-tab-btn ${this.currentTab === 'all' ? 'active' : ''}" onclick="window.__exploreDirector.setTab('all')">Tüm Piyasalar</button>
                    <button class="explore-tab-btn ${this.currentTab === 'bist' ? 'active' : ''}" onclick="window.__exploreDirector.setTab('bist')">Borsa İstanbul (BIST)</button>
                    <button class="explore-tab-btn ${this.currentTab === 'stocks' ? 'active' : ''}" onclick="window.__exploreDirector.setTab('stocks')">ABD Hisseleri (NASDAQ / NYSE)</button>
                    <button class="explore-tab-btn ${this.currentTab === 'crypto' ? 'active' : ''}" onclick="window.__exploreDirector.setTab('crypto')">Kripto Paralar (Binance)</button>
                    <button class="explore-tab-btn ${this.currentTab === 'fx' ? 'active' : ''}" onclick="window.__exploreDirector.setTab('fx')">Emtia & Forex</button>
                </div>

                <!-- TABLO KARTI (APPLE LIQUID GLASS TABLE) -->
                <div class="explore-table-card">
                    <table class="explore-table">
                        <thead>
                            <tr>
                                <th style="width: 40px; text-align: center;">#</th>
                                <th>Varlık / Şirket</th>
                                <th style="text-align: right;">Fiyat</th>
                                <th style="text-align: right;">24s Değişim</th>
                                <th style="text-align: right;">24s Hacim</th>
                                <th style="text-align: center; width: 140px;">7 Günlük Trend</th>
                                <th style="text-align: right; width: 130px;">Grafik</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map((item, idx) => `
                                <tr class="explore-table-row" onclick="launchTerminal();">
                                    <td style="text-align: center; color: #64748b; font-size: 13px; font-weight: 600;">${idx + 1}</td>
                                    <td>
                                        <div class="explore-asset-cell">
                                            <div class="explore-asset-icon" style="background: linear-gradient(135deg, ${item.color}33, ${item.color}11); border-color: ${item.color}55;">
                                                <span style="font-weight: 800; font-size: 11px; color: #ffffff;">${item.symbol.substring(0, 3)}</span>
                                            </div>
                                            <div class="explore-asset-meta">
                                                <div class="explore-asset-symbol">${item.symbol}</div>
                                                <div class="explore-asset-name">${item.name} · <span class="explore-exchange-tag">${item.exchange}</span></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="text-align: right; font-weight: 700; color: #ffffff; font-family: monospace; font-size: 14px;">
                                        ${item.price}
                                    </td>
                                    <td style="text-align: right;">
                                        <span class="explore-change-badge ${item.isPositive ? 'positive' : 'negative'}">
                                            ${item.isPositive ? '▲' : '▼'} ${item.change}
                                        </span>
                                    </td>
                                    <td style="text-align: right; color: #94a3b8; font-size: 13.5px; font-weight: 600;">
                                        ${item.volume}
                                    </td>
                                    <td style="text-align: center;">
                                        ${this.generateSparklineSvg(item.sparkline, item.isPositive, item.color)}
                                    </td>
                                    <td style="text-align: right;">
                                        <button class="explore-action-btn" onclick="launchTerminal(); event.stopPropagation();">
                                            <span>İncele</span>
                                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    ${filtered.length === 0 ? `
                        <div class="explore-empty-state">
                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#64748b" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <p>Aradığınız kritere uygun varlık bulunamadı.</p>
                        </div>
                    ` : ''}
                </div>

            </div>
        `;

        this.container.innerHTML = html;
    }
}
