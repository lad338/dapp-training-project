import { BigNumber } from 'ethers'
import { TEN } from '../functions/util'
import { TOKEN, TOKEN_DECIMALS } from './tokens'

const tokenIn = TOKEN.MMF
const tokenOut = TOKEN.SHIB
const amount = BigNumber.from(1000).mul(TEN.pow(TOKEN_DECIMALS[tokenIn]))
const maxJumps = 5

export const CONFIG = {
    tokenIn,
    tokenOut,
    amount,
    maxJumps,
}
