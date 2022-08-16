import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { getAllPairs, TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { TOKEN, TOKEN_ADDRESSES } from './config/tokens'
import {
    calculateQuoteForRoutes,
    calculateRouteQuote,
    computeAllRoutes,
    routeToSubPath,
    verifyCalculatedRoutes,
} from './functions/computeRoutes'
import { Input, Quote, TokenPair } from './types'
import { quote, quotesToQuoteMap } from './functions/quote'
import {
    bigNumberSorter,
    routerPairToString,
    routeToString,
    toComparableValue,
    comparableValueToHumanReadable,
    TEN,
} from './functions/util'
import { verify } from 'crypto'

const input: Input = {
    tokenIn: TOKEN.USDC,
    tokenOut: TOKEN.WBTC,
    amount: BigNumber.from(10).mul(TEN.pow(TOKEN_DECIMALS[TOKEN.USDC])),
}

const main = async (input: Input) => {
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
            displayPair: routerPairToString(it.pair),
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

    const routeWithQuote = calculateQuoteForRoutes(routes, quoteMap)

    const verifiedCalculatedRoutes = await verifyCalculatedRoutes(
        input,
        routeWithQuote,
        dexAggregator
    )

    if (verifiedCalculatedRoutes.length === 0) {
        throw 'No available path'
    }

    console.log(verifiedCalculatedRoutes)

    console.log('best path is:')
    console.log(verifiedCalculatedRoutes[0].route)
    console.log('expected output: ')
    console.log(
        comparableValueToHumanReadable(
            verifiedCalculatedRoutes[0].amount,
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
