// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IHandler.sol";
import "./Owners.sol";

contract SpringNode is ERC721, ERC721Enumerable, Owners {
    using Counters for Counters.Counter;

    address public handler;
    mapping(uint256 => string) public tokenIdsToType;

    Counters.Counter private _tokenIdCounter;
    string private uriBase;

    mapping(address => bool) public isBlacklisted;

    bool public openCreateNft = false;

    address[] public nodeOwners;
    mapping(address => bool) public nodeOwnersInserted;

    constructor(string memory uri, address _handler)
        ERC721("Spring Node", "SN")
    {
        uriBase = uri;
        handler = _handler;
    }

    modifier onlyHandler() {
        require(msg.sender == handler, "SpringNode: God mode not activated");
        _;
    }

    // external
    function burnBatch(address user, uint256[] memory tokenIds)
        external
        onlyHandler
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) == user, "SpringNode: Not nft owner");
            super._burn(tokenIds[i]);
        }
    }

    function generateNfts(
        string memory name,
        address user,
        uint256 count
    ) external onlyHandler returns (uint256[] memory) {
        require(!isBlacklisted[user], "SpringNode: Blacklisted address");
        require(openCreateNft, "SpringNode: Not open");

        if (nodeOwnersInserted[user] == false) {
            nodeOwners.push(user);
            nodeOwnersInserted[user] = true;
        }

        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            tokenIds[i] = tokenId;
            tokenIdsToType[tokenId] = name;
            _safeMint(user, tokenId);
            _tokenIdCounter.increment();
        }

        return tokenIds;
    }

    // external setters
    function setTokenIdToType(uint256 tokenId, string memory nodeType)
        external
        onlyHandler
    {
        tokenIdsToType[tokenId] = nodeType;
    }

    function setBaseURI(string memory _new) external onlyOwners {
        uriBase = _new;
    }

    function setHandler(address _new) external onlyOwners {
        handler = _new;
    }

    function setIsBlacklisted(address _new, bool _value) external onlyOwners {
        isBlacklisted[_new] = _value;
    }

    function setOpenCreateNft(bool _new) external onlyOwners {
        openCreateNft = _new;
    }

    // external view
    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    function tokensOfOwner(address user)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory result = new uint256[](balanceOf(user));
        for (uint256 i = 0; i < balanceOf(user); i++)
            result[i] = tokenOfOwnerByIndex(user, i);
        return result;
    }

    function tokensOfOwnerByIndexesBetween(
        address user,
        uint256 iStart,
        uint256 iEnd
    ) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](iEnd - iStart);
        for (uint256 i = iStart; i < iEnd; i++)
            result[i - iStart] = tokenOfOwnerByIndex(user, i);
        return result;
    }

    function getNodeOwnersSize() external view returns (uint256) {
        return nodeOwners.length;
    }

    function getNodeOwnersBetweenIndexes(uint256 iStart, uint256 iEnd)
        external
        view
        returns (address[] memory)
    {
        address[] memory no = new address[](iEnd - iStart);
        for (uint256 i = iStart; i < iEnd; i++) no[i - iStart] = nodeOwners[i];
        return no;
    }

    function getAttribute(uint256 tokenId)
        external
        view
        returns (string memory)
    {
        return IHandler(handler).getAttribute(tokenId);
    }

    // public

    // internal
    function _baseURI() internal view override returns (string memory) {
        return uriBase;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(
            !isBlacklisted[from] && !isBlacklisted[to],
            "SpringNode: Blacklisted address"
        );

        if (nodeOwnersInserted[to] == false) {
            nodeOwners.push(to);
            nodeOwnersInserted[to] = true;
        }

        IHandler(handler).transferFrom(from, to, tokenId);
        super._transfer(from, to, tokenId);
    }

    // ERC721 && ERC721Enumerable required overriding
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
