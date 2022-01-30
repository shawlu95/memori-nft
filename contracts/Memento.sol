//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Memento is Initializable, OwnableUpgradeable, ERC721URIStorageUpgradeable {
    using Counters for Counters.Counter;

    Counters.Counter private counter;
    uint256 public price;
    mapping(bytes32 => bool) private _ipfsHash;
    mapping(uint256 => address) private _tokenAuthors;
    mapping(address => uint256) private _allowance;

    function initialize() public initializer {
        __ERC721_init("Memento Script Betas", "MEMO");
        __Ownable_init();
        __ERC721URIStorage_init();
        price = 10**18;
    }

    function supply() public view returns (uint256) {
        return counter.current();
    }

    function authorOf(uint256 tokenId) public view virtual returns (address) {
        return _tokenAuthors[tokenId];
    }

    function makeURI(string memory CID) internal pure returns (string memory) {
        return string(abi.encodePacked("ipfs://", CID));
    }

    function getByte32(string memory tokenURI)
        internal
        pure
        returns (bytes32 result)
    {
        assembly {
            result := mload(add(tokenURI, 32))
        }
    }

    function isMinted(string memory tokenURI) public view returns (bool) {
        bytes32 byteURI = getByte32(tokenURI);
        return _ipfsHash[byteURI];
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setAllowance(address _user, uint256 _allowed) public onlyOwner {
        _allowance[_user] = _allowed;
    }

    function allowanceOf(address _user) public view returns (uint256) {
        return _allowance[_user];
    }

    function mint(
        address recipient,
        address author,
        string memory tokenURI
    ) public onlyOwner {
        _execMint(recipient, author, tokenURI);
    }

    function payToMint(address recipient, string memory tokenURI)
        public
        payable
    {
        if (_allowance[msg.sender] > 0) {
            _allowance[msg.sender] -= 1;
        } else {
            require(msg.value >= price, "Insufficient fund!");
        }
        _execMint(recipient, msg.sender, tokenURI);
    }

    function _execMint(
        address recipient,
        address author,
        string memory tokenURI
    ) internal {
        bytes32 byteURI = getByte32(tokenURI);
        require(_ipfsHash[byteURI] == false, "Already minted!");
        uint256 id = counter.current();
        _safeMint(recipient, id);
        _setTokenURI(id, makeURI(tokenURI));
        _tokenAuthors[id] = author;
        _ipfsHash[byteURI] = true;
        counter.increment();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
    }

    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient fund!");
        payable(msg.sender).transfer(amount);
    }
}
