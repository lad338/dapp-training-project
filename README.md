# dapp-training-project
dApp training final project

Using:

- `node`
- `yarn`

Setup:
- `yarn install`

Init:
- `yarn add --dev chai @types/node @types/mocha @types/chai`

Forking mainnet
- `npx hardhat node --fork https://evm.cronos.org/`
- verify: `curl --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545`