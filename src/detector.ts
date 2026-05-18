import { getPrices } from './priceCache'

const SPREAD_THRESHOLD = 0.5 // porcentagem mínima para alertar (0.5%)

export function checkArbitrage(symbol: string): void {
    const prices = getPrices(symbol)

    // Precisa de pelo menos 2 exchanges para comparar
    if (!prices || prices.size < 2) return

    const entries = Array.from(prices.entries())
    // entries = [['binance', 67432.10], ['kraken', 67500.00]]

    // Encontra a exchange com menor e maior preço
    let buyExchange = entries[0][0]
    let buyPrice = entries[0][1]
    let sellExchange = entries[0][0]
    let sellPrice = entries[0][1]

    for (const [exchange, price] of entries) {
        if (price < buyPrice) {
            buyPrice = price
            buyExchange = exchange
        }
        if (price > sellPrice) {
            sellPrice = price
            sellExchange = exchange
        }
    }

    // Calcula spread
    const spread = ((sellPrice - buyPrice) / buyPrice) * 100

    if (spread >= SPREAD_THRESHOLD) {
        const time = new Date().toLocaleTimeString('pt-BR')
        const profit = sellPrice - buyPrice

        console.log('\n' + '═'.repeat(55))
        console.log(`🚨 OPORTUNIDADE DETECTADA  [${time}]`)
        console.log('═'.repeat(55))
        console.log(`   Par:       ${symbol}`)
        console.log(`   Spread:    ${spread.toFixed(3)}%`)
        console.log(`   Compra em: ${buyExchange.padEnd(10)} $${buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
        console.log(`   Vende em:  ${sellExchange.padEnd(10)} $${sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
        console.log(`   Lucro/un:  $${profit.toFixed(2)}`)
        console.log('═'.repeat(55) + '\n')
    }
}