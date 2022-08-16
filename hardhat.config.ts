import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
    solidity: '0.8.9',
    networks: {
        cronos: {
            url: 'https://evm.cronos.org/',
        },
    },
}

export default config
