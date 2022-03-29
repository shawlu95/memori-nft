//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Memori is Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _minted;
    Counters.Counter private _burned;
    uint256 public price;
    mapping(bytes32 => bool) private _ipfsHash;
    mapping(uint256 => address) private _authors;
    mapping(address => uint256) private _allowance;
    mapping(uint256 => string) private _previewURIs;
    mapping(uint256 => uint256) private _revealAt;

    event SetAllowance(
        address indexed by,
        address indexed recipient,
        uint256 allowance
    );
    event SetPrice(address indexed by, uint256 price);
    event WithdrawEther(address indexed by, uint256 amount);
    event WithdrawToken(address indexed by, uint256 amount);
    event ReceivedToken(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes userData,
        bytes operatorData
    );

    constructor(uint256 _price) ERC721("Memo-ri", "MEMO") {
        price = _price;
    }

    function supply() public view returns (uint256) {
        return _minted.current() - _burned.current();
    }

    function authorOf(uint256 tokenId) public view virtual returns (address) {
        require(_exists(tokenId));
        return _authors[tokenId];
    }

    function allowanceOf(address _user) public view returns (uint256) {
        return _allowance[_user];
    }

    function revealAt(uint256 _tokenURI) public view returns (uint256) {
        return _revealAt[_tokenURI];
    }

    function makeURI(string memory CID) internal pure returns (string memory) {
        return string(abi.encodePacked("ipfs://", CID));
    }

    function getByte32(string memory _tokenURI)
        internal
        pure
        returns (bytes32 result)
    {
        assembly {
            result := mload(add(_tokenURI, 32))
        }
    }

    function mint(
        address _recipient,
        uint256 _reveal,
        string memory _previewURI,
        string memory _tokenURI
    ) public payable {
        require(msg.value >= price || _allowance[_msgSender()] > 0);
        if (_allowance[_msgSender()] > 0) _allowance[_msgSender()] -= 1;
        _execMint(_recipient, _msgSender(), _reveal, _previewURI, _tokenURI);
    }

    function _execMint(
        address _recipient,
        address _author,
        uint256 _reveal,
        string memory _previewURI,
        string memory _tokenURI
    ) internal {
        bytes32 byteURI = getByte32(_tokenURI);
        require(_ipfsHash[byteURI] == false);
        uint256 id = _minted.current();
        _safeMint(_recipient, id);
        _setTokenURI(id, makeURI(_tokenURI));
        _previewURIs[id] = makeURI(_previewURI);
        _revealAt[id] = _reveal;
        _authors[id] = _author;
        _ipfsHash[byteURI] = true;
        _minted.increment();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (_revealAt[tokenId] <= block.timestamp) {
            return super.tokenURI(tokenId);
        } else {
            return _previewURIs[tokenId];
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
    }

    function withdrawEther(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance);
        payable(_msgSender()).transfer(amount);
        emit WithdrawEther(_msgSender(), amount);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
        emit SetPrice(_msgSender(), _price);
    }

    function setAllowance(address _user, uint256 _allowed) public onlyOwner {
        _allowance[_user] = _allowed;
        emit SetAllowance(_msgSender(), _user, _allowed);
    }

    function burn(uint256 tokenId) public {
        require(owner() == _msgSender() || ownerOf(tokenId) == _msgSender());
        _burn(tokenId);
        delete _authors[tokenId];
        _burned.increment();
    }
}
