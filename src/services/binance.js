/**
 * Binance REST & WebSocket Canlı Veri Servisi
 * Multi-chunk Geçmiş İndirici (3000 Muma Kadar Derin Geçmiş)
 */

let activeWs = null;

export async function fetchKlines(symbol, interval = '1h', targetCount = 3000) {
    let allKlines = [];
    let endTime = null;
    const requestsNeeded = Math.ceil(targetCount / 1000);

    const baseHosts = [
        'https://api.binance.com',
        'https://data-api.binance.vision',
        'https://api1.binance.com',
        'https://api3.binance.com'
    ];

    for (let req = 0; req < requestsNeeded; req++) {
        let chunk = null;
        for (const host of baseHosts) {
            try {
                let url = `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
                if (endTime) url += `&endTime=${endTime}`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        chunk = data;
                        break;
                    }
                }
            } catch (e) {
                // Sonraki host'a geç
            }
        }

        if (!chunk || chunk.length === 0) break;
        allKlines = chunk.concat(allKlines);
        endTime = chunk[0][0] - 1; // En eski mumun 1ms öncesi
    }

    // Yedek Simülasyon
    if (allKlines.length === 0) {
        console.warn('Binance API bağlantısı sağlanamadı, yerel simülasyon başlatılıyor.');
        let p = 64200.0;
        const now = Date.now();
        for (let i = targetCount - 1; i >= 0; i--) {
            const t = now - i * 3600000;
            const change = (Math.random() - 0.495) * 350;
            const o = p;
            const c = o + change;
            const h = Math.max(o, c) + Math.random() * 220;
            const l = Math.min(o, c) - Math.random() * 220;
            const v = Math.random() * 1000 + 200;
            p = c;
            allKlines.push([t, o, h, l, c, v]);
        }
    }

    // Yinelenenleri temizle ve zamana göre sırala
    const uniqueMap = new Map();
    for (const k of allKlines) {
        uniqueMap.set(k[0], k);
    }
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => a[0] - b[0]);

    return sorted.map(k => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        vol: parseFloat(k[5])
    }));
}

export function subscribeKlineWebSocket(symbol, interval = '1h', onCandle, onStatusChange) {
    if (activeWs) {
        activeWs.close();
        activeWs = null;
    }

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    activeWs = ws;

    ws.onopen = () => {
        if (onStatusChange) onStatusChange('connected');
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        if (!k) return;

        const candle = {
            time: k.t,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            vol: parseFloat(k.v),
            isFinal: k.x
        };

        if (onCandle) onCandle(candle);
    };

    ws.onerror = () => {
        if (onStatusChange) onStatusChange('error');
    };

    ws.onclose = () => {
        if (onStatusChange) onStatusChange('closed');
    };

    return () => {
        if (ws) ws.close();
    };
}
