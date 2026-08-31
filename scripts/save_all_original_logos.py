import os
import urllib.request
import ssl

LOGO_DIR = os.path.join(os.getcwd(), 'frontend', 'assets', 'logos')
os.makedirs(LOGO_DIR, exist_ok=True)

LOGO_SOURCES = [
    # BIST 100
    ("thyao.png", "https://www.google.com/s2/favicons?domain=turkishairlines.com&sz=128"),
    ("asels.png", "https://www.google.com/s2/favicons?domain=aselsan.com.tr&sz=128"),
    ("eregl.png", "https://www.google.com/s2/favicons?domain=oyak.com.tr&sz=128"),
    ("garan.png", "https://www.google.com/s2/favicons?domain=garantibbva.com.tr&sz=128"),
    ("tuprs.png", "https://www.google.com/s2/favicons?domain=tupras.com.tr&sz=128"),
    ("bimas.png", "https://www.google.com/s2/favicons?domain=bim.com.tr&sz=128"),
    ("kchol.png", "https://www.google.com/s2/favicons?domain=koc.com&sz=128"),
    ("sise.png", "https://www.google.com/s2/favicons?domain=sisecam.com.tr&sz=128"),
    ("isctr.png", "https://www.google.com/s2/favicons?domain=isbank.com.tr&sz=128"),
    ("akbnk.png", "https://www.google.com/s2/favicons?domain=akbank.com&sz=128"),
    ("pgsus.png", "https://www.google.com/s2/favicons?domain=flypgs.com&sz=128"),
    ("tcell.png", "https://www.google.com/s2/favicons?domain=turkcell.com.tr&sz=128"),

    # ABD HİSSELERİ (NASDAQ / NYSE)
    ("nvda.png", "https://financialmodelingprep.com/image-stock/NVDA.png"),
    ("aapl.png", "https://financialmodelingprep.com/image-stock/AAPL.png"),
    ("tsla.png", "https://financialmodelingprep.com/image-stock/TSLA.png"),
    ("msft.png", "https://financialmodelingprep.com/image-stock/MSFT.png"),
    ("googl.png", "https://financialmodelingprep.com/image-stock/GOOGL.png"),
    ("amzn.png", "https://financialmodelingprep.com/image-stock/AMZN.png"),
    ("meta.png", "https://financialmodelingprep.com/image-stock/META.png"),

    # KRİPTO PARALAR
    ("btc.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png"),
    ("eth.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png"),
    ("sol.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png"),
    ("bnb.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png"),
    ("xrp.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png"),
    ("avax.png", "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png"),

    # EMTİA & FOREX
    ("xauusd.svg", "https://s3-symbol-logo.tradingview.com/metal/gold--big.svg"),
    ("brent.svg", "https://s3-symbol-logo.tradingview.com/crude-oil--big.svg"),
    ("usdtry.svg", "https://s3-symbol-logo.tradingview.com/country/TR--big.svg")
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

print(f"Downloading original brand logo assets to {LOGO_DIR}...")
for filename, url in LOGO_SOURCES:
    dest_path = os.path.join(LOGO_DIR, filename)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            with open(dest_path, 'wb') as f:
                f.write(response.read())
        print(f"  [OK] {filename}")
    except Exception as e:
        print(f"  [ERR] {filename}: {e}")

# Fallback for EREGL & KCHOL if google 404
koc_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs><linearGradient id="kg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c5161d"/><stop offset="100%" stop-color="#8a0c11"/></linearGradient></defs>
  <circle cx="64" cy="64" r="62" fill="url(#kg)"/>
  <path d="M64 26 C42 26 32 40 32 54 C32 68 44 76 56 74 C50 68 48 60 52 52 C56 44 64 42 74 46 C68 40 66 34 64 26 Z" fill="#ffffff"/>
  <path d="M64 26 C86 26 96 40 96 54 C96 68 84 76 72 74 C78 68 80 60 76 52 C72 44 64 42 54 46 C60 40 62 34 64 26 Z" fill="#ffffff"/>
  <text x="64" y="104" font-family="sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">KOC</text>
</svg>"""

eregl_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs><linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0f172a"/></linearGradient><linearGradient id="ef" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#ea580c"/><stop offset="100%" stop-color="#facc15"/></linearGradient></defs>
  <circle cx="64" cy="64" r="62" fill="url(#eg)"/>
  <path d="M64 28 C64 48 44 56 44 76 C44 88 53 96 64 96 C75 96 84 88 84 76 C84 56 64 48 64 28 Z" fill="url(#ef)"/>
  <path d="M64 54 C64 66 54 72 54 82 C54 88 58 92 64 92 C70 92 74 88 74 82 C74 72 64 66 64 54 Z" fill="#ffffff" opacity="0.9"/>
</svg>"""

if not os.path.exists(os.path.join(LOGO_DIR, 'kchol.png')) or os.path.getsize(os.path.join(LOGO_DIR, 'kchol.png')) < 100:
    with open(os.path.join(LOGO_DIR, 'kchol.svg'), 'w', encoding='utf-8') as f:
        f.write(koc_svg)

if not os.path.exists(os.path.join(LOGO_DIR, 'eregl.png')) or os.path.getsize(os.path.join(LOGO_DIR, 'eregl.png')) < 100:
    with open(os.path.join(LOGO_DIR, 'eregl.svg'), 'w', encoding='utf-8') as f:
        f.write(eregl_svg)

print("Original brand logo files ready on disk!")
