# dapp-training-project
dApp training final project

Using:

- `node`
- `yarn`

Setup:
- `yarn install`

Init:
- `yarn add --dev chai @types/node @types/mocha @types/chai`
- `npm install dotenv --save`

Forking mainnet
- `npx hardhat node --fork https://evm.cronos.org/`
- verify: `curl --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545`

Running:
- Forking: `yarn fork` / `yarn fork:2` 
- Deployment: `yarn deploy`
- Swaping native token for USDC: `yarn usdc`
- Quotes and find path: `yarn out`
- Swap: `yarn swap`
