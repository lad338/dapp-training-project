// SPDX-License-Identifier: MIT
// https://cronoscan.com/address/0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae#code

// File vvs-swap-core/contracts/interfaces/IVVSFactory.sol

pragma solidity >=0.5.0;

interface IVVSFactory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}