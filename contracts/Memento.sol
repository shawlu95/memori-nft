//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract Memento is
    Initializable,
    AccessControlUpgradeable,
    ERC721URIStorageUpgradeable,
    PausableUpgradeable
{
    using Counters for Counters.Counter;

    Counters.Counter private minted;
    Counters.Counter private burned;
    uint256 public price;
    mapping(bytes32 => bool) private _ipfsHash;
    mapping(uint256 => address) private _authors;
    mapping(address => uint256) private _allowance;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");

    event SetAllowance(
        address indexed by,
        address indexed recipient,
        uint256 allowance
    );
    event SetPrice(address indexed by, uint256 price);
    event WithdrawFund(address indexed by, uint256 amount);

    function initialize() public initializer {
        __ERC165_init_unchained();
        __ERC721_init_unchained("Memento Script Betas", "MEMO");
        __Context_init_unchained();
        __AccessControl_init_unchained();
        __ERC721URIStorage_init_unchained();
        __Pausable_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
        _setupRole(FINANCE_ROLE, _msgSender());

        price = 10**18;
    }

    function supply() public view returns (uint256) {
        return minted.current() - burned.current();
    }

    function authorOf(uint256 tokenId) public view virtual returns (address) {
        require(_exists(tokenId), "ERC721: author query for nonexistent token");
        return _authors[tokenId];
    }

    function allowanceOf(address _user) public view returns (uint256) {
        return _allowance[_user];
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

    function mint(
        address recipient,
        address author,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) {
        require(!paused(), "Mint while paused!");
        _execMint(recipient, author, tokenURI);
    }

    function payToMint(address recipient, string memory tokenURI)
        public
        payable
    {
        require(!paused(), "Pay to mint while paused!");
        if (_allowance[_msgSender()] > 0) {
            _allowance[_msgSender()] -= 1;
        } else {
            require(msg.value >= price, "Insufficient fund!");
        }
        _execMint(recipient, _msgSender(), tokenURI);
    }

    function _execMint(
        address recipient,
        address author,
        string memory tokenURI
    ) internal {
        bytes32 byteURI = getByte32(tokenURI);
        require(_ipfsHash[byteURI] == false, "Already minted!");
        uint256 id = minted.current();
        _safeMint(recipient, id);
        _setTokenURI(id, makeURI(tokenURI));
        _authors[id] = author;
        _ipfsHash[byteURI] = true;
        minted.increment();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!paused(), "Token transfer while paused!");
        super._beforeTokenTransfer(from, to, amount);
    }

    function withdraw(uint256 amount) public onlyRole(FINANCE_ROLE) {
        require(amount <= address(this).balance, "Insufficient fund!");
        payable(_msgSender()).transfer(amount);
        emit WithdrawFund(_msgSender(), amount);
    }

    function setRoleAdmin(bytes32 role, bytes32 adminRole)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setRoleAdmin(role, adminRole);
    }

    function setPrice(uint256 _price) public onlyRole(FINANCE_ROLE) {
        price = _price;
        emit SetPrice(_msgSender(), _price);
    }

    function setAllowance(address _user, uint256 _allowed)
        public
        onlyRole(FINANCE_ROLE)
    {
        _allowance[_user] = _allowed;
        emit SetAllowance(_msgSender(), _user, _allowed);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function burn(uint256 tokenId) public {
        require(!paused(), "Burn while paused!");
        require(
            hasRole(BURNER_ROLE, _msgSender()) ||
                ownerOf(tokenId) == _msgSender(),
            "Not burner or owner!"
        );
        _burn(tokenId);
        delete _authors[tokenId];
        burned.increment();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    uint256[48] private __gap;
}
