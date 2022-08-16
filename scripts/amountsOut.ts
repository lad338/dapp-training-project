import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { getAllPairs, TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { TOKEN, TOKEN_ADDRESSES } from './config/tokens'
import {
    calculateRouteQuote,
    computeAllRoutes,
    routeToSubPath,
} from './functions/computeRoutes'
import { AmountOutInput, Quote, TokenPair } from './types'
import { quote, quotesToQuoteMap } from './functions/quote'
import {
    bigNumberSorter,
    routerPairToString,
    routeToString,
    toComparableValue,
    toComparableValueToHumanReadable,
} from './functions/util'

const TEN = BigNumber.from(10)

const input = {
    tokenIn: TOKEN.WBTC,
    tokenOut: TOKEN.USDC,
    amount: BigNumber.from(1),
}

const main = async (input: AmountOutInput) => {
    const [signer] = await ethers.getSigners()
    console.log('signer address: ' + signer.address)

    const dexAggregatorAddress = DeployedDexAggregator.address
    console.log('dexAggregatorAddress: ' + dexAggregatorAddress)

    const dexAggregator = await ethers.getContractAt(
        'DexAggregator',
        dexAggregatorAddress
    )

    const pairQuotes = await quote(dexAggregator)

    console.log(
        pairQuotes.map((it) => ({
            ...it,
            display: routerPairToString(it.pair),
        }))
    )

    const quoteMap = quotesToQuoteMap(pairQuotes)

    const routes = computeAllRoutes(
        input.tokenIn,
        input.tokenOut,
        pairQuotes.map((it) => it.pair),
        5,
        new Set(),
        []
    )

    const routesWithQuotes = routes.map((route) => ({
        route,
        quote: calculateRouteQuote(route, quoteMap),
    }))

    const amounts = routesWithQuotes
        .map((route) => ({
            route: routeToString(route.route),
            quote: route.quote,
            calculatedQuote: toComparableValue(
                route.quote.quote,
                route.quote.decimal
            ),
            subPaths: routeToSubPath(route.route),
        }))
        .filter((it) => !it.calculatedQuote.isZero())

    const getAmountsOutResults = await Promise.all(
        amounts.map(async (it) => ({
            ...it,
            getAmountsOut: await dexAggregator.getAmountsOut(
                input.amount.mul(TEN.pow(TOKEN_DECIMALS[input.tokenIn])),
                it.subPaths
            ),
        }))
    )

    const sortedGetAmountsOut = getAmountsOutResults
        .map((it) => ({
            ...it,
            amount: toComparableValue(
                it.getAmountsOut,
                TOKEN_DECIMALS[input.tokenIn]
            ),
        }))
        .sort((a, b) => bigNumberSorter(a.amount, b.amount))
        .reverse()

    console.log(sortedGetAmountsOut)

    console.log('best path is:')
    console.log(sortedGetAmountsOut[0].route)
    console.log('expected output: ')
    console.log(
        toComparableValueToHumanReadable(
            sortedGetAmountsOut[0].amount,
            TOKEN_DECIMALS[input.tokenIn],
            TOKEN_DECIMALS[input.tokenOut]
        )
    )
}

main(input).catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
