//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@opengsn/contracts/src/BaseRelayRecipient.sol';

contract Memori is Ownable, ERC721URIStorage, BaseRelayRecipient {
  using Counters for Counters.Counter;
  Counters.Counter private _minted;
  Counters.Counter private _burned;
  uint256 public price;
  mapping(uint256 => address) private _authors;
  mapping(address => uint256) private _allowance;

  event SetAllowance(address recipient, uint256 allowance);
  event SetPrice(uint256 price);
  event WithdrawEther(uint256 amount);

  constructor(address _forwarder) ERC721('memo-ri', 'MEMO') {
    _setTrustedForwarder(_forwarder);
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

  function makeURI(string memory cid) internal pure returns (string memory) {
    return string(abi.encodePacked('ipfs://', cid));
  }

  function mint(address _recipient, string memory _tokenURI) public payable {
    require(msg.value >= price || _allowance[_msgSender()] > 0);
    if (_allowance[_msgSender()] > 0) _allowance[_msgSender()] -= 1;
    uint256 id = _minted.current();
    _safeMint(_recipient, id);
    _setTokenURI(id, makeURI(_tokenURI));
    _authors[id] = _msgSender();
    _minted.increment();
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
    emit WithdrawEther(amount);
  }

  function setPrice(uint256 _price) public onlyOwner {
    price = _price;
    emit SetPrice(_price);
  }

  function setAllowance(address _user, uint256 _allowed) public onlyOwner {
    _allowance[_user] = _allowed;
    emit SetAllowance(_user, _allowed);
  }

  function burn(uint256 tokenId) public {
    require(owner() == _msgSender() || ownerOf(tokenId) == _msgSender());
    _burn(tokenId);
    delete _authors[tokenId];
    _burned.increment();
  }

  function versionRecipient() external pure override returns (string memory) {
    return '2.2.5';
  }

  function _msgData()
    internal
    view
    override(Context, BaseRelayRecipient)
    returns (bytes calldata ret)
  {
    return BaseRelayRecipient._msgData();
  }

  function _msgSender()
    internal
    view
    override(Context, BaseRelayRecipient)
    returns (address ret)
  {
    return BaseRelayRecipient._msgSender();
  }
}
