# CryptoArb

Real-time cryptocurrency arbitrage detector across multiple exchanges.

Connects simultaneously to Binance and Kraken, compares prices in real time, and alerts when a profitable spread is detected, no API key, no account, no setup required.

> MVP of a crypto arbitrage detection system. Future versions will persist opportunities to a database and send email notifications.

## Demo

```
🚀 CryptoArb MVP 2 — Multi-Exchange Monitor

[Binance] ✅ Connected
[Kraken]  ✅ Connected

[14:23:01] binance   BTCUSDT    $67,432.10
[14:23:01] kraken    BTCUSDT    $67,500.00
[14:23:02] binance   ETHUSDT     $3,521.44
[14:23:02] kraken    ETHUSDT     $3,519.80

═══════════════════════════════════════════════════════
🚨 OPPORTUNITY DETECTED  [14:23:05]
═══════════════════════════════════════════════════════
   Pair:      BTCUSDT
   Spread:    0.712%
   Buy at:    binance    $67,200.00
   Sell at:   kraken     $67,678.40
   Profit:    $478.40/unit
═══════════════════════════════════════════════════════
```

## Stack

- **Node.js 20+** + **TypeScript**
- **ws** — WebSocket client
- **tsx** — TypeScript execution for development
- **Binance Public WebSocket Streams** — no authentication required
- **Kraken Public WebSocket v2** — no authentication required

## How it works

Each exchange has its own data format. CryptoArb normalizes both into a common `Price` type, stores the latest price per exchange in memory, and checks the spread on every new tick.

```
Binance WS ──→ binance adapter ──→ Price { exchange, symbol, price }
                                        ↓
Kraken WS  ──→ kraken adapter  ──→  price cache (Map)
                                        ↓
                                    spread detector
                                        ↓
                                    console alert (if spread ≥ threshold)
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jircik/CryptoArb-MVP.git
cd CryptoArb-MVP

# Install dependencies
npm install

# Run
npm run dev
```

## Configuration

The spread threshold is defined in `src/detector.ts`:

```typescript
const SPREAD_THRESHOLD = 0.5 // alert when spread >= 0.5%
```

Trading pairs are configured per adapter:

- `src/exchanges/binance.ts` → `const PAIRS = ['btcusdt', 'ethusdt']`
- `src/exchanges/kraken.ts` → `const PAIRS = ['BTC/USD', 'ETH/USD']`

## Project Structure

```
src/
├── exchanges/
│   ├── binance.ts   # Binance WebSocket adapter
│   └── kraken.ts    # Kraken WebSocket adapter
├── types.ts         # Shared Price type
├── priceCache.ts    # In-memory price store
├── detector.ts      # Spread detection logic
└── main.ts          # Entry point
```

## Roadmap

- [x] **MVP 1** — Connect to Binance WebSocket and log prices to console
- [x] **MVP 2** — Add Kraken, compare prices in real time, alert on favorable spread
- [ ] **MVP 3** — Persist opportunities to PostgreSQL, send email notifications, production-ready service

## License

MIT
