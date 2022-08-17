import { ethers } from 'hardhat'
import { BigNumber, Contract } from 'ethers'
import { getAllPairs, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '../config/tokens'
import { Input, Quote, RouterPairQuoteMap, TokenPair } from '../types'
import {
    compressedTokenStringToToken,
    routerPair,
    routerPairToString,
    tokenPairCompressedString,
} from './util'
import { parseUnits } from 'ethers/lib/utils'
import { ContractCallResults, Multicall } from 'ethereum-multicall'
import { PROVIDERS } from '../config/providers'
import { DeployedMultiCall2 } from '../deployed/multicall2'
import { DeployedDexAggregator } from '../deployed/dexAggregator'

const multicall = new Multicall({
    nodeUrl: PROVIDERS.local,
    tryAggregate: true,
    multicallCustomContractAddress: DeployedMultiCall2.address,
})

export const quote = async (): Promise<Quote[]> => {
    const mcResults = await multicallQuotes()

    return mcResults.filter((it) => !it.amount.isZero())
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

export const multicallQuotes = async (): Promise<Quote[]> => {
    const pairs = getAllPairs()

    const multicallContext = {
        reference: 'pairQuotes',
        contractAddress: DeployedDexAggregator.address,
        abi: DeployedDexAggregator.abi,
        calls: pairs.map((pair: TokenPair) => {
            const quoteAmountIn = ethers.utils.parseUnits(
                '1',
                TOKEN_DECIMALS[pair.tokenIn]
            )

            return {
                reference: tokenPairCompressedString(pair),
                methodName: 'listAmountOut',
                methodParameters: [
                    quoteAmountIn,
                    TOKEN_ADDRESSES[pair.tokenIn],
                    TOKEN_ADDRESSES[pair.tokenOut],
                ],
            }
        }),
    }

    const pairQuotes2 = await multicall.call(multicallContext)

    const results = pairQuotes2.results.pairQuotes.callsReturnContext

    const mappedResults = results
        .filter((it) => it.success)
        .map((it) => {
            const tokenPair = compressedTokenStringToToken(it.reference)
            return it.returnValues.map((value, idx) => {
                return {
                    pair: routerPair(
                        idx,
                        tokenPair.tokenIn,
                        tokenPair.tokenOut
                    ),
                    amount: BigNumber.from(value),
                }
            })
        })
        .reduce((result, quotes) => [...result, ...quotes], [])

    return mappedResults
}
