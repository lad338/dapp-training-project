// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './interfaces/IRouterAdapter.sol';
import './mmf/IMeerkatRouter02.sol';
import './mmf/MeerkatLibrary.sol';
import './interfaces/IERC20.sol';

import 'hardhat/console.sol';

contract MMFRouterAdapter is IRouterAdapter {
    IMeerkatRouter02 public router;

    constructor(address routerAddress) {
        router = IMeerkatRouter02(routerAddress);
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

        console.log('MMFRouterAdapter getReserves');
        console.log(reserveA);
        console.log(reserveB);

        amountOut = router.quote(amountIn, reserveA, reserveB);
        console.log('MMFRouterAdapter quote');
        console.log(amountOut);
    }

    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) external view override returns (uint256 amountOut) {
        (uint256 reserveA, uint256 reserveB) = MeerkatLibrary.getReserves(
            router.factory(),
            tokenIn,
            tokenOut
        );

        uint256 swapFee = MeerkatLibrary.getSwapFee(
            router.factory(),
            tokenIn,
            tokenOut
        );

        amountOut = router.getAmountOut(
            amountIn,
            reserveA,
            reserveB,
            swapFee
        );
    }

    function getAmountsOut(uint256 amountIn, address[] memory path)
        external
        view
        override
        returns (uint256[] memory amounts)
    {
        amounts = router.getAmountsOut(
            amountIn,
            path
        );
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
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to
    ) external returns (uint256[] memory amounts) {
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
