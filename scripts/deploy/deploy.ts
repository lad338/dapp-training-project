import { ethers } from 'hardhat'
import '../../hardhat.config'
import '../config/routers'
import { ROUTERS } from '../config/routers'

async function main() {
    const [owner] = await ethers.getSigners()
    console.log('Owner address: ', owner.address)

    const VVSRouterAdapter = await ethers.getContractFactory('VVSRouterAdapter')
    const MMFRouterAdapter = await ethers.getContractFactory('MMFRouterAdapter')

    const vvsRouterAdapter = await VVSRouterAdapter.deploy(ROUTERS.VVS)
    const mmfRouterAdapter = await MMFRouterAdapter.deploy(ROUTERS.MMF)

    console.log('vvsRouterAdapter deployed at: ' + vvsRouterAdapter.address)
    console.log('mmfRouterAdapter deployed at: ' + mmfRouterAdapter.address)

    const DexAggregator = await ethers.getContractFactory('DexAggregator')
    const dexAggregator = await DexAggregator.deploy()
    console.log('dexAggregator deployed at: ' + dexAggregator.address)

    const vvsRegister = await dexAggregator.registerRouter(vvsRouterAdapter.address)
    const mmfRegister = await dexAggregator.registerRouter(mmfRouterAdapter.address)
    console.log(vvsRegister)
    console.log(mmfRegister)


    const MultiCall2 = await ethers.getContractFactory('Multicall2')
    const multicall2 = await MultiCall2.deploy()
    console.log('multicall2 deployed at: ' + multicall2.address)
}

main().catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
