// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract Memo is ERC777 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC777(name, symbol, new address[](0)) {
        _mint(_msgSender(), initialSupply, "", "");
    }
}
