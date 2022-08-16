import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import 'dotenv/config'

import { TOKEN, TOKEN_ADDRESSES, TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { ROUTERS } from './config/routers'
import { getBestPath, routerPair, routerPairToString, TEN } from './functions/util'
import { Input } from './types'

const tokenIn = TOKEN.VVS
const tokenOut = TOKEN.MMF

const input: Input = {
    tokenIn,
    tokenOut,
    amount: BigNumber.from(100000).mul(TEN.pow(TOKEN_DECIMALS[tokenIn])),
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

    console.log('Using best path:')
    console.log(bestPath.route.map(it => routerPairToString(it)))
    console.log('Expected amountOut:')
    console.log(bestPath.amountOut)
    console.log(
        ethers.utils.formatUnits(
            bestPath.amountOut,
            TOKEN_DECIMALS[input.tokenOut]
        )
    )

    const tokenInContract = await ethers.getContractAt(
        'IERC20',
        TOKEN_ADDRESSES[input.tokenIn]
    )

    const amountIn = input.amount

    const approval = await tokenInContract.approve(
        dexAggregatorAddress,
        amountIn
    )
    await approval.wait()

    const swap = await dexAggregator.swapExactTokensForTokens(
        amountIn,
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
