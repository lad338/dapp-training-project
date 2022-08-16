import { TokenPair } from '../types'

export enum TOKEN {
    WBTC,
    WETH,
    WCRO,
    USDC,
    USDT,
    DAI,
    TONIC,
    SINGLE,
    VVS,
    MMF,
    TUSD,
    ATOM,
    ELON,
}

export const TOKENS = [
    TOKEN.WBTC,
    TOKEN.WETH,
    TOKEN.WCRO,
    TOKEN.USDC,
    TOKEN.USDT,
    TOKEN.DAI,
    TOKEN.TONIC,
    // TOKEN.SINGLE,
    TOKEN.VVS,
    TOKEN.MMF,
    // TOKEN.TUSD,
    TOKEN.ATOM,
    TOKEN.ELON,
]

export const TOKEN_DECIMALS = {
    [TOKEN.WBTC]: 8,
    [TOKEN.WETH]: 18,
    [TOKEN.USDT]: 6,
    [TOKEN.USDC]: 6,
    [TOKEN.DAI]: 18,
    [TOKEN.TUSD]: 18,
    [TOKEN.VVS]: 18,
    [TOKEN.MMF]: 18,
    [TOKEN.TONIC]: 18,
    [TOKEN.WCRO]: 18,
    [TOKEN.SINGLE]: 18,
    [TOKEN.ELON]: 18,
    [TOKEN.ATOM]: 6,
}

export const TOKEN_ADDRESSES = {
    [TOKEN.WBTC]: '0x062E66477Faf219F25D27dCED647BF57C3107d52',
    [TOKEN.WETH]: '0xe44Fd7fCb2b1581822D0c862B68222998a0c299a',
    [TOKEN.USDT]: '0x66e428c3f67a68878562e79A0234c1F83c208770',
    [TOKEN.USDC]: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59',
    [TOKEN.DAI]: '0xF2001B145b43032AAF5Ee2884e456CCd805F677D',
    [TOKEN.TUSD]: '0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e',
    [TOKEN.VVS]: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03',
    [TOKEN.MMF]: '0x97749c9B61F878a880DfE312d2594AE07AEd7656',
    [TOKEN.TONIC]: '0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2',
    [TOKEN.WCRO]: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    [TOKEN.SINGLE]: '0x0804702a4e749d39a35fde73d1df0b1f1d6b8347',
    [TOKEN.ELON]: '0x02DCcaf514C98451320a9365C5b46C61d3246ff3',
    [TOKEN.ATOM]: '0xB888d8Dd1733d72681b30c00ee76BDE93ae7aa93',
}

export const getAllPairs = (): TokenPair[] => {
    const result: TokenPair[] = []

    TOKENS.forEach((tokenIn) => {
        TOKENS.forEach((tokenOut) => {
            if (tokenIn != tokenOut) {
                result.push({ tokenIn, tokenOut })
            }
        })
    })

    return result
}

export const getPairPriceDecimal = (pair: TokenPair) => {
    const outDP = TOKEN_DECIMALS[pair.tokenOut]
    const inDP = TOKEN_DECIMALS[pair.tokenIn]
    return outDP - inDP
}

export const TOKEN_NAMES = {
    [TOKEN.WBTC]: 'WBTC',
    [TOKEN.WETH]: 'WETH',
    [TOKEN.USDT]: 'USDT',
    [TOKEN.USDC]: 'USDC',
    [TOKEN.DAI]: 'DAI',
    [TOKEN.TUSD]: 'TUSD',
    [TOKEN.VVS]: 'VVS',
    [TOKEN.MMF]: 'MMF',
    [TOKEN.TONIC]: 'TONIC',
    [TOKEN.WCRO]: 'WCRO',
    [TOKEN.SINGLE]: 'SINGLE',
    [TOKEN.ELON]: 'ELON',
    [TOKEN.ATOM]: 'ATOM',
}
