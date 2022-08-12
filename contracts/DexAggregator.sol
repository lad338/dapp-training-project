// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IRouterAdapter.sol";

contract DexAggregator is Ownable {
    address[] public routers;

    event RouterRegistered(address indexed routerAddress, uint index);

    function registerRouter(address routerAddress) external onlyOwner {
        routers.push(routerAddress);
        emit RouterRegistered(routerAddress, routers.length - 1);
    }

    function quotes(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) public view returns (uint256[] memory amounts) {
        amounts = new uint256[](routers.length);
        for (uint i = 0; i < routers.length; i++) {
            IRouterAdapter router = IRouterAdapter(routers[i]);
            uint amount = router.quote(amountIn, tokenIn, tokenOut);
            amounts[i] = amount;
        }
    }
}
