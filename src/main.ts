import 'dotenv/config'
import { connectBinance } from './exchanges/binance'
import { connectKraken } from './exchanges/kraken'
import { updatePrice } from './priceCache'
import { checkArbitrage } from './detector'
import { startServer } from './api/server'
import { broadcastPrice } from './api/ws/feed'
import { Price } from './types'

async function main() {
    // Start API server first
    await startServer()

    // Price handler — same as before, now also broadcasts to WS clients
    function onPrice(price: Price): void {
        const time = new Date().toLocaleTimeString('pt-BR')

        console.log(
            `[${time}] ${price.exchange.padEnd(8)} ${price.symbol.padEnd(10)} ` +
            `$${price.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        )

        updatePrice(price)
        broadcastPrice(price)
        checkArbitrage(price.symbol).catch(console.error)
    }

    connectBinance(onPrice)
    connectKraken(onPrice)
}

main().catch(console.error)