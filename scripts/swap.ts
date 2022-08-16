import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import 'dotenv/config'

import { TOKEN, TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { ROUTERS } from './config/routers'
import { getBestPath, routerPair, TEN } from './functions/util'
import { Input } from './types'

const input: Input = {
    tokenIn: TOKEN.USDC,
    tokenOut: TOKEN.WBTC,
    amount: BigNumber.from(200),
}

const main = async (input: Input) => {
    const envAddress = process.env.ADDRESS
    console.log('envAddress: ' + envAddress)

    const [signer] = await ethers.getSigners()
    console.log('signer address: ' + signer.address)

    const dexAggregatorAddress = DeployedDexAggregator.address
    console.log('dexAggregatorAddress: ' + dexAggregatorAddress)

    const dexAggregator = await ethers.getContractAt(
        'DexAggregator',
        dexAggregatorAddress
    )

    const bestPath = await getBestPath(dexAggregator, input)

    console.log('Using best path')
    console.log(bestPath)

    const swap = await dexAggregator.swapExactTokensForTokens(
        input.amount.mul(TEN.pow(TOKEN_DECIMALS[input.tokenIn])),
        bestPath.amountOut,
        bestPath.subPaths,
        signer.address
    )

    console.log('Successful swap')
    console.log(swap)
}

main(input).catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
