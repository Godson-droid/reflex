// SPDX-License-Identifier: MIT

pragma solidity ^0.8.29;

import { IERC20Minimal } from "./interfaces/IERC20Minimal.sol";

/// @title ReflexPair
/// @notice A minimal Uniswap-V2-style pair that acts as the price origin for Reflex.
/// @dev Reflex watches a pair's `Sync` events to learn its price. On the target
///      testnets there is no canonical, liquid V2 pair to watch, so Reflex ships its
///      own: just enough of the V2 pair surface (reserves, `mint`, `swap`, `sync`,
///      and the `Sync` event itself) for the reactive contract to observe prices
///      exactly the way it would observe a production V2 pair. The `Sync` event
///      signature is the interface contract between origin and reactive contract:
///      `Sync(uint112 reserve0, uint112 reserve1)`, topic0
///      0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1.
///      LP shares are tracked in an internal ledger (not a transferable token) —
///      liquidity provision here exists to establish a price, not to be traded.
///      As in V2, `swap` transfers outputs before updating reserves and relies on
///      the constant-product check as the invariant guard; the tokens used with it
///      are plain ERC-20s without transfer hooks.
contract ReflexPair {
    event Sync(uint112 reserve0, uint112 reserve1);
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );

    address public immutable token0;
    address public immutable token1;

    uint112 private _reserve0;
    uint112 private _reserve1;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidityOf;

    constructor(address tokenA_, address tokenB_) {
        require(tokenA_ != address(0) && tokenB_ != address(0) && tokenA_ != tokenB_, "ReflexPair: bad tokens");
        // V2 convention: token0 is the numerically smaller address.
        (token0, token1) = tokenA_ < tokenB_ ? (tokenA_, tokenB_) : (tokenB_, tokenA_);
    }

    function getReserves() public view returns (uint112 reserve0, uint112 reserve1) {
        return (_reserve0, _reserve1);
    }

    /// @notice Mint liquidity against tokens already transferred to the pair.
    function mint(address to_) external returns (uint256 liquidity) {
        (uint112 r0, uint112 r1) = getReserves();
        uint256 balance0 = IERC20Minimal(token0).balanceOf(address(this));
        uint256 balance1 = IERC20Minimal(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - r0;
        uint256 amount1 = balance1 - r1;
        require(amount0 > 0 && amount1 > 0, "ReflexPair: nothing to mint");

        if (totalLiquidity == 0) {
            liquidity = _sqrt(amount0 * amount1);
        } else {
            uint256 l0 = (amount0 * totalLiquidity) / r0;
            uint256 l1 = (amount1 * totalLiquidity) / r1;
            liquidity = l0 < l1 ? l0 : l1;
        }
        require(liquidity > 0, "ReflexPair: zero liquidity minted");

        totalLiquidity += liquidity;
        liquidityOf[to_] += liquidity;
        _update(balance0, balance1);
        emit Mint(msg.sender, amount0, amount1);
    }

    /// @notice Swap against the pair. Input tokens must already sit in the pair
    ///         (transferred in before the call), exactly as with a V2 pair.
    function swap(uint256 amount0Out_, uint256 amount1Out_, address to_) external {
        require(amount0Out_ > 0 || amount1Out_ > 0, "ReflexPair: zero output");
        (uint112 r0, uint112 r1) = getReserves();
        require(amount0Out_ < r0 && amount1Out_ < r1, "ReflexPair: insufficient liquidity");

        if (amount0Out_ > 0) require(IERC20Minimal(token0).transfer(to_, amount0Out_), "ReflexPair: transfer failed");
        if (amount1Out_ > 0) require(IERC20Minimal(token1).transfer(to_, amount1Out_), "ReflexPair: transfer failed");

        uint256 balance0 = IERC20Minimal(token0).balanceOf(address(this));
        uint256 balance1 = IERC20Minimal(token1).balanceOf(address(this));
        uint256 amount0In = balance0 > r0 - amount0Out_ ? balance0 - (r0 - amount0Out_) : 0;
        uint256 amount1In = balance1 > r1 - amount1Out_ ? balance1 - (r1 - amount1Out_) : 0;
        require(amount0In > 0 || amount1In > 0, "ReflexPair: no input");

        // Constant-product invariant, adjusted for the 0.3% fee, as in V2.
        uint256 balance0Adj = balance0 * 1000 - amount0In * 3;
        uint256 balance1Adj = balance1 * 1000 - amount1In * 3;
        require(balance0Adj * balance1Adj >= uint256(r0) * uint256(r1) * 1_000_000, "ReflexPair: K violated");

        _update(balance0, balance1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out_, amount1Out_, to_);
    }

    /// @notice Force reserves to match current balances (after a direct donation).
    function sync() external {
        _update(
            IERC20Minimal(token0).balanceOf(address(this)), IERC20Minimal(token1).balanceOf(address(this))
        );
    }

    function _update(uint256 balance0_, uint256 balance1_) private {
        require(balance0_ <= type(uint112).max && balance1_ <= type(uint112).max, "ReflexPair: reserve overflow");
        _reserve0 = uint112(balance0_);
        _reserve1 = uint112(balance1_);
        emit Sync(_reserve0, _reserve1);
    }

    function _sqrt(uint256 y_) private pure returns (uint256 z) {
        if (y_ > 3) {
            z = y_;
            uint256 x = y_ / 2 + 1;
            while (x < z) {
                z = x;
                x = (y_ / x + x) / 2;
            }
        } else if (y_ != 0) {
            z = 1;
        }
    }
}
