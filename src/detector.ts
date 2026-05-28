import { getPrices } from './priceCache'
import { saveOpportunity } from './db'
import { sendOpportunityEmail } from './mailer'
import { sendWhatsAppNotification } from './whatsapp'
import { broadcastOpportunity } from './api/ws/feed'

const SPREAD_THRESHOLD = parseFloat(process.env.SPREAD_THRESHOLD ?? '0.5')

// Cooldown tracking
const lastNotified = new Map<string, number>()
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

function isOnCooldown(symbol: string): boolean {
    const last = lastNotified.get(symbol)
    if (!last) return false
    return Date.now() - last < COOLDOWN_MS
}

function markNotified(symbol: string): void {
    lastNotified.set(symbol, Date.now())
}

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

    console.log('\n' + '═'.repeat(55))
    console.log(`OPPORTUNITY DETECTED  [${time}]`)
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

    // Always persist and broadcast
    await Promise.all([
        saveOpportunity(opportunityData),
        Promise.resolve(broadcastOpportunity(opportunityData)),
    ])

    // Only notify via email + WhatsApp if not on cooldown
    if (!isOnCooldown(symbol)) {
        markNotified(symbol)
        await Promise.all([
            sendOpportunityEmail(opportunityData),
            sendWhatsAppNotification(opportunityData),
        ])
    } else {
        console.log(`[Detector] ${symbol} on cooldown — skipping notifications`)
    }
}