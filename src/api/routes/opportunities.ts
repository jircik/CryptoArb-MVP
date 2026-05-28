import { FastifyInstance } from 'fastify'
import { getRecentOpportunities, getOpportunityById } from '../../db'

export async function opportunitiesRoutes(fastify: FastifyInstance) {

    // GET /opportunities
    // Query params: limit (default 20), symbol (optional filter)
    fastify.get('/opportunities', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                    symbol: { type: 'string' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'array' },
                        count: { type: 'integer' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { limit = 20, symbol } = request.query as {
            limit?: number
            symbol?: string
        }

        const opportunities = await getRecentOpportunities(limit, symbol)

        return reply.send({
            data: opportunities,
            count: opportunities.length,
        })
    })

    // GET /opportunities/:id
    fastify.get('/opportunities/:id', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: number }
        const opportunity = await getOpportunityById(id)

        if (!opportunity) {
            return reply.status(404).send({ error: 'Opportunity not found' })
        }

        return reply.send(opportunity)
    })
}