pragma solidity ^0.5.0;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Extension of {ERC20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 *
 * Modified to replace intiailizable function with constructor from
 * https://github.com/OpenZeppelin/openzeppelin-contracts-ethereum-package/blob/master/contracts/token/ERC20/ERC20Mintable.sol
 */
contract TestToken is ERC20 {
    constructor() public {
    }

    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }

    uint256[50] private ______gap;
}