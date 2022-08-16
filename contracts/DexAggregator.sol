// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';

import './interfaces/IERC20.sol';
import './interfaces/IRouterAdapter.sol';

import 'hardhat/console.sol';

contract DexAggregator is Ownable {
    address[] public routers;
    address[] public supportedTokens;

    event RouterRegistered(address indexed routerAddress, uint256 index);

    constructor(address[] memory tokens) {
        for (uint256 i = 0; i < tokens.length; i++) {
            supportedTokens.push(tokens[i]);
        }
    }

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
        for (uint256 i = 0; i < routers.length; i++) {
            IRouterAdapter router = IRouterAdapter(routers[i]);
            try router.quote(amountIn, tokenIn, tokenOut) returns (
                uint256 amount
            ) {
                amounts[i] = amount;
            } catch {
                amounts[i] = 0;
            }
        }
    }

    function listAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    ) public view returns (uint256[] memory amounts) {
        amounts = new uint256[](routers.length);
        for (uint256 i = 0; i < routers.length; i++) {
            IRouterAdapter router = IRouterAdapter(routers[i]);
            try router.getAmountOut(amountIn, tokenIn, tokenOut) returns (
                uint256 amount
            ) {
                amounts[i] = amount;
            } catch {
                amounts[i] = 0;
            }
        }
    }

    function getAmountsOut(uint256 amountIn, SubPath[] calldata subPaths)
        public
        view
        returns (uint256 amount)
    {
        for (uint256 i = 0; i < subPaths.length; i++) {
            IRouterAdapter router = IRouterAdapter(routers[subPaths[i].router]);
            uint256[] memory amountsOut = router.getAmountsOut(
                amountIn,
                subPaths[i].path
            );
            for (uint256 j = 0; j < amountsOut.length; j++) {
                console.log('amountsOut %s(%s): %s', i, j, amountsOut[j]);
            }

            amountIn = amountsOut[amountsOut.length - 1];
            amount = amountIn;
        }
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amoutOutMin,
        SubPath[] calldata subPaths,
        address to
    ) public {
        uint256 amountOut;
        for (uint256 i = 0; i < subPaths.length; i++) {
            IRouterAdapter router = IRouterAdapter(routers[subPaths[i].router]);
            uint256[] memory amountsOut = router.getAmountsOut(
                amountIn,
                subPaths[i].path
            );
            uint256 subPathAmountOut = amountsOut[amountsOut.length - 1];

            require(
                IERC20(subPaths[i].path[0]).transferFrom(
                    msg.sender,
                    address(router),
                    amountIn
                ),
                'require IERC20 transferForm'
            );
            uint256[] memory swapedTokens = router.swapExactTokensForTokens(
                amountIn,
                subPathAmountOut,
                subPaths[i].path,
                to
            );
            amountOut = swapedTokens[swapedTokens.length - 1];
            require(
                amountOut >= subPathAmountOut,
                'subPathAmountOut needs to be >= getAmountsOut()'
            );
            amountIn = subPathAmountOut;
        }
        require(
            amountOut >= amoutOutMin,
            'amountOut needs to be >= amountOutMin'
        );
    }

    struct SubPath {
        uint256 router;
        address[] path;
    }
}
