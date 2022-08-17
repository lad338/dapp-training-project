import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { TOKEN } from './config/tokens'
import {
    calculateQuoteForRoutes,
    computeAllRoutes,
    verifyCalculatedRoutes,
} from './functions/computeRoutes'
import { Input } from './types'
import { quote, quotesToQuoteMap } from './functions/quote'
import {
    routerPairToString,
    comparableValueToHumanReadable,
    TEN,
} from './functions/util'
import { CONFIG } from './config/input'

const tokenIn = CONFIG.tokenIn
const tokenOut = CONFIG.tokenOut
const maxJumps = CONFIG.maxJumps

const input: Input = {
    tokenIn,
    tokenOut,
    amount: CONFIG.amount,
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

    const pairQuotes = await quote()

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
        maxJumps,
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
    console.log(
        verifiedCalculatedRoutes[0].route.map((it) => routerPairToString(it))
    )
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
