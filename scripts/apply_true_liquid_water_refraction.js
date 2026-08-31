import fs from 'fs';

function refineCrystalWater() {
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const crystalWaterStyles = `
/* ============================================================ */
/* 💎 CRYSTAL WATER GLASS & ULTRA-HIGH CANDLE TRANSMITTANCE     */
/* ============================================================ */

/* 1. ARKA PLAN GRAFİK: Mumlar camın arkasında %100 kristal netlikte */
#bg-chart-stage.blurred {
    filter: blur(1.5px) brightness(0.92) contrast(104%) !important;
    transform: scale(1.00) !important;
}

/* 2. MERKEZİ KART: %88 ŞEFFAF KRİSTAL CAM */
.portal-glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(255, 255, 255, 0.04) 100%), rgba(6, 11, 24, 0.18) !important;
    backdrop-filter: blur(8px) saturate(220%) contrast(108%) brightness(1.10) !important;
    -webkit-backdrop-filter: blur(8px) saturate(220%) contrast(108%) brightness(1.10) !important;
    border: 1px solid rgba(255, 255, 255, 0.22) !important;
    border-top: 1.5px solid rgba(255, 255, 255, 0.75) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 28px !important;
    box-shadow: 
        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.50),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.20),
        0 30px 70px -10px rgba(0, 0, 0, 0.55),
        0 0 50px rgba(41, 98, 255, 0.15) !important;
}

.portal-card-row {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.40) !important;
    backdrop-filter: blur(4px) saturate(190%) !important;
    -webkit-backdrop-filter: blur(4px) saturate(190%) !important;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.30) !important;
}

/* 3. CANLI GRAFİK TERMİNALİNİ BAŞLAT: %95 KRİSTAL SU PRİZMASI */
.portal-card-btn {
    position: relative !important;
    overflow: hidden !important;
    width: 100% !important;
    padding: 18px 26px !important;
    /* SAF SU / KRİSTAL CAM GEÇİRGENLİĞİ */
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.16) 100%), rgba(255, 255, 255, 0.01) !important;
    backdrop-filter: blur(3px) saturate(280%) contrast(120%) brightness(1.25) !important;
    -webkit-backdrop-filter: blur(3px) saturate(280%) contrast(120%) brightness(1.25) !important;
    border: 1px solid rgba(255, 255, 255, 0.38) !important;
    border-top: 2px solid rgba(255, 255, 255, 0.95) !important;
    border-bottom: 1.5px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 9999px !important;
    color: #ffffff !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    letter-spacing: 0.5px !important;
    cursor: pointer !important;
    box-shadow: 
        inset 0 2px 4px 0 rgba(255, 255, 255, 0.85),
        inset 0 -2px 3px 0 rgba(0, 0, 0, 0.30),
        inset 0 0 25px 0 rgba(255, 255, 255, 0.20),
        0 16px 45px -5px rgba(0, 0, 0, 0.50),
        0 0 35px rgba(16, 185, 129, 0.30) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.portal-card-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.04) 70%, rgba(255, 255, 255, 0.28) 100%), rgba(255, 255, 255, 0.06) !important;
    border-top-color: #ffffff !important;
    transform: translateY(-2px) scale(1.02) !important;
    box-shadow: 
        inset 0 2.5px 5px 0 rgba(255, 255, 255, 1.0),
        inset 0 -2px 3px 0 rgba(0, 0, 0, 0.25),
        0 24px 55px -5px rgba(0, 0, 0, 0.65),
        0 0 50px rgba(16, 185, 129, 0.50) !important;
}
    `;

    css = css + '\n' + crystalWaterStyles;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✓ Refined Crystal Water Glass in frontend/styles/liquid-glass.css');
}

refineCrystalWater();
