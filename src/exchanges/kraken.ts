import WebSocket from 'ws'
import { OnPrice } from '../types'

const WS_URL = 'wss://ws.kraken.com/v2'

// Pares no formato da Kraken: 'BTC/USD', 'ETH/USD'
// Nota: Kraken usa USD, Binance usa USDT — preços são comparáveis na prática
const PAIRS = ['BTC/USD', 'ETH/USD']

// Normaliza símbolo da Kraken para o formato padrão do projeto
// 'BTC/USD' → 'BTCUSDT'
function normalizeSymbol(krakenSymbol: string): string {
    return krakenSymbol.replace('/', '').replace('USD', 'USDT')
}

export function connectKraken(onPrice: OnPrice): void {
    console.log('[Kraken] Connecting...')

    const ws = new WebSocket(WS_URL)

    ws.on('open', () => {
        console.log('[Kraken] Connected')

        // Envia subscrição logo após conectar
        ws.send(JSON.stringify({
            method: 'subscribe',
            params: {
                channel: 'ticker',
                symbol: PAIRS,
            },
        }))
    })

    ws.on('message', (data: Buffer) => {
        try {
            const msg = JSON.parse(data.toString())

            // Só processa mensagens do canal ticker com dados reais
            if (msg.channel !== 'ticker') return
            if (!msg.data || !Array.isArray(msg.data)) return

            for (const ticker of msg.data) {
                // ticker.last = último preço negociado
                if (!ticker.last || !ticker.symbol) continue

                onPrice({
                    exchange: 'kraken',
                    symbol: normalizeSymbol(ticker.symbol as string), // 'BTC/USD' → 'BTCUSDT'
                    price: ticker.last as number,
                    timestamp: new Date(),
                })
            }
        } catch {
            // ignora mensagens malformadas silenciosamente
        }
    })

    ws.on('error', (err: Error) => {
        console.error('[Kraken] Error:', err.message)
    })

    ws.on('close', () => {
        console.log('[Kraken] Connection ended. Reconnecting in 5s...')
        setTimeout(() => connectKraken(onPrice), 5000)
    })
}