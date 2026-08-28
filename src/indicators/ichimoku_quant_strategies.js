/**
 * TradeChart Pro - Archived Ichimoku MTF & 5 Quant Strategies Library
 */

export const STRATEGY_PRESETS = {
    FIXED: 0,
    STRUCTURAL: 1,
    QUANT_MAE: 2,
    TRAILING_KIJUN: 3,
    ASYMMETRIC_PRO: 4
};

export function calculateTradeChart_MultiStrategy(candleDataBase, candleDataEma, candleDataRegime, activeStrategy = 4, currentTimeframe = '1h') {
    const totalCandles = candleDataBase.length;
    if (totalCandles === 0) return { sa: [], sb: [], ema4H: [], regime1D: [], signals: [] };

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

    const ema4H = new Float32Array(totalCandles);
    const regime1D = new Float32Array(totalCandles);

    for (let i = 0; i < totalCandles; i++) {
        ema4H[i] = kijun[i];
        regime1D[i] = candleDataBase[i].close >= sa[i] && candleDataBase[i].close >= sb[i] ? 1.0 :
                      candleDataBase[i].close <= sa[i] && candleDataBase[i].close <= sb[i] ? -1.0 : 0.0;
    }

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

            if (activeStrategy === 4) {
                if (regime1D[i] > 0.5) {
                    slDist = 1.4 * atr;
                    tpDist = 4.0 * atr;
                    label = 'BUY [TREND]';
                } else {
                    slDist = 2.2 * atr;
                    tpDist = 2.2 * atr;
                    label = 'BUY [BOĞA]';
                }
            } else if (activeStrategy === 1) {
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
