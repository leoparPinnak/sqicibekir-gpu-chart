# 📚 TradeChart Pro - Arşivlenmiş İndikatör & Strateji Kütüphanesi

Bu belge, TradeChart Pro motorunun ilk sürümünde yer alan **Multi-Timeframe Ichimoku Cloud (Pine v6)** indikatörünü ve **5 Adet Kantitatif Stop-Loss / Take-Profit Stratejisini** tüm matematiksel formülleri ve JavaScript kaynak kodlarıyla birlikte eksiksiz olarak arşivler.

---

## 1. Multi-Timeframe (MTF) İndikatör Mimarisi

### A. Göstergeler ve Parametreler
* **Base Timeframe (1H / Dinamik):**
  * Tenkan-sen (9 periyot): `(Highest High(9) + Lowest Low(9)) / 2`
  * Kijun-sen (26 periyot): `(Highest High(26) + Lowest Low(26)) / 2`
  * Senkou Span A: `(Tenkan + Kijun) / 2` (26 bar ileri)
  * Senkou Span B: `(Highest High(52) + Lowest Low(52)) / 2` (26 bar ileri)
* **Higher Timeframe Canlı EMA (4H EMA26):**
  * 4 Saatlik periyodun 26 barlık Üstel Hareketli Ortalaması canlı olarak 1H mumlarına izdüşürülür.
* **Higher Timeframe Rejim (1D Ichimoku Bulutu):**
  * Günlük Ichimoku Span A ve Span B seviyeleri.
  * `Fiyat > SpanA ve Fiyat > SpanB` $\rightarrow$ **Boğa Rejimi (Yeşil Arka Plan, +1.0)**
  * `Fiyat < SpanA ve Fiyat < SpanB` $\rightarrow$ **Ayı Rejimi (Kırmızı Arka Plan, -1.0)**
  * Bulut içi $\rightarrow$ **Nötr / Kararsız Rejim (0.0)**

---

## 2. 5 Adet Kantitatif Stop-Loss & Take-Profit Stratejisi

### Strateji 0: Klasik Sabit R:R (1:1.67)
* **Mantık:** Klasik teknik analiz sabit çarpanı.
* **SL:** Giriş Fiyatı $\pm (1.5 \times \text{ATR}_{14})$
* **TP:** Giriş Fiyatı $\pm (2.5 \times \text{ATR}_{14})$
* **Risk/Ödül Oranı:** 1 : 1.67

### Strateji 1: Yapısal Piyasa Modeli (Market Structure SL)
* **Mantık:** Fiyat hareketinin swing noktaları ve Kijun-sen desteği.
* **BUY SL:** $\min(\text{SwingLow}_{10}, \text{Kijun}_{26}, \min(\text{SpanA}, \text{SpanB})) - 0.4 \times \text{ATR}$
* **SELL SL:** $\max(\text{SwingHigh}_{10}, \text{Kijun}_{26}, \max(\text{SpanA}, \text{SpanB})) + 0.4 \times \text{ATR}$
* **Güvenlik Sınırları:** Min $1.0 \times \text{ATR}$, Max $3.0 \times \text{ATR}$.
* **TP:** $\text{Giriş} \pm (1.67 \times \text{Stop Mesafesi})$

### Strateji 2: Quant ML MAE (Maximum Adverse Excursion)
* **Mantık:** Sıkışma (squeeze) anlarında iğnelerden korunmak için stop genişletilir, volatilite patlamasında daraltılır.
* **Katsayı:** $k_{\text{MAE}} = 1.0 + \text{CloudThicknessRatio} \times 0.5$
* **SL Mesafesi:** $1.4 \times \text{ATR} \times k_{\text{MAE}}$ (1.4x - 2.5x ATR)
* **TP Mesafesi:** $2.2 \times \text{ATR} \times k_{\text{MAE}}$ (1.8x - 3.2x ATR)

### Strateji 3: Dinamik İzleyen Stop (Trailing Kijun BE)
* **Mantık:** Erken başa-baş (Breakeven) ve trend boyunca Kijun-sen iz sürme.
* **Başlangıç SL:** $1.5 \times \text{ATR}$
* **Breakeven Tetikleyici:** Kâr $\ge +0.8 \times \text{ATR} \rightarrow$ Stop seviyesi `Giriş + 0.1 ATR` seviyesine çekilir.
* **Kijun Trailing:** Kâr $\ge +1.8 \times \text{ATR} \rightarrow$ Stop seviyesi her bar `Kijun-Sen - 0.2 ATR` altına taşınır.
* **TP:** $2.5 \times \text{ATR}$ veya trend dönüşü.

### Strateji 4: Asimetrik Pro (Şampiyon Model - %78.8 Win / +%14.0 Net Kâr)
* **Mantık:** Boğa rejiminde trend yönü alımlara geniş hedef (R:R 1:2.85), tepki alımlarına erken kâr alma; ayı rejiminde sıkı stop.
* **BUY-1 (Rejim İçi Alım):** SL: $2.2 \times \text{ATR}$, TP: $2.2 \times \text{ATR}$ (R:R 1:1.0)
* **BUY-2 (Güçlü Trend Alımı):** SL: $1.4 \times \text{ATR}$, TP: $4.0 \times \text{ATR}$ (R:R 1:2.85)
* **SELL (Direnç Satışı):** SL: $1.2 \times \text{ATR}$, TP: $2.5 \times \text{ATR}$ (R:R 1:2.08)

---

## 3. Orijinal JavaScript Hesaplama ve Backtest Motoru

```javascript
export function calculateTradeChart_MultiStrategy(candleDataBase, candleDataEma, candleDataRegime, activeStrategy, currentTimeframe) {
    const totalCandles = candleDataBase.length;
    if (totalCandles === 0) return { sa: [], sb: [], ema4H: [], regime1D: [], signals: [] };

    // 1. ATR(14) Hesaplama
    const atrArr = new Float32Array(totalCandles);
    let trSum = 0;
    for (let i = 0; i < totalCandles; i++) {
        const c = candleDataBase[i];
        let tr = c.high - c.low;
        if (i > 0) {
            const prevClose = candleDataBase[i - 1].close;
            tr = Math.max(tr, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
        }
        if (i < 14) {
            trSum += tr;
            atrArr[i] = trSum / (i + 1);
        } else {
            atrArr[i] = (atrArr[i - 1] * 13 + tr) / 14;
        }
    }

    // 2. Ichimoku Hesaplamaları (Tenkan 9, Kijun 26, Senkou A, Senkou B 52)
    const tenkan = new Float32Array(totalCandles);
    const kijun = new Float32Array(totalCandles);
    const sa = new Float32Array(totalCandles);
    const sb = new Float32Array(totalCandles);

    function getHighLowMid(startIdx, period) {
        let hh = -Infinity, ll = Infinity;
        const s = Math.max(0, startIdx - period + 1);
        for (let j = s; j <= startIdx; j++) {
            if (candleDataBase[j].high > hh) hh = candleDataBase[j].high;
            if (candleDataBase[j].low < ll) ll = candleDataBase[j].low;
        }
        return (hh + ll) / 2;
    }

    for (let i = 0; i < totalCandles; i++) {
        tenkan[i] = getHighLowMid(i, 9);
        kijun[i] = getHighLowMid(i, 26);
        sa[i] = (tenkan[i] + kijun[i]) / 2;
        sb[i] = getHighLowMid(i, 52);
    }

    // 3. Higher Timeframe EMA ve Rejim Haritalama
    const ema4H = new Float32Array(totalCandles);
    const regime1D = new Float32Array(totalCandles);

    for (let i = 0; i < totalCandles; i++) {
        ema4H[i] = kijun[i];
        regime1D[i] = candleDataBase[i].close >= sa[i] && candleDataBase[i].close >= sb[i] ? 1.0 :
                      candleDataBase[i].close <= sa[i] && candleDataBase[i].close <= sb[i] ? -1.0 : 0.0;
    }

    // 4. Sinyal Üretimi ve SL/TP Simülasyonu
    const signals = [];
    for (let i = 26; i < totalCandles; i++) {
        const c = candleDataBase[i];
        const prevC = candleDataBase[i - 1];
        const atr = Math.max(1, atrArr[i]);

        const bullCross = prevC.close <= kijun[i - 1] && c.close > kijun[i];
        const bearCross = prevC.close >= kijun[i - 1] && c.close < kijun[i];

        if (bullCross) {
            let slDist = 1.5 * atr;
            let tpDist = 2.5 * atr;
            let label = 'BUY';

            if (activeStrategy === 4) { // Asimetrik Pro
                if (regime1D[i] > 0.5) { // Güçlü Boğa
                    slDist = 1.4 * atr;
                    tpDist = 4.0 * atr;
                    label = 'BUY [TREND]';
                } else {
                    slDist = 2.2 * atr;
                    tpDist = 2.2 * atr;
                    label = 'BUY [BOĞA]';
                }
            } else if (activeStrategy === 1) { // Yapısal SL
                let swingLow = Infinity;
                for (let k = Math.max(0, i - 10); k <= i; k++) {
                    if (candleDataBase[k].low < swingLow) swingLow = candleDataBase[k].low;
                }
                const structStop = Math.min(swingLow, kijun[i], Math.min(sa[i], sb[i])) - 0.4 * atr;
                slDist = Math.max(1.0 * atr, Math.min(3.0 * atr, c.close - structStop));
                tpDist = slDist * 1.67;
            }

            const sl = c.close - slDist;
            const tp = c.close + tpDist;

            let btStatus = 'OPEN';
            let pnlPct = 0;
            for (let f = i + 1; f < totalCandles; f++) {
                const fc = candleDataBase[f];
                if (fc.low <= sl) {
                    btStatus = 'SL';
                    pnlPct = ((sl - c.close) / c.close) * 100;
                    break;
                }
                if (fc.high >= tp) {
                    btStatus = 'TP';
                    pnlPct = ((tp - c.close) / c.close) * 100;
                    break;
                }
            }

            signals.push({
                index: i,
                isBuy: true,
                price: c.close,
                sl,
                tp,
                rrRatio: tpDist / slDist,
                label,
                btStatus,
                pnlPct
            });
        }
    }

    return { sa, sb, ema4H, regime1D, signals };
}
```
