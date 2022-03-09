//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract Memori is AccessControl, ERC721URIStorage {
    using Counters for Counters.Counter;
    IERC1820Registry private _erc1820;
    ERC777 private _token;
    Counters.Counter private _minted;
    Counters.Counter private _burned;
    uint256 public price;
    uint256 public reward;
    mapping(bytes32 => bool) private _ipfsHash;
    mapping(uint256 => address) private _authors;
    mapping(address => uint256) private _allowance;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 private constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 private constant FINANCE_ROLE = keccak256("FINANCE_ROLE");
    mapping(uint256 => string) private _previewURIs;
    mapping(uint256 => uint256) private _revealAt;

    event SetAllowance(
        address indexed by,
        address indexed recipient,
        uint256 allowance
    );
    event SetPrice(address indexed by, uint256 price);
    event SetReward(address indexed by, uint256 reward);
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

    constructor(
        uint256 _price,
        uint256 _reward,
        address token
    ) ERC721("Memo-ri", "MEMO") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
        _setupRole(FINANCE_ROLE, _msgSender());

        _token = ERC777(token);
        _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
        _erc1820.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensRecipient"),
            address(this)
        );

        price = _price;
        reward = _reward;
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
        address _author,
        uint256 _reveal,
        string memory _previewURI,
        string memory _tokenURI
    ) public onlyRole(MINTER_ROLE) {
        _execMint(_recipient, _author, _reveal, _previewURI, _tokenURI);
    }

    function payToMint(
        address _recipient,
        uint256 _reveal,
        string memory _previewURI,
        string memory _tokenURI
    ) public payable {
        if (_allowance[_msgSender()] > 0) {
            _allowance[_msgSender()] -= 1;
        } else {
            require(msg.value >= price);
        }
        _execMint(_recipient, _msgSender(), _reveal, _previewURI, _tokenURI);
        if (reward > 0) {
            _token.send(_msgSender(), reward, "");
        }
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

    function withdrawEther(uint256 amount) public onlyRole(FINANCE_ROLE) {
        require(amount <= address(this).balance);
        payable(_msgSender()).transfer(amount);
        emit WithdrawEther(_msgSender(), amount);
    }

    function withdrawToken(uint256 amount) public onlyRole(FINANCE_ROLE) {
        require(amount <= _token.balanceOf(address(this)));
        _token.send(_msgSender(), amount, "");
        emit WithdrawToken(_msgSender(), amount);
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

    function setReward(uint256 _reward) public onlyRole(FINANCE_ROLE) {
        reward = _reward;
        emit SetReward(_msgSender(), _reward);
    }

    function setAllowance(address _user, uint256 _allowed)
        public
        onlyRole(FINANCE_ROLE)
    {
        _allowance[_user] = _allowed;
        emit SetAllowance(_msgSender(), _user, _allowed);
    }

    function burn(uint256 tokenId) public {
        require(
            hasRole(BURNER_ROLE, _msgSender()) ||
                ownerOf(tokenId) == _msgSender()
        );
        _burn(tokenId);
        delete _authors[tokenId];
        _burned.increment();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {
        require(msg.sender == address(_token));
        emit ReceivedToken(operator, from, to, amount, userData, operatorData);
    }
}
