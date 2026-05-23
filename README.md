# CryptoArb

Real-time cryptocurrency arbitrage detector across multiple exchanges.

Connects simultaneously to Binance and Kraken, compares prices in real time, persists every detected opportunity to SQLite, and notifies you via Gmail when a profitable spread shows up — no exchange API key, no account, no paid service.

## Demo

```
CryptoArb MVP — Persistence + Notifications

[Binance] Connected
[Kraken] Connected

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
[Mailer] ✉️  Email sent for BTCUSDT (0.712% spread)
```

## Stack

- **Node.js 20+** + **TypeScript**
- **ws** — WebSocket client
- **tsx** — TypeScript execution for development
- **Prisma 7** (`prisma-client` generator) + **SQLite** via `@prisma/adapter-better-sqlite3`
- **Nodemailer** — Gmail SMTP for opportunity alerts
- **dotenv** — environment configuration
- **Binance Public WebSocket Streams** — no authentication required
- **Kraken Public WebSocket v2** — no authentication required

## How it works

Each exchange has its own data format. CryptoArb normalizes both into a common `Price` type, stores the latest price per exchange in memory, and checks the spread on every new tick. When the spread crosses the configured threshold, the opportunity is persisted to SQLite and an email is dispatched — both run in parallel so they don't block the next price tick.

```
Binance WS ──→ binance adapter ──→ Price { exchange, symbol, price }
                                        ↓
Kraken WS  ──→ kraken adapter  ──→  price cache (Map)
                                        ↓
                                    spread detector
                                        ↓
                          ┌─────────────┴─────────────┐
                          ↓                           ↓
                    SQLite (Prisma)           Gmail (Nodemailer)
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

# Create the SQLite database and apply migrations
npx prisma migrate dev --name init

# Run
npm run dev
```

## Configuration

All runtime configuration lives in `.env` (see `.env.example`):

```env
DATABASE_URL="file:./dev.db"

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
NOTIFICATION_EMAIL=your-email@gmail.com

SPREAD_THRESHOLD=0.5   # alert when spread >= 0.5%
```

Trading pairs are configured per adapter:

- `src/exchanges/binance.ts` → `const PAIRS = ['btcusdt', 'ethusdt']`
- `src/exchanges/kraken.ts` → `const PAIRS = ['BTC/USD', 'ETH/USD']`

### Gmail App Password

Gmail blocks regular passwords over SMTP. Generate an App Password at
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
(2-step verification must be enabled) and paste the 16-character string into
`GMAIL_APP_PASSWORD` without spaces. If the env vars are missing, the mailer
silently no-ops and the app keeps running.

### Inspecting the database

```bash
npx prisma studio    # opens a web UI at localhost:5555
```

## Project Structure

```
src/
├── exchanges/
│   ├── binance.ts          # Binance WebSocket adapter
│   └── kraken.ts           # Kraken WebSocket adapter
├── generated/prisma/       # Prisma Client (generated, gitignored)
├── types.ts                # Shared Price type
├── priceCache.ts           # In-memory price store
├── detector.ts             # Spread detection + persistence + notification
├── db.ts                   # Prisma client + saveOpportunity
├── mailer.ts               # Gmail SMTP transport + sendOpportunityEmail
└── main.ts                 # Entry point (loads dotenv first)

prisma/
├── schema.prisma           # Opportunity model
└── migrations/             # SQL migration history

prisma.config.ts            # Prisma 7 config (DATABASE_URL lives here)
```

## Roadmap

- [x] **MVP 1** — Connect to Binance WebSocket and log prices to console
- [x] **MVP 2** — Add Kraken, compare prices in real time, alert on favorable spread
- [x] **MVP 3** — Persist opportunities to SQLite (Prisma) and send Gmail notifications
- [ ] **MVP 4** — Per-symbol notification cooldown, REST API (Fastify), Next.js dashboard, deploy to Railway with PostgreSQL

## License

MIT
