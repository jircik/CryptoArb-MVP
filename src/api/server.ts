import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { opportunitiesRoutes } from './routes/opportunities'
import { pricesRoutes } from './routes/prices'
import { addClient } from './ws/feed'

const PORT = parseInt(process.env.API_PORT ?? '3001')
const HOST = process.env.API_HOST ?? '0.0.0.0'

export async function buildServer() {
    const fastify = Fastify({
        logger: {
            transport: process.env.NODE_ENV !== 'production'
                ? { target: 'pino-pretty', options: { colorize: true } }
                : undefined,
        },
    })

    // Plugins
    await fastify.register(cors, {
        origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', // Next.js default port
        methods: ['GET'],
    })

    await fastify.register(websocket)

    // REST routes
    await fastify.register(opportunitiesRoutes, { prefix: '/api' })
    await fastify.register(pricesRoutes, { prefix: '/api' })

    // Health check
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

    // WebSocket feed — dashboard connects here to receive live updates
    fastify.register(async (fastifyWs) => {
        fastifyWs.get('/api/feed', { websocket: true }, (socket) => {
            fastify.log.info('Dashboard client connected to feed')
            addClient(socket)

            // Send current prices immediately on connect (initial state)
            socket.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to CryptoArb live feed',
            }))
        })
    })

    return fastify
}

export async function startServer() {
    const fastify = await buildServer()

    try {
        await fastify.listen({ port: PORT, host: HOST })
        console.log(`\nAPI running at http://localhost:${PORT}`)
        console.log(`WebSocket feed at ws://localhost:${PORT}/api/feed\n`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }

    return fastify
}