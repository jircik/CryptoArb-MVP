# CryptoArb

Real-time cryptocurrency arbitrage detector across multiple exchanges, with a live REST + WebSocket API.

Connects simultaneously to Binance and Kraken, compares prices in real time, persists every detected opportunity to SQLite, notifies via Gmail and WhatsApp, and exposes a Fastify API for the dashboard to consume.

## Demo

```
🌐 API running at http://localhost:3001
📡 WebSocket feed at ws://localhost:3001/api/feed

[Binance] ✅ Connected
[Kraken]  ✅ Connected

[14:23:01] binance   BTCUSDT    $67,432.10
[14:23:01] kraken    BTCUSDT    $67,500.00

═══════════════════════════════════════════════════════
🚨 OPPORTUNITY DETECTED  [14:23:05]
═══════════════════════════════════════════════════════
   Pair:      BTCUSDT
   Spread:    0.712%
   Buy at:    binance    $67,200.00
   Sell at:   kraken     $67,678.40
   Profit:    $478.40/unit
═══════════════════════════════════════════════════════
[Mailer]   ✉️  Email sent for BTCUSDT (0.712% spread)
[WhatsApp] ✅  Message sent for BTCUSDT (0.712% spread)
```

## Stack

- **Node.js 20+** + **TypeScript**
- **ws** — WebSocket client for exchange streams
- **Fastify** — REST API and WebSocket feed server
- **@fastify/cors** + **@fastify/websocket** — Fastify plugins
- **Prisma 7** + **SQLite** — opportunity persistence
- **Nodemailer** — Gmail SMTP notifications
- **Evolution API** — WhatsApp notifications (self-hosted)
- **dotenv** + **pino-pretty** — configuration and logging
- **Binance Public WebSocket Streams** — no authentication required
- **Kraken Public WebSocket v2** — no authentication required

## How it works

Each exchange has its own data format. CryptoArb normalizes both into a common `Price` type, stores the latest price per exchange in memory, and checks the spread on every tick. When the spread crosses the configured threshold, the opportunity is persisted, broadcast to all connected dashboard clients, and notifications fire (subject to a 5-minute per-symbol cooldown).

```
Binance WS ──→ binance adapter ──→ Price { exchange, symbol, price }
                                        ↓
Kraken WS  ──→ kraken adapter  ──→  price cache (Map)
                                        ↓
                                    spread detector
                                        ↓
              ┌─────────────────────────┼──────────────────────┐
              ↓                         ↓                      ↓
       SQLite (Prisma)         WS feed broadcast     email + WhatsApp
                                                     (5min cooldown)
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/prices` | Current price snapshot across all exchanges |
| `GET` | `/api/opportunities` | Opportunity history (supports `?limit=20&symbol=BTCUSDT`) |
| `GET` | `/api/opportunities/:id` | Single opportunity detail |
| `WS` | `/api/feed` | Live stream of price updates and detections |

### WebSocket feed message types

```json
{ "type": "connected", "message": "Connected to CryptoArb live feed" }
{ "type": "price", "data": { "symbol": "BTCUSDT", "exchange": "binance", "price": 76595.98 } }
{ "type": "opportunity", "data": { "symbol": "BTCUSDT", "spread": 0.712, "buyExchange": "binance", ... } }
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jircik/CryptoArb-MVP.git
cd CryptoArb-MVP

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env

# Create the SQLite database
npx prisma migrate dev --name init

# Run
npm run dev
```

## Configuration

All runtime configuration lives in `.env` (see `.env.example`):

```env
# Database
DATABASE_URL="file:./dev.db"

# API server
API_PORT=3001
API_HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000

# Spread threshold (0.5 = 0.5%)
SPREAD_THRESHOLD=0.5

# Gmail (optional — skipped silently if missing)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
NOTIFICATION_EMAIL=your-email@gmail.com

# WhatsApp via Evolution API (optional — skipped silently if missing)
EVOLUTION_URL=http://localhost:8088
EVOLUTION_API_KEY=your-evolution-api-key
EVOLUTION_INSTANCE=cryptoArb
WHATSAPP_NUMBER=5500000000000
```

Trading pairs are configured per adapter:

- `src/exchanges/binance.ts` → `const PAIRS = ['btcusdt', 'ethusdt']`
- `src/exchanges/kraken.ts` → `const PAIRS = ['BTC/USD', 'ETH/USD']`

### Gmail App Password

Gmail blocks regular passwords over SMTP. Generate an App Password at
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
(requires 2-step verification) and paste the 16-character string into
`GMAIL_APP_PASSWORD` without spaces.

### WhatsApp via Evolution API

CryptoArb sends WhatsApp notifications through a self-hosted [Evolution API](https://github.com/EvolutionAPI/evolution-api) instance. See [`evolutionAPI/`](./evolutionAPI/) for the Docker Compose setup. If any of the `EVOLUTION_*` env vars are missing, WhatsApp notifications are silently skipped.

### Inspecting the database

```bash
npx prisma studio    # opens a web UI at localhost:5555
```

## Project Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── opportunities.ts    # GET /api/opportunities
│   │   └── prices.ts           # GET /api/prices
│   ├── ws/
│   │   └── feed.ts             # WebSocket broadcaster
│   └── server.ts               # Fastify setup
├── exchanges/
│   ├── binance.ts              # Binance WebSocket adapter
│   └── kraken.ts               # Kraken WebSocket adapter
├── generated/prisma/           # Prisma Client (generated, gitignored)
├── types.ts                    # Shared Price type
├── priceCache.ts               # In-memory price store
├── detector.ts                 # Spread detection + cooldown + notifications
├── db.ts                       # Prisma client + DB queries
├── mailer.ts                   # Gmail SMTP transport
├── whatsapp.ts                 # Evolution API WhatsApp client
└── main.ts                     # Entry point

prisma/
├── schema.prisma               # Opportunity model
└── migrations/                 # SQL migration history

evolutionAPI/                   # Self-hosted WhatsApp gateway
├── docker-compose.yaml
├── nginx.conf
└── .env.example
```

## Roadmap

- [x] **MVP 1** — Connect to Binance WebSocket and log prices to console
- [x] **MVP 2** — Add Kraken, compare prices in real time, alert on favorable spread
- [x] **MVP 3** — Persist to SQLite, Gmail + WhatsApp notifications via Evolution API
- [x] **MVP 4** — Fastify REST API + WebSocket feed + notification cooldown
- [ ] **MVP 5** — Next.js dashboard consuming the live API

## License

MIT