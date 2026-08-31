import fs from 'fs';
import https from 'https';

function fetchBinanceUsdtPairs() {
    return new Promise((resolve) => {
        const url = 'https://api.binance.com/api/v3/ticker/price';
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const usdtPairs = json.filter(item => item.symbol.endsWith('USDT') && !item.symbol.includes('UP') && !item.symbol.includes('DOWN') && !item.symbol.includes('BEAR') && !item.symbol.includes('BULL'));
                    resolve(usdtPairs);
                } catch (e) {
                    console.error('Binance fetch error:', e);
                    resolve([]);
                }
            });
        }).on('error', () => resolve([]));
    });
}

const BIST_STOCKS = [
    { id: 'THYAO', name: 'Turk Hava Yollari A.O.', basePrice: 312.50, volPct: 1.8 },
    { id: 'EREGL', name: 'Eregli Demir ve Celik Fabrikalari', basePrice: 48.90, volPct: 1.5 },
    { id: 'ASELS', name: 'Aselsan Elektronik Sanayi', basePrice: 62.40, volPct: 2.1 },
    { id: 'GARAN', name: 'Turkiye Garanti Bankasi', basePrice: 118.60, volPct: 1.9 },
    { id: 'TUPRS', name: 'TUPRAS Turkiye Petrol Rafinerileri', basePrice: 165.20, volPct: 1.6 },
    { id: 'BIMAS', name: 'BIM Birlesik Magazalar', basePrice: 486.00, volPct: 1.2 },
    { id: 'KCHOL', name: 'Koc Holding A.S.', basePrice: 216.00, volPct: 1.5 },
    { id: 'SISE', name: 'Turkiye Sise ve Cam Fabrikalari', basePrice: 46.90, volPct: 1.4 },
    { id: 'ISCTR', name: 'Turkiye Is Bankasi (C)', basePrice: 13.90, volPct: 1.7 },
    { id: 'AKBNK', name: 'Akbank T.A.S.', basePrice: 56.40, volPct: 1.8 },
    { id: 'SAHOL', name: 'Haci Omer Sabanci Holding', basePrice: 94.50, volPct: 1.6 },
    { id: 'FROTO', name: 'Ford Otomotiv Sanayi', basePrice: 985.00, volPct: 2.2 },
    { id: 'PGSUS', name: 'Pegasus Hava Tasimaciligi', basePrice: 229.50, volPct: 2.4 },
    { id: 'TOASO', name: 'Tofas Turk Otomobil Fabrikasi', basePrice: 248.00, volPct: 1.9 },
    { id: 'YKBNK', name: 'Yapi ve Kredi Bankasi', basePrice: 29.80, volPct: 2.0 },
    { id: 'TCELL', name: 'Turkcell Iletisim Hizmetleri', basePrice: 96.20, volPct: 1.6 },
    { id: 'TTKOM', name: 'Turk Telekomunikasyon', basePrice: 48.70, volPct: 1.7 },
    { id: 'ENKAI', name: 'Enka Insaat ve Sanayi', basePrice: 43.10, volPct: 1.4 },
    { id: 'PETKM', name: 'Petkim Petrokimya Holding', basePrice: 21.40, volPct: 2.3 },
    { id: 'ARCLK', name: 'Arcelik A.S.', basePrice: 164.50, volPct: 1.8 },
    { id: 'ALARK', name: 'Alarko Holding', basePrice: 103.40, volPct: 2.2 },
    { id: 'ASTOR', name: 'Astor Enerji', basePrice: 98.20, volPct: 2.8 },
    { id: 'EKGYO', name: 'Emlak Konut GYO', basePrice: 10.45, volPct: 2.1 },
    { id: 'GUBRF', name: 'Gubre Fabrikalari T.A.S.', basePrice: 168.00, volPct: 3.0 },
    { id: 'HEKTS', name: 'Hektas Ticaret T.A.S.', basePrice: 13.80, volPct: 2.9 },
    { id: 'KOZAL', name: 'Koza Altin Isletmeleri', basePrice: 22.40, volPct: 2.3 },
    { id: 'KOZAA', name: 'Koza Anadolu Metal Madencilik', basePrice: 52.80, volPct: 2.5 },
    { id: 'OYAKC', name: 'OYAK Cimento Fabrikalari', basePrice: 27.30, volPct: 2.0 },
    { id: 'VAKBN', name: 'Turkiye Vakiflar Bankasi', basePrice: 21.20, volPct: 2.1 },
    { id: 'HALKB', name: 'Turkiye Halk Bankasi', basePrice: 16.90, volPct: 2.2 },
    { id: 'KRDMD', name: 'Kardemir Karabuk Demir Celik (D)', basePrice: 26.80, volPct: 2.2 },
    { id: 'MGROS', name: 'Migros Ticaret A.S.', basePrice: 515.00, volPct: 1.7 },
    { id: 'SOKM', name: 'Sok Marketler Ticaret', basePrice: 54.20, volPct: 1.9 },
    { id: 'CIMSA', name: 'Cimsa Cimento Sanayi', basePrice: 32.50, volPct: 2.0 },
    { id: 'DOAS', name: 'Dogus Otomotiv Servis ve Ticaret', basePrice: 262.00, volPct: 2.4 },
    { id: 'TAVHL', name: 'TAV Havalimanlari Holding', basePrice: 254.00, volPct: 2.1 },
    { id: 'ULKER', name: 'Ulker Biskuvi Sanayi', basePrice: 158.00, volPct: 2.3 },
    { id: 'VESBE', name: 'Vestel Beyaz Esya Sanayi', basePrice: 20.40, volPct: 1.9 },
    { id: 'VESTL', name: 'Vestel Elektronik Sanayi', basePrice: 69.80, volPct: 2.5 },
    { id: 'ZOREN', name: 'Zorlu Enerji Elektrik Uretim', basePrice: 4.95, volPct: 2.7 },
    { id: 'CANTE', name: 'Can2 Termik A.S.', basePrice: 17.60, volPct: 2.9 },
    { id: 'CWENE', name: 'CW Enerji Muhendislik', basePrice: 235.00, volPct: 2.8 },
    { id: 'EUPWR', name: 'Europower Enerji ve Otomasyon', basePrice: 102.50, volPct: 2.9 },
    { id: 'KONTR', name: 'Kontrolmatik Teknoloji Enerji', basePrice: 52.30, volPct: 3.1 },
    { id: 'GESAN', name: 'Girisim Elektrik Sanayi', basePrice: 54.80, volPct: 2.8 },
    { id: 'SMRTG', name: 'Smart Gunes Enerjisi Teknolojileri', basePrice: 46.20, volPct: 3.0 },
    { id: 'ALFAS', name: 'Alfa Solar Enerji', basePrice: 72.50, volPct: 3.1 },
    { id: 'MIATK', name: 'Mia Teknoloji', basePrice: 48.90, volPct: 3.4 },
    { id: 'REEDR', name: 'Reeder Teknoloji Sanayi', basePrice: 36.40, volPct: 3.6 },
    { id: 'TABGD', name: 'TAB Gida Sanayi ve Ticaret', basePrice: 142.00, volPct: 2.2 },
    { id: 'SDTTR', name: 'SDT Uzay ve Savunma Teknolojileri', basePrice: 245.00, volPct: 3.3 },
    { id: 'ENJSA', name: 'Enerjisa Enerji', basePrice: 64.10, volPct: 1.7 },
    { id: 'AGHOL', name: 'AG Anadolu Grubu Holding', basePrice: 348.00, volPct: 2.1 },
    { id: 'CCOLA', name: 'Coca-Cola Icecek', basePrice: 61.20, volPct: 1.8 },
    { id: 'BRISA', name: 'Brisa Bridgestone Sabanci Lastik', basePrice: 98.40, volPct: 2.0 },
    { id: 'KORDS', name: 'Kordsa Teknik Tekstil', basePrice: 91.30, volPct: 2.1 },
    { id: 'OTKAR', name: 'Otokar Otomotiv ve Savunma', basePrice: 524.00, volPct: 2.5 },
    { id: 'TMSN', name: 'Tumosan Motor ve Traktor', basePrice: 128.00, volPct: 2.7 },
    { id: 'TTRAK', name: 'Turk Traktor ve Ziraat Makineleri', basePrice: 810.00, volPct: 2.3 },
    { id: 'BRYAT', name: 'Borusan Yatirim ve Pazarlama', basePrice: 2180.00, volPct: 3.2 },
    { id: 'BFREN', name: 'Bosch Fren Sistemleri', basePrice: 980.00, volPct: 3.4 },
    { id: 'BRSAN', name: 'Borusan Boru Sanayi', basePrice: 540.00, volPct: 3.1 },
    { id: 'BUCIM', name: 'Bursa Cimento', basePrice: 8.70, volPct: 2.0 },
    { id: 'AKSA', name: 'Aksa Akrilik Kimya Sanayii', basePrice: 104.00, volPct: 2.0 },
    { id: 'AKSEN', name: 'Aksa Enerji Uretim', basePrice: 38.40, volPct: 2.1 },
    { id: 'ALBRK', name: 'Albaraka Turk Katilim Bankasi', basePrice: 4.80, volPct: 1.9 },
    { id: 'ANSGR', name: 'Anadolu Anonim Turk Sigorta Sirketi', basePrice: 92.00, volPct: 2.2 },
    { id: 'ARDYZ', name: 'ARD Grup Bilisim Teknolojileri', basePrice: 39.50, volPct: 3.2 },
    { id: 'AYDEM', name: 'Aydem Yenilenebilir Enerji', basePrice: 28.60, volPct: 2.4 },
    { id: 'AYGAZ', name: 'Aygaz A.S.', basePrice: 154.00, volPct: 1.8 },
    { id: 'BAGFS', name: 'Bagfas Bandirma Gubre Fabrikalari', basePrice: 26.40, volPct: 2.5 },
    { id: 'BERA', name: 'Bera Holding', basePrice: 18.20, volPct: 2.2 },
    { id: 'CLEBI', name: 'Celebi Hava Servisi', basePrice: 1480.00, volPct: 2.9 },
    { id: 'DOHOL', name: 'Dogan Sirketler Grubu Holding', basePrice: 14.80, volPct: 1.9 },
    { id: 'EGEEN', name: 'Ege Endustri ve Ticaret', basePrice: 11400.00, volPct: 3.3 },
    { id: 'ECILC', name: 'Eczacibasi Ilac Sanayi', basePrice: 54.00, volPct: 2.1 },
    { id: 'ECZYT', name: 'Eczacibasi Yatirim Holding', basePrice: 242.00, volPct: 2.4 },
    { id: 'GENIL', name: 'Gen Ilac ve Saglik Urunleri', basePrice: 68.00, volPct: 2.3 },
    { id: 'GWIND', name: 'Galata Wind Enerji', basePrice: 24.90, volPct: 2.5 },
    { id: 'ISGYO', name: 'Is Gayrimenkul Yatirim Ortakligi', basePrice: 16.50, volPct: 2.1 },
    { id: 'ISMEN', name: 'Is Yatirim Menkul Degerler', basePrice: 34.20, volPct: 2.2 },
    { id: 'KAREL', name: 'Karel Elektronik Sanayi', basePrice: 13.40, volPct: 2.6 },
    { id: 'KAYSE', name: 'Kayseri Seker Fabrikasi', basePrice: 26.80, volPct: 2.7 },
    { id: 'KCAER', name: 'Kocaer Celik Sanayi', basePrice: 42.50, volPct: 2.8 },
    { id: 'KLSER', name: 'Kaleseramik Canakkale Kalebodur', basePrice: 46.80, volPct: 3.1 },
    { id: 'KMPUR', name: 'Kimteks Poliuretan Sanayi', basePrice: 38.60, volPct: 2.9 },
    { id: 'MAVI', name: 'Mavi Giyim Sanayi ve Ticaret', basePrice: 108.00, volPct: 1.8 },
    { id: 'QUAGR', name: 'Qua Granite Hayal Yapi', basePrice: 3.45, volPct: 3.2 },
    { id: 'SASA', name: 'SASA Polyester Sanayi', basePrice: 4.85, volPct: 2.6 },
    { id: 'SELEC', name: 'Selcuk Ecza Deposu Ticaret', basePrice: 62.00, volPct: 1.9 },
    { id: 'SKBNK', name: 'Sekerbank T.A.S.', basePrice: 4.10, volPct: 2.1 },
    { id: 'TSKB', name: 'Turkiye Sinai Kalkinma Bankasi', basePrice: 11.20, volPct: 2.0 },
    { id: 'TURSG', name: 'Turkiye Sigorta', basePrice: 74.50, volPct: 2.3 },
    { id: 'YEOTK', name: 'YEO Teknoloji Enerji ve Endustri', basePrice: 185.00, volPct: 3.4 },
    { id: 'XU100', name: 'BIST 100 Endeksi', basePrice: 9860.00, volPct: 1.1, type: 'ENDEKS' },
    { id: 'XU030', name: 'BIST 30 Endeksi', basePrice: 10750.00, volPct: 1.2, type: 'ENDEKS' },
    { id: 'XBANK', name: 'BIST Bankacilik Endeksi', basePrice: 14200.00, volPct: 1.9, type: 'ENDEKS' },
    { id: 'XUSIN', name: 'BIST Sinai Endeksi', basePrice: 13900.00, volPct: 1.4, type: 'ENDEKS' },
    { id: 'XUTEK', name: 'BIST Teknoloji Endeksi', basePrice: 15800.00, volPct: 2.6, type: 'ENDEKS' }
];

const US_STOCKS = [
    { id: 'AAPL', name: 'Apple Inc.', basePrice: 228.40, volPct: 1.4, exchange: 'NASDAQ' },
    { id: 'NVDA', name: 'NVIDIA Corporation', basePrice: 124.80, volPct: 3.2, exchange: 'NASDAQ' },
    { id: 'MSFT', name: 'Microsoft Corporation', basePrice: 420.50, volPct: 1.2, exchange: 'NASDAQ' },
    { id: 'AMZN', name: 'Amazon.com Inc.', basePrice: 178.20, volPct: 1.6, exchange: 'NASDAQ' },
    { id: 'GOOGL', name: 'Alphabet Inc. Class A', basePrice: 165.90, volPct: 1.5, exchange: 'NASDAQ' },
    { id: 'META', name: 'Meta Platforms, Inc.', basePrice: 512.00, volPct: 2.4, exchange: 'NASDAQ' },
    { id: 'TSLA', name: 'Tesla, Inc.', basePrice: 218.60, volPct: 3.5, exchange: 'NASDAQ' },
    { id: 'AMD', name: 'Advanced Micro Devices', basePrice: 145.30, volPct: 2.8, exchange: 'NASDAQ' },
    { id: 'AVGO', name: 'Broadcom Inc.', basePrice: 158.50, volPct: 2.5, exchange: 'NASDAQ' },
    { id: 'QCOM', name: 'QUALCOMM Incorporated', basePrice: 168.40, volPct: 2.1, exchange: 'NASDAQ' },
    { id: 'INTC', name: 'Intel Corporation', basePrice: 21.80, volPct: 3.0, exchange: 'NASDAQ' },
    { id: 'ARM', name: 'Arm Holdings plc', basePrice: 132.00, volPct: 4.1, exchange: 'NASDAQ' },
    { id: 'PLTR', name: 'Palantir Technologies', basePrice: 31.40, volPct: 3.6, exchange: 'NYSE' },
    { id: 'SMCI', name: 'Super Micro Computer', basePrice: 440.00, volPct: 5.2, exchange: 'NASDAQ' },
    { id: 'COIN', name: 'Coinbase Global, Inc.', basePrice: 195.00, volPct: 4.8, exchange: 'NASDAQ' },
    { id: 'MSTR', name: 'MicroStrategy Incorporated', basePrice: 135.00, volPct: 5.5, exchange: 'NASDAQ' },
    { id: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 222.50, volPct: 1.3, exchange: 'NYSE' },
    { id: 'V', name: 'Visa Inc.', basePrice: 272.00, volPct: 1.1, exchange: 'NYSE' },
    { id: 'MA', name: 'Mastercard Incorporated', basePrice: 485.00, volPct: 1.1, exchange: 'NYSE' },
    { id: 'LLY', name: 'Eli Lilly and Company', basePrice: 950.00, volPct: 2.0, exchange: 'NYSE' },
    { id: 'UNH', name: 'UnitedHealth Group', basePrice: 585.00, volPct: 1.2, exchange: 'NYSE' },
    { id: 'JNJ', name: 'Johnson & Johnson', basePrice: 164.00, volPct: 0.9, exchange: 'NYSE' },
    { id: 'PG', name: 'Procter & Gamble Company', basePrice: 172.00, volPct: 0.8, exchange: 'NYSE' },
    { id: 'HD', name: 'Home Depot, Inc.', basePrice: 375.00, volPct: 1.2, exchange: 'NYSE' },
    { id: 'COST', name: 'Costco Wholesale Corp.', basePrice: 885.00, volPct: 1.3, exchange: 'NASDAQ' },
    { id: 'WMT', name: 'Walmart Inc.', basePrice: 76.50, volPct: 0.9, exchange: 'NYSE' },
    { id: 'NFLX', name: 'Netflix, Inc.', basePrice: 690.00, volPct: 2.2, exchange: 'NASDAQ' },
    { id: 'ADBE', name: 'Adobe Inc.', basePrice: 560.00, volPct: 1.9, exchange: 'NASDAQ' },
    { id: 'CRM', name: 'Salesforce, Inc.', basePrice: 255.00, volPct: 1.8, exchange: 'NYSE' },
    { id: 'ORCL', name: 'Oracle Corporation', basePrice: 142.00, volPct: 1.6, exchange: 'NYSE' },
    { id: 'CSCO', name: 'Cisco Systems, Inc.', basePrice: 50.20, volPct: 1.1, exchange: 'NASDAQ' },
    { id: 'XOM', name: 'Exxon Mobil Corporation', basePrice: 116.00, volPct: 1.3, exchange: 'NYSE' },
    { id: 'CVX', name: 'Chevron Corporation', basePrice: 148.00, volPct: 1.2, exchange: 'NYSE' },
    { id: 'BAC', name: 'Bank of America Corp.', basePrice: 39.80, volPct: 1.4, exchange: 'NYSE' },
    { id: 'WFC', name: 'Wells Fargo & Company', basePrice: 56.00, volPct: 1.5, exchange: 'NYSE' },
    { id: 'MS', name: 'Morgan Stanley', basePrice: 102.00, volPct: 1.6, exchange: 'NYSE' },
    { id: 'GS', name: 'Goldman Sachs Group', basePrice: 485.00, volPct: 1.5, exchange: 'NYSE' },
    { id: 'DIS', name: 'Walt Disney Company', basePrice: 91.50, volPct: 1.7, exchange: 'NYSE' },
    { id: 'NKE', name: 'NIKE, Inc.', basePrice: 82.00, volPct: 2.0, exchange: 'NYSE' },
    { id: 'BA', name: 'Boeing Company', basePrice: 168.00, volPct: 2.3, exchange: 'NYSE' },
    { id: 'UBER', name: 'Uber Technologies, Inc.', basePrice: 72.50, volPct: 2.5, exchange: 'NYSE' },
    { id: 'ABNB', name: 'Airbnb, Inc.', basePrice: 118.00, volPct: 2.6, exchange: 'NASDAQ' },
    { id: 'SNOW', name: 'Snowflake Inc.', basePrice: 115.00, volPct: 3.4, exchange: 'NYSE' },
    { id: 'PYPL', name: 'PayPal Holdings, Inc.', basePrice: 71.00, volPct: 2.2, exchange: 'NASDAQ' },
    { id: 'SQ', name: 'Block, Inc. (Square)', basePrice: 65.00, volPct: 3.1, exchange: 'NYSE' },
    { id: 'SHOP', name: 'Shopify Inc.', basePrice: 74.00, volPct: 3.2, exchange: 'NYSE' },
    { id: 'SPY', name: 'SPDR S&P 500 ETF Trust', basePrice: 560.20, volPct: 0.8, type: 'ETF', exchange: 'NYSE Arca' },
    { id: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)', basePrice: 478.10, volPct: 1.1, type: 'ETF', exchange: 'NASDAQ' },
    { id: 'IWM', name: 'iShares Russell 2000 ETF', basePrice: 221.00, volPct: 1.5, type: 'ETF', exchange: 'NYSE Arca' },
    { id: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', basePrice: 412.00, volPct: 0.7, type: 'ETF', exchange: 'NYSE Arca' }
];

const FOREX_COMMODITIES = [
    { id: 'XAUUSD', name: 'Spot Altin / US Dollar (Ons)', basePrice: 2515.00, volPct: 0.9, type: 'EMTIA', exchange: 'COMEX / FX', currency: '$' },
    { id: 'XAGUSD', name: 'Spot Gumus / US Dollar (Ons)', basePrice: 29.40, volPct: 1.8, type: 'EMTIA', exchange: 'COMEX / FX', currency: '$' },
    { id: 'XPTUSD', name: 'Spot Platin / US Dollar (Ons)', basePrice: 940.00, volPct: 1.7, type: 'EMTIA', exchange: 'NYMEX / FX', currency: '$' },
    { id: 'XPDUSD', name: 'Spot Paladyum / US Dollar (Ons)', basePrice: 980.00, volPct: 2.5, type: 'EMTIA', exchange: 'NYMEX / FX', currency: '$' },
    { id: 'BRENT', name: 'Brent Ham Petrol (Varil)', basePrice: 79.20, volPct: 2.0, type: 'EMTIA', exchange: 'ICE / NYMEX', currency: '$' },
    { id: 'WTI', name: 'WTI Ham Petrol (Varil)', basePrice: 75.80, volPct: 2.1, type: 'EMTIA', exchange: 'NYMEX / FX', currency: '$' },
    { id: 'NATGAS', name: 'Dogal Gaz (Henry Hub)', basePrice: 2.15, volPct: 3.5, type: 'EMTIA', exchange: 'NYMEX / FX', currency: '$' },
    { id: 'COPPER', name: 'Bakir (High Grade Copper)', basePrice: 4.22, volPct: 1.6, type: 'EMTIA', exchange: 'COMEX / FX', currency: '$' },
    { id: 'USDTRY', name: 'Amerikan Dolari / Turk Lirasi', basePrice: 34.15, volPct: 0.3, type: 'DOVIZ', exchange: 'Interbank FX', currency: 'TL' },
    { id: 'EURUSD', name: 'Euro / Amerikan Dolari', basePrice: 1.1080, volPct: 0.4, type: 'DOVIZ', exchange: 'Interbank FX', currency: '$' },
    { id: 'EURTRY', name: 'Euro / Turk Lirasi', basePrice: 37.85, volPct: 0.4, type: 'DOVIZ', exchange: 'Interbank FX', currency: 'TL' },
    { id: 'GBPUSD', name: 'Ingiliz Sterlini / Amerikan Dolari', basePrice: 1.3150, volPct: 0.5, type: 'DOVIZ', exchange: 'Interbank FX', currency: '$' },
    { id: 'GBPTRY', name: 'Ingiliz Sterlini / Turk Lirasi', basePrice: 44.90, volPct: 0.5, type: 'DOVIZ', exchange: 'Interbank FX', currency: 'TL' },
    { id: 'USDJPY', name: 'Amerikan Dolari / Japon Yeni', basePrice: 145.20, volPct: 0.6, type: 'DOVIZ', exchange: 'Interbank FX', currency: 'JPY' },
    { id: 'USDCHF', name: 'Amerikan Dolari / Isvicre Frangi', basePrice: 0.8520, volPct: 0.4, type: 'DOVIZ', exchange: 'Interbank FX', currency: 'CHF' },
    { id: 'AUDUSD', name: 'Avustralya Dolari / Amerikan Dolari', basePrice: 0.6780, volPct: 0.5, type: 'DOVIZ', exchange: 'Interbank FX', currency: '$' },
    { id: 'USDCAD', name: 'Amerikan Dolari / Kanada Dolari', basePrice: 1.3520, volPct: 0.4, type: 'DOVIZ', exchange: 'Interbank FX', currency: '$' },
    { id: 'NZDUSD', name: 'Yeni Zelanda Dolari / Amerikan Dolari', basePrice: 0.6240, volPct: 0.5, type: 'DOVIZ', exchange: 'Interbank FX', currency: '$' },
    { id: 'GAU_TRY', name: 'Gram Altin (TL)', basePrice: 2760.00, volPct: 0.8, type: 'ALTIN', exchange: 'Kapalicarsi / BIST', currency: 'TL' },
    { id: 'CEYREK', name: 'Ceyrek Altin (TL)', basePrice: 4510.00, volPct: 0.8, type: 'ALTIN', exchange: 'Kapalicarsi / BIST', currency: 'TL' },
    { id: 'DXY', name: 'US Dollar Endeksi (DXY)', basePrice: 101.40, volPct: 0.4, type: 'ENDEKS', exchange: 'ICE / FX', currency: '$' },
    { id: 'VIX', name: 'CBOE Volatilite Endeksi', basePrice: 15.60, volPct: 4.5, type: 'ENDEKS', exchange: 'CBOE', currency: '$' }
];

async function main() {
    console.log('Fetching live Binance USDT pairs...');
    const binanceData = await fetchBinanceUsdtPairs();
    console.log(`Fetched ${binanceData.length} pairs from Binance.`);

    const catalog = [];

    // 1. Add BIST
    BIST_STOCKS.forEach(s => {
        catalog.push({
            id: s.id,
            name: s.name,
            category: 'bist',
            exchange: 'BIST (Borsa Istanbul)',
            api: 'EODHD / BIST API',
            type: s.type || 'HISSE',
            basePrice: s.basePrice,
            volPct: s.volPct,
            currency: 'TL'
        });
    });

    // 2. Add US Stocks
    US_STOCKS.forEach(s => {
        catalog.push({
            id: s.id,
            name: s.name,
            category: 'stocks',
            exchange: s.exchange || 'NASDAQ',
            api: 'Polygon.io API',
            type: s.type || 'HISSE',
            basePrice: s.basePrice,
            volPct: s.volPct,
            currency: '$'
        });
    });

    // 3. Add Binance Crypto (Every single pair)
    const priorityCrypto = [
        'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'AVAXUSDT', 'SUIUSDT', 'NEARUSDT',
        'PEPEUSDT', 'SHIBUSDT', 'LINKUSDT', 'TAOUSDT', 'RENDERUSDT', 'FETUSDT', 'WIFUSDT', 'BONKUSDT', 'FLOKIUSDT',
        'APTUSDT', 'DOTUSDT', 'ADAUSDT', 'MATICUSDT', 'ATOMUSDT', 'FTMUSDT', 'STXUSDT', 'INJUSDT', 'OPUSDT', 'ARBUSDT',
        'LDOUSDT', 'TIAUSDT', 'SEIUSDT', 'ORDIUSDT', 'RUNEUSDT', 'ICPUSDT', 'KASUSDT', 'TRXUSDT', 'TONUSDT', 'NOTUSDT',
        'POPCATUSDT', 'NEIROUSDT', 'JUPUSDT', 'PYTHUSDT', 'ONDOUSDT', 'ENAUSDT', 'ETHFIUSDT', 'PENDLEUSDT', 'STRKUSDT',
        'ZKUSDT', 'IOUSDT', 'BLASTUSDT', 'LISTAUSDT', 'BBUSDT', 'MEMEUSDT', '1000SATSUSDT', '1000RATSUSDT', 'LTCUSDT',
        'BCHUSDT', 'ETCUSDT', 'XLMUSDT', 'XMRUSDT', 'ALGOUSDT', 'HBARUSDT', 'EOSUSDT', 'FILUSDT', 'GRTUSDT', 'SANDUSDT',
        'MANAUSDT', 'GALAUSDT', 'CHZUSDT', 'BEAMUSDT', 'AXSUSDT', 'AAVEUSDT', 'UNIUSDT', 'MKRUSDT', 'CRVUSDT', 'SNXUSDT'
    ];

    const addedCrypto = new Set();

    // Add priority first
    priorityCrypto.forEach(sym => {
        const found = binanceData.find(b => b.symbol === sym);
        const p = found ? parseFloat(found.price) : 100.0;
        catalog.push({
            id: sym,
            name: `${sym.replace('USDT', '')} / TetherUS`,
            category: 'crypto',
            exchange: 'Binance Spot',
            api: 'Binance WS / REST API',
            type: 'KRIPTO',
            isBinance: true,
            basePrice: p,
            volPct: 3.5,
            currency: '$'
        });
        addedCrypto.add(sym);
    });

    // Add remaining Binance pairs
    binanceData.forEach(b => {
        if (!addedCrypto.has(b.symbol)) {
            catalog.push({
                id: b.symbol,
                name: `${b.symbol.replace('USDT', '')} / TetherUS`,
                category: 'crypto',
                exchange: 'Binance Spot',
                api: 'Binance WS / REST API',
                type: 'KRIPTO',
                isBinance: true,
                basePrice: parseFloat(b.price),
                volPct: 4.0,
                currency: '$'
            });
            addedCrypto.add(b.symbol);
        }
    });

    // 4. Add Forex & Commodities
    FOREX_COMMODITIES.forEach(s => {
        catalog.push({
            id: s.id,
            name: s.name,
            category: 'fx',
            exchange: s.exchange,
            api: s.api || 'TwelveData API',
            type: s.type,
            basePrice: s.basePrice,
            volPct: s.volPct,
            currency: s.currency
        });
    });

    console.log(`Total universal symbol catalog size: ${catalog.length} symbols!`);

    const jsonStr = JSON.stringify(catalog, null, 2);
    fs.writeFileSync('scripts/full_symbol_catalog.json', jsonStr);
    
    // Also export as a JS module file
    const jsCode = `// Universal Multi-Exchange Symbol Catalog (${catalog.length} Assets)\nexport const FULL_SYMBOL_CATALOG = ${jsonStr};\n`;
    fs.writeFileSync('scripts/full_symbol_catalog.js', jsCode);
    console.log('Saved catalog to scripts/full_symbol_catalog.json and scripts/full_symbol_catalog.js');
}

main();
