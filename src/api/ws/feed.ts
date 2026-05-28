import { WebSocket } from '@fastify/websocket'

// Set of all currently connected dashboard clients
const clients = new Set<WebSocket>()

/**
 * Register a new connected client
 */
export function addClient(ws: WebSocket): void {
    clients.add(ws)
    ws.on('close', () => clients.delete(ws))
}

/**
 * Broadcast an opportunity to all connected clients
 * Called by detector.ts when spread is detected
 */
export function broadcastOpportunity(opportunity: object): void {
    const message = JSON.stringify({ type: 'opportunity', data: opportunity })

    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(message)
        }
    }
}

/**
 * Broadcast a price update to all connected clients
 * Called by main.ts on every price tick
 */
export function broadcastPrice(price: object): void {
    const message = JSON.stringify({ type: 'price', data: price })

    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(message)
        }
    }
}