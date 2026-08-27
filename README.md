# ⚡ SqiciBekiRBindikatöR // WebGL 2.0 GPU Grafik & Canlı Backtest Motoru

TradingView Pine Script v6 mimarisiyle **%100 matematiksel ve zamansal olarak birebir uyumlu**, donanım hızlandırmalı (GPU WebGL 2.0) profesyonel finansal grafik ve canlı backtest platformu.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🚀 GPU Hızlandırmalı WebGL 2.0 Render Motoru
* 60+ FPS ile 3.000+ barlık geçmiş mum verisini, hareketli plazma Ichimoku bulutlarını ve dinamik lazer EMA hatlarını sıfır CPU yükü ile doğrudan ekran kartı shader'larında (Fragment Shader) işler.
* HiDPI Retina / 4K keskin antialiasing vektör katmanı.

### 2. 🌌 %100 Birebir TradingView Pine Script v6 Multi-Timeframe (MTF)
* **1D HTF Ichimoku Rejimi (`f_regime1D()[1]`):** Günlük kapanmış mumlar üzerinden hesaplanan ve 1 saatlik grafiğe izdüşürülen yeşil (boğa) / kırmızı (ayı) rejim filtresi.
* **Canlı 4H EMA26 (`ema4HLive`):** Son kapanmış 4H mumun EMA26'sı ile 1H mumun canlı fiyatını anlık formülle birleştiren canlı 4H EMA kırılım hattı.
* **1H Ichimoku Bulutu (`disp = 26` Offset):** Standart 26 bar ileri öteleme (displacement) ile TradingView ile birebir örtüşen bulut kırılımları.
* **BUY1 / SELL1 & BUY2 / SELL2:** Pine Script v6 alarm ve sinyal koşullarıyla birebir eşzamanlı sinyaller.

### 3. 🎆 Canlı Backtest & Havai Fişek (Fireworks) Efektleri
* **🏆 TP Kazanan Sinyaller:** Belirlenen 1:1.67 hedefine stop olmadan önce ulaşan her sinyalin etrafında 60 FPS altın/zümrüt/neon parçacıklı **havai fişek patlamaları** ve `✅ KAZANDI` zafer damgası.
* **❌ SL Kaybeden Sinyaller:** Stop-Loss seviyesini kıran sinyallerin üzerinde belirgin **neon kırmızı ❌ çarpı** işareti.

### 4. 💰 Görünen Ekrana Duyarlı (Viewport-Aware) Kümülatif All-In Büyüme
* Grafiği sağa/sola kaydırdığınızda veya zoom yaptığınızda, sol üstteki analiz paneli **sadece ekranda görünen mum aralığını** anlık olarak hesaplar.
* Ekranda görünen ilk sinyalden itibaren **$1.000 sermaye ile sırayla All-In bileşik getiri** sağlansaydı kasanın ne kadar büyüyeceğini anlık simüle eder.

### 5. 🌐 OttOnline Platform Entegrasyonu
* Üst menüdeki buton ile tek tıkla açılıp kapanabilen bölünmüş (split-screen 50/50) canlı borsa çalışma alanı.

---

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerelinizde çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı üretim derlemesi (Build)
npm run build
```

Tarayıcınızda otomatik olarak `http://localhost:5173/` açılacaktır.

---

## 📈 Mimari Yapı

* **`index.html`**: GPU WebGL 2.0 Shader'ları, Multi-Timeframe Binance veri toplayıcısı, WebSocket canlı veri akışı ve parçacık motorunu barındıran ana uygulama.
* **`vite.config.js`**: Vite dev sunucusu ve host yapılandırması.
