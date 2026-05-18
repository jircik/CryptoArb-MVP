import { connectBinance } from './exchanges/binance'
import { connectKraken } from './exchanges/kraken'
import { updatePrice } from './priceCache'
import { checkArbitrage } from './detector'
import { Price } from './types'

console.log('🚀 CryptoArb MVP 2 — Multi-Exchange Monitor\n')

// Handler compartilhado: chega novo preço → atualiza cache → checa spread
function onPrice(price: Price): void {
    const time = new Date().toLocaleTimeString('pt-BR')

    // Loga o preço recebido
    console.log(
        `[${time}] ${price.exchange.padEnd(8)} ${price.symbol.padEnd(10)} ` +
        `$${price.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    )

    // Atualiza cache
    updatePrice(price)

    // Verifica se há oportunidade de arbitragem
    checkArbitrage(price.symbol)
}

// Conecta as duas exchanges com o mesmo handler
connectBinance(onPrice)
connectKraken(onPrice)