import nodemailer from 'nodemailer'
import { OpportunityData } from './db'

// Carrega variáveis de ambiente
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL

// Verifica se email está configurado
const isEmailEnabled =
    Boolean(GMAIL_USER) &&
    Boolean(GMAIL_APP_PASSWORD) &&
    Boolean(NOTIFICATION_EMAIL)

// Cria transporter uma única vez (reutilizado em todos os envios)
const transporter = isEmailEnabled
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD,
        },
    })
    : null

export async function sendOpportunityEmail(opp: OpportunityData): Promise<void> {
    if (!transporter || !NOTIFICATION_EMAIL) {
        console.log('[Mailer] Email disabled — skipping notification')
        return
    }

    const subject = `🚨 CryptoArb: ${opp.symbol} spread ${opp.spread.toFixed(2)}%`

    const html = `
    <div style="font-family: monospace; max-width: 480px; padding: 24px; background: #0a0a0a; color: #ededed; border-radius: 8px;">
      <h2 style="margin: 0 0 16px; color: #22c55e;">🚨 Arbitrage Opportunity</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #888;">Pair</td>
          <td style="padding: 6px 0; font-weight: bold;">${opp.symbol}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888;">Spread</td>
          <td style="padding: 6px 0; color: #22c55e; font-weight: bold;">${opp.spread.toFixed(3)}%</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888;">Buy at</td>
          <td style="padding: 6px 0;">${opp.buyExchange} — $${opp.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888;">Sell at</td>
          <td style="padding: 6px 0;">${opp.sellExchange} — $${opp.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #888;">Profit/unit</td>
          <td style="padding: 6px 0; color: #22c55e; font-weight: bold;">$${opp.profit.toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin: 20px 0 0; font-size: 11px; color: #555;">
        Detected at ${new Date().toLocaleString('pt-BR')} · CryptoArb MVP 3
      </p>
    </div>
  `

    await transporter.sendMail({
        from: `CryptoArb <${GMAIL_USER}>`,
        to: NOTIFICATION_EMAIL,
        subject,
        html,
    })

    console.log(`[Mailer] ✉️  Email sent for ${opp.symbol} (${opp.spread.toFixed(2)}% spread)`)
}