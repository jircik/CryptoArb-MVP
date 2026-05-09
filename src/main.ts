import WebSocket from 'ws';

// URL do stream público da Binance
const WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';

console.log('Connecting to Binance WebSocket...');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('Connected! Waiting for prices...\n');
});

ws.on('message', (data: Buffer) => {
    const msg = JSON.parse(data.toString());

    // msg.c = preço atual (last price)
    // msg.P = variação % nas últimas 24h
    // msg.v = volume nas últimas 24h
    const price    = parseFloat(msg.c);
    const change   = parseFloat(msg.P);
    const volume   = parseFloat(msg.v);
    const time     = new Date().toLocaleTimeString('pt-BR');

    const direction = change >= 0 ? '▲' : '▼';
    const sign      = change >= 0 ? '+' : '';

    console.log(
        `[${time}] BTC/USDT  $${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}  ` +
        `${direction} ${sign}${change.toFixed(2)}%  ` +
        `Vol: ${volume.toFixed(2)} BTC`
    );
});

ws.on('error', (err: Error) => {
    console.error('WebSocket Error:', err.message);
});

ws.on('close', () => {
    console.log('Connection closed.');
});