import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import {
    getPairPriceDecimal,
    TOKEN,
    TOKEN_NAMES,
    TOKEN_ADDRESSES,
    TOKEN_DECIMALS,
} from '../config/tokens'
import {
    Route,
    RouterPair,
    TokenPair,
    RouterPairQuoteMap,
    Quote,
    RouteQuote,
    Path,
    SubPath,
} from '../types'
import { routerPairToString } from './util'

const ONE = BigNumber.from('1')
const TEN = BigNumber.from('10')

export const computeAllRoutes = (
    tokenIn: TOKEN,
    tokenOut: TOKEN,
    availablePairs: RouterPair[],
    maxJumps: number,
    exploredToken: Set<TOKEN>,
    currentRoute: Route
): Route[] => {
    if (
        currentRoute.length >= 1 &&
        currentRoute[currentRoute.length - 1].pair.tokenOut === tokenOut
    ) {
        return [currentRoute]
    }

    if (currentRoute.length >= maxJumps) {
        return []
    }

    const relatedPairs = availablePairs.filter(
        (pair) =>
            !exploredToken.has(pair.pair.tokenOut) &&
            pair.pair.tokenIn === tokenIn
    )

    return relatedPairs
        .map((pair) => {
            return computeAllRoutes(
                pair.pair.tokenOut,
                tokenOut,
                availablePairs,
                maxJumps,
                exploredToken.add(tokenIn),
                [...currentRoute, pair]
            )
        })
        .reduce((result, routes) => [...result, ...routes], [])
}

export const calculateRouteQuote = (
    route: Route,
    quoteMap: RouterPairQuoteMap
): RouteQuote => {
    return route.reduce(
        (result, pair) => {
            const quote = quoteMap[routerPairToString(pair)]

            return {
                quote: result.quote.mul(quote).div(TEN.pow(result.decimal)),
                decimal: TOKEN_DECIMALS[pair.pair.tokenOut],
            }
        },
        {
            quote: ONE,
            decimal: 0,
        }
    )
}

export const routeToSubPath = (route: Route): SubPath[] => {
    const result: SubPath[] = []
    let path: Path = []
    path.push(TOKEN_ADDRESSES[route[0].pair.tokenIn])
    path.push(TOKEN_ADDRESSES[route[0].pair.tokenOut])
    let router: number = route[0].router
    for (let i = 1; i < route.length; i++) {
        if (router === route[i].router) {
            path.push(TOKEN_ADDRESSES[route[i].pair.tokenOut])
        } else {
            result.push({
                router,
                path,
            })
            path = []
            router = route[i].router
            path.push(TOKEN_ADDRESSES[route[i].pair.tokenIn])
            path.push(TOKEN_ADDRESSES[route[i].pair.tokenOut])
        }
    }

    result.push({
        router,
        path,
    })
    return result
}
