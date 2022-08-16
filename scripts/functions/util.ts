import { BigNumber, Contract } from 'ethers'
import { ethers } from 'hardhat'
import { ROUTERS } from '../config/routers'

import { TOKEN, TOKEN_NAMES } from '../config/tokens'
import { RouterPair, Route, Input, BestPath } from '../types'
import {
    calculateQuoteForRoutes,
    computeAllRoutes,
    verifyCalculatedRoutes,
} from './computeRoutes'
import { quote, quotesToQuoteMap } from './quote'

export const toComparableValue = (
    amount: BigNumber,
    decimal: number
): BigNumber => {
    return ethers.utils.parseUnits(
        ethers.utils.formatUnits(amount, decimal),
        36
    )
}

export const comparableValueToHumanReadable = (
    amount: BigNumber,
    inputDecimal: number,
    outputDecimal: number
): string => {
    return ethers.utils.formatUnits(amount, outputDecimal - inputDecimal + 36)
}

export const bigNumberSorter = (a: BigNumber, b: BigNumber) => {
    if (a.lt(b)) {
        return -1
    }
    if (b.gt(a)) {
        return 1
    }
    return 0
}

export const routeToString = (route: Route): string => {
    return route.reduce(
        (result, pair) =>
            result === ''
                ? routerPairToString(pair)
                : result + ', ' + routerPairToString(pair),
        ''
    )
}

export const routerPairToString = (pair: RouterPair) => {
    return (
        pair.router +
        ':(' +
        TOKEN_NAMES[pair.pair.tokenIn] +
        ',' +
        TOKEN_NAMES[pair.pair.tokenOut] +
        ')'
    )
}

export const routerPair = (
    router: number,
    tokenIn: TOKEN,
    tokenOut: TOKEN
): RouterPair => {
    return {
        router,
        pair: {
            tokenIn,
            tokenOut,
        },
    }
}

export const getBestPath = async (
    dexAggregator: Contract,
    input: Input
): Promise<BestPath> => {
    const pairQuotes = await quote(dexAggregator)
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

    return {
        input,
        amountOut: verifiedCalculatedRoutes[0].getAmountsOut,
        subPaths: verifiedCalculatedRoutes[0].subPaths,
        route: verifiedCalculatedRoutes[0].route,
    }
}

export const ONE = BigNumber.from('1')
export const TEN = BigNumber.from('10')

export const swapCROForUSDC = async (
    signer: string,
    amountInS: string,
    outMin: BigNumber
) => {
    const vvsRouter = await ethers.getContractAt('IVVSRouter02', ROUTERS.VVS)

    const amountOutMin = outMin
    const path = [
        '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
        '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
    ]
    const amountIn = ethers.utils.parseEther(amountInS)

    const block = await ethers.provider.getBlock('latest')
    console.log(block.timestamp)

    const result = await vvsRouter.swapExactETHForTokens(
        amountOutMin,
        path,
        signer,
        block.timestamp * 2,
        { value: amountIn }
    )

    await result.wait()
    console.log(result)
}