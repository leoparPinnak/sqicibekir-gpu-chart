/**
 * TradeChart Pro - Indicator Manager & Technical Analysis Engine
 * Modular indicator calculations: RSI, MACD, Bollinger Bands, EMA, SMA, Volume, ATR, SuperTrend
 */

export class TechnicalCalculations {
    static sma(data, period, key = 'close') {
        const values = data.map(d => typeof d === 'number' ? d : d[key]);
        const result = new Array(values.length).fill(null);
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i];
            if (i >= period) {
                sum -= values[i - period];
            }
            if (i >= period - 1) {
                result[i] = sum / period;
            }
        }
        return result;
    }

    static ema(data, period, key = 'close') {
        const values = data.map(d => typeof d === 'number' ? d : d[key]);
        const result = new Array(values.length).fill(null);
        const k = 2 / (period + 1);
        let initialSum = 0;

        for (let i = 0; i < values.length; i++) {
            if (i < period - 1) {
                initialSum += values[i];
            } else if (i === period - 1) {
                initialSum += values[i];
                result[i] = initialSum / period;
            } else {
                result[i] = (values[i] - result[i - 1]) * k + result[i - 1];
            }
        }
        return result;
    }

    static rsi(candles, period = 14, key = 'close') {
        const values = candles.map(c => typeof c === 'number' ? c : c[key]);
        const result = new Array(values.length).fill(null);
        if (values.length <= period) return result;

        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const diff = values[i] - values[i - 1];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;
        result[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

        for (let i = period + 1; i < values.length; i++) {
            const diff = values[i] - values[i - 1];
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;

            result[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
        }
        return result;
    }

    static macd(candles, fast = 12, slow = 26, signal = 9, key = 'close') {
        const fastEma = this.ema(candles, fast, key);
        const slowEma = this.ema(candles, slow, key);
        const macdLine = new Array(candles.length).fill(null);

        for (let i = 0; i < candles.length; i++) {
            if (fastEma[i] !== null && slowEma[i] !== null) {
                macdLine[i] = fastEma[i] - slowEma[i];
            }
        }

        // Calculate Signal Line (EMA of MACD Line)
        const validMacdStart = macdLine.findIndex(v => v !== null);
        const signalLine = new Array(candles.length).fill(null);
        const histogram = new Array(candles.length).fill(null);

        if (validMacdStart !== -1) {
            const validMacdValues = macdLine.slice(validMacdStart);
            const sigEma = this.ema(validMacdValues, signal);
            for (let i = 0; i < sigEma.length; i++) {
                const targetIdx = validMacdStart + i;
                signalLine[targetIdx] = sigEma[i];
                if (macdLine[targetIdx] !== null && signalLine[targetIdx] !== null) {
                    histogram[targetIdx] = macdLine[targetIdx] - signalLine[targetIdx];
                }
            }
        }

        return { macd: macdLine, signal: signalLine, histogram };
    }

    static bollingerBands(candles, period = 20, mult = 2.0, key = 'close') {
        const values = candles.map(c => typeof c === 'number' ? c : c[key]);
        const basis = this.sma(candles, period, key);
        const upper = new Array(values.length).fill(null);
        const lower = new Array(values.length).fill(null);

        for (let i = period - 1; i < values.length; i++) {
            let sumSq = 0;
            for (let j = 0; j < period; j++) {
                sumSq += Math.pow(values[i - j] - basis[i], 2);
            }
            const stdev = Math.sqrt(sumSq / period);
            upper[i] = basis[i] + mult * stdev;
            lower[i] = basis[i] - mult * stdev;
        }

        return { basis, upper, lower };
    }

    static atr(candles, period = 14) {
        const result = new Array(candles.length).fill(null);
        if (candles.length < 2) return result;

        const tr = [candles[0].high - candles[0].low];
        for (let i = 1; i < candles.length; i++) {
            const h = candles[i].high;
            const l = candles[i].low;
            const pc = candles[i - 1].close;
            tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
        }

        let sum = 0;
        for (let i = 0; i < period; i++) sum += tr[i];
        result[period - 1] = sum / period;

        for (let i = period; i < candles.length; i++) {
            result[i] = (result[i - 1] * (period - 1) + tr[i]) / period;
        }
        return result;
    }

    static supertrend(candles, period = 10, factor = 3.0) {
        const atr = this.atr(candles, period);
        const upperBand = new Array(candles.length).fill(null);
        const lowerBand = new Array(candles.length).fill(null);
        const superTrend = new Array(candles.length).fill(null);
        const direction = new Array(candles.length).fill(1); // 1 = up (green), -1 = down (red)

        for (let i = 0; i < candles.length; i++) {
            if (atr[i] === null) continue;
            const hl2 = (candles[i].high + candles[i].low) / 2;
            let basicUpper = hl2 + factor * atr[i];
            let basicLower = hl2 - factor * atr[i];

            let prevLower = (i > 0 && lowerBand[i - 1] !== null) ? lowerBand[i - 1] : basicLower;
            let prevUpper = (i > 0 && upperBand[i - 1] !== null) ? upperBand[i - 1] : basicUpper;
            let prevClose = (i > 0) ? candles[i - 1].close : candles[i].close;

            lowerBand[i] = (basicLower > prevLower || prevClose < prevLower) ? basicLower : prevLower;
            upperBand[i] = (basicUpper < prevUpper || prevClose > prevUpper) ? basicUpper : prevUpper;

            let prevDir = (i > 0) ? direction[i - 1] : 1;
            let prevST = (i > 0 && superTrend[i - 1] !== null) ? superTrend[i - 1] : lowerBand[i];

            if (prevST === prevUpper) {
                direction[i] = candles[i].close > upperBand[i] ? 1 : -1;
            } else {
                direction[i] = candles[i].close < lowerBand[i] ? -1 : 1;
            }

            superTrend[i] = direction[i] === 1 ? lowerBand[i] : upperBand[i];
        }

        return { superTrend, direction, upperBand, lowerBand };
    }

    static volume(candles, smaPeriod = 20) {
        const vols = candles.map(c => c.volume || 0);
        const volSma = this.sma(vols, smaPeriod);
        return { volume: vols, volSma };
    }
}
