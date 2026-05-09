# CryptoArb

Real-time cryptocurrency price monitor via Binance WebSocket.

Logs live prices from multiple trading pairs directly to the console — no API key, no account, no setup required.

> MVP 1 of a larger arbitrage detection system. Future versions will compare prices across multiple exchanges and alert when a profitable spread is detected.

## Demo

```
Conecting - monitoring: BTCUSDT, ETHUSDT, BNBUSDT

Connected! Waiting prices...

[14:23:01] BTC/USDT   $67,432.10   ▲  +2.34%  Vol: 18423.50
[14:23:01] ETH/USDT    $3,521.44   ▲  +1.87%  Vol: 95210.33
[14:23:02] BNB/USDT      $412.80   ▼  -0.45%  Vol: 32100.12
```

## Stack

- **Node.js 20+** + **TypeScript**
- **ws** — WebSocket client
- **tsx** — TypeScript execution for development
- **Binance Public WebSocket Streams** — no authentication required

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/crypto-arb.git
cd crypto-arb

# Install dependencies
npm install

# Run
npm run dev
```

## Roadmap

- [x] **MVP 1** — Connect to Binance WebSocket and log prices to console
- [ ] **MVP 2** — Add a second exchange (Kraken), compare prices in real time, alert on favorable spread
- [ ] **MVP 3** — Persist opportunities to database, send email notifications, production-ready service

## License

MIT