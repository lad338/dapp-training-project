import { BigNumber } from 'ethers'
import { TOKEN } from './config/tokens'

export type TokenPair = {
    tokenIn: TOKEN
    tokenOut: TOKEN
}

export type Route = RouterPair[]

export type Path = string[]

export type RouterPair = {
    pair: TokenPair
    router: number
}

export type Quote = {
    pair: RouterPair
    amount: BigNumber
}

export type AmountOutInput = {
    tokenIn: TOKEN
    tokenOut: TOKEN
    amount: BigNumber
}

export type RouterPairQuoteMap = {
    [pair: string]: BigNumber
}

export type RouteQuote = {
    quote: BigNumber
    decimal: number
}

export type SubPath = {
    router: number
    path: Path
}

export type Input = {
    tokenIn: TOKEN
    tokenOut: TOKEN
    amount: number
}
