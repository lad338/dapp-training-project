// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interface/IRouterAdapter.sol";
import "./vvs/VVSRouter.sol";

contract VVSRouterAdapter is IRouterAdapter {
    IVVSRouter02 public router;

    function constructor(address routerAddress) {
        router = IVVSRouter02(routerAddress);
    }

    function quote(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) external view override returns (uint256 amountOut) {
        (uint256 reserveA, uint256 reserveB) = MeerkatLibrary.getReserves(
            router.factory(),
            tokenIn,
            tokenOut
        );
        amountOut = VVSLibrary.quote(amountIn, reserveA, reserveB);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external override returns (uint256[] memory amounts) {
        IERC20(path[0]).approve(address(router), amountIn);
        return
            router.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                block.timestamp
            );
    }

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to
    ) external returns (uint[] memory amounts) {
        IERC20(path[0]).approve(address(router), amountInMax);
        return
            router.swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                to,
                block.timestamp
            );
    }
}
