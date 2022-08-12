// SPDX-License-Identifier: MIT
// https://cronoscan.com/address/0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae#code

// File contracts/interfaces/IWETH.sol

pragma solidity >=0.5.0;

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;
}