import 'dotenv/config'

import { connectBinance } from './exchanges/binance'
import { connectKraken } from './exchanges/kraken'
import { updatePrice } from './priceCache'
import { checkArbitrage } from './detector'
import { Price } from './types'

console.log('CryptoArb MVP — Persistence + Notifications\n')

function onPrice(price: Price): void {
    const time = new Date().toLocaleTimeString('pt-BR')

    console.log(
        `[${time}] ${price.exchange.padEnd(8)} ${price.symbol.padEnd(10)} ` +
        `$${price.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    )

    updatePrice(price)

    // fire-and-forget: não espera o resultado para não bloquear o próximo tick
    checkArbitrage(price.symbol).catch(console.error)
}

connectBinance(onPrice)
connectKraken(onPrice)