import WebSocket from 'ws'
import { OnPrice } from '../types'

// Pares que você quer monitorar na Binance
// Formato: lowercase + 'usdt' (ex: 'btcusdt')
const PAIRS = ['btcusdt', 'ethusdt']

// Combined stream: múltiplos pares numa única conexão
const streams = PAIRS.map(p => `${p}@ticker`).join('/')
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${streams}`

export function connectBinance(onPrice: OnPrice): void {
    console.log('[Binance] Connecting...')

    const ws = new WebSocket(WS_URL)

    ws.on('open', () => {
        console.log('[Binance] Connected')
    })

    ws.on('message', (data: Buffer) => {
        try {
            const envelope = JSON.parse(data.toString())
            const msg = envelope.data

            // Ignora mensagens que não são ticker (ex: confirmações de subscrição)
            if (!msg || msg.e !== '24hrTicker') return

            onPrice({
                exchange: 'binance',
                symbol: msg.s as string,           // ex: 'BTCUSDT'
                price: parseFloat(msg.c as string), // msg.c = last price
                timestamp: new Date(),
            })
        } catch {
            // ignora mensagens mal formadas silenciosamente
        }
    })

    ws.on('error', (err: Error) => {
        console.error('[Binance] Error:', err.message)
    })

    ws.on('close', () => {
        console.log('[Binance] Connection ended. Reconnecting in 5s...')
        setTimeout(() => connectBinance(onPrice), 5000)
    })
}