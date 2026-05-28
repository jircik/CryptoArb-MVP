import { FastifyInstance } from 'fastify'
import { getAllPrices } from '../../priceCache'

export async function pricesRoutes(fastify: FastifyInstance) {

    // GET /prices
    // Returns current snapshot of all cached prices
    fastify.get('/prices', {
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'array' },
                        updatedAt: { type: 'string' },
                    },
                },
            },
        },
    }, async (_request, reply) => {
        return reply.send({
            data: getAllPrices(),
            updatedAt: new Date().toISOString(),
        })
    })
}