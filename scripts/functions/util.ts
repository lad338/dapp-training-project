import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { TOKEN_NAMES } from '../config/tokens'
import { RouterPair, Route } from '../types'

export const toComparableValue = (
    amount: BigNumber,
    decimal: number
): BigNumber => {
    return ethers.utils.parseUnits(
        ethers.utils.formatUnits(amount, decimal),
        36
    )
}

export const toComparableValueToHumanReadable = (
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
