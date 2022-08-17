import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { swapCROForUSDC } from './functions/util'

const main = async () => {
    const [signer] = await ethers.getSigners()
    console.log('signer address: ' + signer.address)

    const result = await swapCROForUSDC(
        signer.address,
        '9000',
        BigNumber.from(1200 * 1000000)
    )
    console.log(result)
}

main().catch((error) => {
    console.error('Fatal error')
    console.error(error)
    process.exit(1)
})
