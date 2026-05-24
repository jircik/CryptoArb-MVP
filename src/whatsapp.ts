const EVOLUTION_URL = process.env.EVOLUTION_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER

const isWhatsAppEnabled =
    Boolean(EVOLUTION_URL) &&
    Boolean(EVOLUTION_API_KEY) &&
    Boolean(EVOLUTION_INSTANCE) &&
    Boolean(WHATSAPP_NUMBER)

export interface OpportunityMessage {
    symbol: string
    buyExchange: string
    buyPrice: number
    sellExchange: string
    sellPrice: number
    spread: number
    profit: number
}

function formatMessage(opp: OpportunityMessage): string {
    const time = new Date().toLocaleTimeString('pt-BR')
    const profitFormatted = opp.profit.toFixed(2)
    const spreadFormatted = opp.spread.toFixed(3)
    const buyPrice = opp.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })
    const sellPrice = opp.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })

    return (
        `🚨 *CryptoArb — Oportunidade Detectada*\n\n` +
        `📊 *Par:* ${opp.symbol}\n` +
        `📈 *Spread:* ${spreadFormatted}%\n\n` +
        `🟢 *Compra em* ${opp.buyExchange}\n` +
        `    $${buyPrice}\n\n` +
        `🔴 *Vende em* ${opp.sellExchange}\n` +
        `    $${sellPrice}\n\n` +
        `💰 *Lucro/unidade:* $${profitFormatted}\n\n` +
        `🕐 ${time}`
    )
}

export async function sendWhatsAppNotification(opp: OpportunityMessage): Promise<void> {
    if (!isWhatsAppEnabled) {
        console.log('[WhatsApp] Disabled — skipping notification')
        return
    }

    try {
        const url = `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY!,
            },
            body: JSON.stringify({
                number: WHATSAPP_NUMBER,
                text: formatMessage(opp),
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error(`[WhatsApp] ❌ Failed (${response.status}):`, error)
            return
        }

        console.log(`[WhatsApp] ✅ Message sent for ${opp.symbol} (${opp.spread.toFixed(2)}% spread)`)
    } catch (err) {
        console.error('[WhatsApp] ❌ Error:', err)
    }
}