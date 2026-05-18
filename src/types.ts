export interface Price {
    exchange: string
    symbol: string
    price: number
    timestamp: Date
}

export type OnPrice = (price: Price) => void