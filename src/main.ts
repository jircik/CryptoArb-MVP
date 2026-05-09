import WebSocket from 'ws';

// Combined stream: múltiplos pares numa única conexão
const PAIRS = ['btcusdt', 'ethusdt', 'bnbusdt'];
const streams = PAIRS.map(p => `${p}@ticker`).join('/');
const WS_URL = `wss://stream.binance.com:9443/stream?streams=${streams}`;

console.log(`Connected - monitoring: ${PAIRS.map(p => p.toUpperCase()).join(', ')}\n`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('Connected! Waiting prices...\n');
});

ws.on('message', (data: Buffer) => {
    // Combined stream envolve os dados em { stream, data }
    const envelope = JSON.parse(data.toString());
    const msg = envelope.data;

    const symbol   = (msg.s as string).replace('USDT', '/USDT');
    const price    = parseFloat(msg.c);
    const change   = parseFloat(msg.P);
    const volume   = parseFloat(msg.v);
    const time     = new Date().toLocaleTimeString('pt-BR');

    const direction = change >= 0 ? '▲' : '▼';
    const sign      = change >= 0 ? '+' : '';

    console.log(
        `[${time}] ${symbol.padEnd(10)} ` +
        `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 }).padStart(12)}  ` +
        `${direction} ${sign}${change.toFixed(2).padStart(6)}%  ` +
        `Vol: ${volume.toFixed(2)}`
    );
});

ws.on('error', (err: Error) => {
    console.error('WebSocket error:', err.message);
});

ws.on('close', () => {
    console.log('Connection closed.');
});