// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract Memo is ERC777 {
    constructor(uint256 initialSupply)
        ERC777("Memo", "MEMO", new address[](0))
    {
        _mint(_msgSender(), initialSupply, "", "");
    }
}
