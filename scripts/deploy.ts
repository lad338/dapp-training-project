import hre from 'hardhat'
import '../hardhat.config'
import './config/routers'
import { ROUTERS } from './config/routers'
import { TOKENS, TOKEN_ADDRESSES } from './config/tokens'

const main = async () => {
    const [owner] = await hre.ethers.getSigners()
    console.log('Owner address: ', owner.address)

    const VVSRouterAdapter = await hre.ethers.getContractFactory(
        'VVSRouterAdapter'
    )
    const MMFRouterAdapter = await hre.ethers.getContractFactory(
        'MMFRouterAdapter'
    )

    const vvsRouterAdapter = await VVSRouterAdapter.deploy(ROUTERS.VVS)
    const mmfRouterAdapter = await MMFRouterAdapter.deploy(ROUTERS.MMF)

    await vvsRouterAdapter.deployed()
    await mmfRouterAdapter.deployed()

    console.log('vvsRouterAdapter deployed at: ' + vvsRouterAdapter.address)
    console.log('mmfRouterAdapter deployed at: ' + mmfRouterAdapter.address)

    const DexAggregator = await hre.ethers.getContractFactory('DexAggregator')
    const dexAggregator = await DexAggregator.deploy(
        TOKENS.map((token) => TOKEN_ADDRESSES[token])
    )

    await dexAggregator.deployed()
    console.log('dexAggregator deployed at: ' + dexAggregator.address)

    const vvsRegister = await dexAggregator.registerRouter(
        vvsRouterAdapter.address
    )
    const mmfRegister = await dexAggregator.registerRouter(
        mmfRouterAdapter.address
    )
    await vvsRegister.wait()
    await mmfRegister.wait()

    const MultiCall2 = await hre.ethers.getContractFactory('Multicall2')
    const multicall2 = await MultiCall2.deploy()
    await multicall2.deployed()
    console.log('multicall2 deployed at: ' + multicall2.address)
}

main().catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
