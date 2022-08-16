import { ethers } from 'hardhat'
import { BigNumber, Contract } from 'ethers'
import { getAllPairs, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '../config/tokens'
import { Input, Quote, RouterPairQuoteMap, TokenPair } from '../types'
import { routerPairToString } from './util'
import { parseUnits } from 'ethers/lib/utils'
import { Multicall } from 'ethereum-multicall'
import { PROVIDERS } from '../config/providers'
import { DeployedMultiCall2 } from '../deployed/multicall2'
import { DeployedDexAggregator } from '../deployed/dexAggregator'

const multicall = new Multicall({
    nodeUrl: PROVIDERS.local,
    tryAggregate: true,
    multicallCustomContractAddress: DeployedMultiCall2.address,
})

export const quote = async (dexAggregator: Contract):Promise<Quote[]>  => {
    const pairs = getAllPairs()

    // const multicallContext = {
    //     reference: 'pairQuotes',
    //     contractAddress: DeployedDexAggregator.address,
    //     abi: DeployedDexAggregator.abi,
    //     calls: pairs.map((pair: TokenPair) => {
    //         const quoteAmountIn = ethers.utils.parseUnits(
    //             '1',
    //             TOKEN_DECIMALS[pair.tokenIn]
    //         )

    //         return {
    //             reference: pair.tokenIn + ',' + pair.tokenOut,
    //             methodName: 'listAmountOut',
    //             methodParameters: [
    //                 quoteAmountIn,
    //                 TOKEN_ADDRESSES[pair.tokenIn],
    //                 TOKEN_ADDRESSES[pair.tokenOut],
    //             ],
    //         }
    //     }),
    // }

    // const pairQuotes = await multicall.call(multicallContext)

    // console.log(pairQuotes)

    // return []

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
