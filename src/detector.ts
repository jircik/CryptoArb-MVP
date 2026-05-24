import { getPrices } from './priceCache'
import { saveOpportunity } from './db'
import { sendOpportunityEmail } from './mailer'
import { sendWhatsAppNotification } from './whatsapp'

const SPREAD_THRESHOLD = parseFloat(process.env.SPREAD_THRESHOLD ?? '0.5')

export async function checkArbitrage(symbol: string): Promise<void> {
    const prices = getPrices(symbol)

    if (!prices || prices.size < 2) return

    const entries = Array.from(prices.entries())

    let buyExchange = entries[0][0]
    let buyPrice = entries[0][1]
    let sellExchange = entries[0][0]
    let sellPrice = entries[0][1]

    for (const [exchange, price] of entries) {
        if (price < buyPrice) { buyPrice = price; buyExchange = exchange }
        if (price > sellPrice) { sellPrice = price; sellExchange = exchange }
    }

    const spread = ((sellPrice - buyPrice) / buyPrice) * 100

    if (spread < SPREAD_THRESHOLD) return

    const profit = sellPrice - buyPrice
    const time = new Date().toLocaleTimeString('pt-BR')

    // Log no console (igual ao MVP 2)
    console.log('\n' + '═'.repeat(55))
    console.log(`🚨 OPPORTUNITY DETECTED  [${time}]`)
    console.log('═'.repeat(55))
    console.log(`   Pair:      ${symbol}`)
    console.log(`   Spread:    ${spread.toFixed(3)}%`)
    console.log(`   Buy at:    ${buyExchange.padEnd(10)} $${buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    console.log(`   Sell at:   ${sellExchange.padEnd(10)} $${sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
    console.log(`   Profit:    $${profit.toFixed(2)}/unit`)
    console.log('═'.repeat(55) + '\n')

    const opportunityData = {
        symbol,
        buyExchange,
        buyPrice,
        sellExchange,
        sellPrice,
        spread,
        profit,
    }

    // Persiste e notifica em paralelo (não bloqueia o próximo tick)
    await Promise.all([
        saveOpportunity(opportunityData),
        sendOpportunityEmail(opportunityData),
        sendWhatsAppNotification(opportunityData),
    ])
}