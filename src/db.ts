
import { PrismaClient } from './generated/prisma/client'
import {PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export interface OpportunityData {
    symbol: string
    buyExchange: string
    buyPrice: number
    sellExchange: string
    sellPrice: number
    spread: number
    profit: number
}

export async function saveOpportunity(data: OpportunityData): Promise<void> {
    await prisma.opportunity.create({ data })
}

export async function getRecentOpportunities(limit = 20, symbol?: string) {
    return prisma.opportunity.findMany({
        where: symbol ? { symbol } : undefined,
        orderBy: { detectedAt: 'desc' },
        take: limit,
    })
}

export async function getOpportunityById(id: number) {
    return prisma.opportunity.findUnique({
        where: { id },
    })
}

// Fecha a conexão graciosamente ao encerrar o processo
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})