import { Price } from './types'

// Estrutura: { 'BTCUSDT': { binance: 67432.10, kraken: 67500.00 } }
type Cache = Map<string, Map<string, number>>

const cache: Cache = new Map()

export function updatePrice(price: Price): void {
    if (!cache.has(price.symbol)) {
        cache.set(price.symbol, new Map())
    }
    cache.get(price.symbol)!.set(price.exchange, price.price)
}

// Retorna os preços de todas as exchanges para um símbolo
// Ex: { binance: 67432.10, kraken: 67500.00 }
export function getPrices(symbol: string): Map<string, number> | undefined {
    return cache.get(symbol)
}

// Retorna todos os símbolos que já têm preço em pelo menos uma exchange
export function getSymbols(): string[] {
    return Array.from(cache.keys())
}

// Returns a snapshot of all current prices for all symbols and exchanges
export function getAllPrices(): Array<{ symbol: string; exchange: string; price: number }> {
    const result: Array<{ symbol: string; exchange: string; price: number }> = []

    for (const [symbol, exchanges] of cache.entries()) {
        for (const [exchange, price] of exchanges.entries()) {
            result.push({ symbol, exchange, price })
        }
    }

    return result
}