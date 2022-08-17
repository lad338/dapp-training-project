import hre, { ethers } from 'hardhat'
import '../hardhat.config'
import './config/routers'
import { ROUTERS } from './config/routers'
import { TOKENS, TOKEN_ADDRESSES } from './config/tokens'
import 'dotenv/config'
import { DeployedDexAggregator } from './deployed/dexAggregator'

const main = async () => {

    const envAddress = process.env.ADDRESS
    console.log('envAddress: ' + envAddress)
    const envPrivateKey = process.env.PRIVATE_KEY as string

    const signer = new ethers.Wallet(envPrivateKey, ethers.provider);

    const VVSRouterAdapter = await ethers.getContractFactory(
        'VVSRouterAdapter'
    )


    const vvsRouterAdapter = await VVSRouterAdapter.connect(signer).deploy(ROUTERS.VVS)

    await vvsRouterAdapter.deployed()
  
    console.log('vvsRouterAdapter deployed at: ' + vvsRouterAdapter.address)

    const MMFRouterAdapter = await ethers.getContractFactory(
        'MMFRouterAdapter'
    )

    const mmfRouterAdapter = await MMFRouterAdapter.connect(signer).deploy(ROUTERS.MMF)

    await mmfRouterAdapter.deployed()

    console.log('mmfRouterAdapter deployed at: ' + mmfRouterAdapter.address)

    const DexAggregator = await ethers.getContractFactory('DexAggregator')
    
    const dexAggregator = await DexAggregator.connect(signer).deploy(TOKENS.map((token) => TOKEN_ADDRESSES[token]));
    await dexAggregator.deployed()

    console.log('dexAggregator deployed at: ' + dexAggregator.address)

    const vvsRegister = await dexAggregator.connect(signer).registerRouter(
        vvsRouterAdapter.address
    )
    await vvsRegister.wait()

    const mmfRegister = await dexAggregator.connect(signer).registerRouter(
        mmfRouterAdapter.address
    )
    await mmfRegister.wait()

    const MultiCall2 = await ethers.getContractFactory('Multicall2')
    const multicall2 = await MultiCall2.connect(signer).deploy()
    await multicall2.deployed()
    console.log('multicall2 deployed at: ' + multicall2.address)
    
}

main().catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
