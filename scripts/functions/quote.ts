import { ethers } from 'hardhat'
import { BigNumber, Contract } from 'ethers'
import { getAllPairs, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '../config/tokens'
import { Input, Quote, RouterPairQuoteMap, TokenPair } from '../types'
import { routerPairToString } from './util'
import { parseUnits } from 'ethers/lib/utils'

export const quote = async (dexAggregator: Contract) => {
    const pairs = getAllPairs()

    const pairQuotes: Quote[] = (
        await Promise.all(
            pairs.map(async (pair: TokenPair) => {
                const quoteAmountIn = ethers.utils.parseUnits(
                    '1',
                    TOKEN_DECIMALS[pair.tokenIn]
                )
                const amounts: BigNumber[] = await dexAggregator.listAmountOut(
                    quoteAmountIn,
                    TOKEN_ADDRESSES[pair.tokenIn],
                    TOKEN_ADDRESSES[pair.tokenOut]
                )

                return amounts.map((amount, idx) => {
                    return {
                        pair: { pair, router: idx },
                        amount,
                    }
                })
            })
        )
    )
        .reduce((result, pairQuotes) => [...result, ...pairQuotes], [])
        .filter((it) => !it.amount.isZero())

    return pairQuotes
}

export const quotesToQuoteMap = (quotes: Quote[]): RouterPairQuoteMap => {
    return quotes.reduce(
        (result, quote) => ({
            ...result,
            [routerPairToString(quote.pair)]: quote.amount,
        }),
        {}
    )
}
