import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { ROUTERS } from './config/routers'
import { TOKEN, TOKEN_ADDRESSES, TOKEN_DECIMALS } from './config/tokens'
import { DeployedDexAggregator } from './deployed/dexAggregator'
import { TEN } from './functions/util'
import { Input } from './types'

const input: Input = {
    tokenIn: TOKEN.WBTC,
    tokenOut: TOKEN.USDC,
    amount: BigNumber.from(100000),
}

const main = async (input: Input) => {
    const dexAggregatorAddress = DeployedDexAggregator.address
    console.log('dexAggregatorAddress: ' + dexAggregatorAddress)

    const dexAggregator = await ethers.getContractAt(
        'DexAggregator',
        dexAggregatorAddress
    )

    const t0 = await dexAggregator.routers(0)
    const t1 = await dexAggregator.routers(0)

    const test = await dexAggregator.listAmountOut(
        input.amount,
        TOKEN_ADDRESSES[input.tokenIn],
        TOKEN_ADDRESSES[input.tokenOut]
    )

    console.log(test)
}

main(input).catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
