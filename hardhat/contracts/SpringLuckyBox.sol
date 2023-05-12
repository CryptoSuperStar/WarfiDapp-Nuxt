// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IHandler.sol";
import "./Owners.sol";

import "hardhat/console.sol";

contract SpringLuckyBox is ERC721, ERC721Enumerable, Owners {
    using Counters for Counters.Counter;

    struct Box {
        uint256 priceTokens;
        uint256[] probability;
        string[] nodeType;
        string[] feature;
        uint256[] counter;
        uint256[] remaining;
        uint256 createdBox;
        uint256 openBox;
        uint256 maxBox;
        uint256 maxUser;
        string attribute;
    }

    struct Map {
        string[] keys;
        mapping(string => Box) values;
        mapping(string => uint256) indexOf;
        mapping(string => bool) inserted;
    }

    Map private map;
    uint256 private nonce;

    address public handler;
    mapping(uint256 => string) public tokenIdsToType;
    mapping(string => mapping(address => uint256)) public boxesUserCount;

    Counters.Counter private _tokenIdCounter;
    string private uriBase;

    mapping(address => bool) public isBlacklisted;

    bool public openCreateLuckyBoxesWithTokens = false;

    constructor(string memory uri, address _handler)
        ERC721("Spring Lucky Box", "SPRING-LB")
    {
        uriBase = uri;
        handler = _handler;
    }

    modifier onlyHandler() {
        require(
            msg.sender == handler,
            "SpringLuckyBox: God mode not activated"
        );
        _;
    }

    // external
    function updateSpringLuckyBox(
        string memory name,
        uint256 priceTokens,
        uint256[] memory probability,
        string[] memory nodeType,
        string[] memory feature,
        uint256[] memory remaining,
        uint256 maxBox,
        uint256 maxUser,
        string memory attribute
    ) external onlyOwners {
        require(
            probability.length == nodeType.length,
            "SpringLuckyBox: Length mismatch"
        );
        require(
            nodeType.length == feature.length,
            "SpringLuckyBox: Length mismatch"
        );
        require(
            feature.length == remaining.length,
            "SpringLuckyBox: Length mismatch"
        );
        require(
            feature.length > 1,
            "SpringLuckyBox: Length must be greater than 1"
        );

        uint256[] memory counter = new uint256[](nodeType.length);
        Box memory box = map.values[name];

        if (map.inserted[name]) {
            for (uint256 i = 0; i < nodeType.length; i++) {
                for (uint256 j = 0; j < box.nodeType.length; j++) {
                    if (
                        strcmp(nodeType[i], box.nodeType[j]) &&
                        strcmp(feature[i], box.feature[j])
                    ) {
                        counter[i] = box.counter[j];
                        break;
                    }
                }
            }
        }

        mapSet(
            name,
            Box({
                priceTokens: priceTokens,
                probability: _updateProbability(probability),
                nodeType: nodeType,
                feature: feature,
                counter: counter,
                remaining: remaining,
                createdBox: box.createdBox,
                openBox: box.openBox,
                maxBox: maxBox,
                maxUser: maxUser,
                attribute: attribute
            })
        );

        checkBoxIntegrity(map.values[name]);
    }

    function createLuckyBoxesWithTokens(
        string memory name,
        uint256 count,
        address user
    ) external onlyHandler returns (uint256) {
        require(openCreateLuckyBoxesWithTokens, "SpringLuckyBox: Not open");
        mintBoxes(name, user, count);

        Box storage box = map.values[name];
        require(box.createdBox <= box.maxBox, "SpringLuckyBox: Out of stock");
        require(
            boxesUserCount[name][user] <= map.values[name].maxUser,
            "SpringLuckyBox: User got too many boxes of this type"
        );

        return map.values[name].priceTokens * count;
    }

    function createLuckyBoxesAirDrop(
        string memory name,
        uint256 count,
        address user
    ) external onlyHandler {
        mintBoxes(name, user, count);

        checkBoxIntegrity(map.values[name]);
    }

    function createNodesWithLuckyBoxes(address user, uint256[] memory tokenIds)
        external
        onlyHandler
        returns (string[] memory, string[] memory)
    {
        string[] memory nodeTypes = new string[](tokenIds.length);
        string[] memory features = new string[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];

            require(ownerOf(tokenId) == user, "SpringLuckyBox: Not nft owner");

            Box storage box = map.values[tokenIdsToType[tokenId]];

            box.openBox++;

            uint256 r = _generatePseudoRandom(user);

            for (uint256 j = 0; j < box.probability.length; j++) {
                if (r < box.probability[j]) {
                    super._burn(tokenId);
                    box.counter[j]++;
                    box.remaining[j]--;
                    if (box.remaining[j] == 0) {
                        if (j > 0) {
                            uint256 k = j - 1;
                            while (k >= 0) {
                                if (box.probability[k] != 0) {
                                    box.probability[k] = box.probability[j];
                                    break;
                                }
                                if (k == 0) break;
                                k--;
                            }
                        }
                        box.probability[j] = 0;
                    }

                    nodeTypes[i] = box.nodeType[j];
                    features[i] = box.feature[j];

                    break;
                } else if (j + 1 == box.probability.length) {
                    revert("SpringLuckyBox: Unexpected output");
                }
            }
        }
        return (nodeTypes, features);
    }

    // external setters
    function setBaseURI(string memory _new) external onlyOwners {
        uriBase = _new;
    }

    function setHandler(address _new) external onlyOwners {
        handler = _new;
    }

    function setIsBlacklisted(address _new, bool _value) external onlyOwners {
        isBlacklisted[_new] = _value;
    }

    function setOpenCreate(bool _openCreateLuckyBoxesWithTokens)
        external
        onlyOwners
    {
        openCreateLuckyBoxesWithTokens = _openCreateLuckyBoxesWithTokens;
    }

    function setSpringLuckyBoxPrice(string memory name, uint256 _new)
        external
        onlyOwners
    {
        require(map.inserted[name], "SpringLuckyBox: Name doesnt exist");
        map.values[name].priceTokens = _new;
    }

    function setSpringLuckyBoxMaxUser(string memory name, uint256 _new)
        external
        onlyOwners
    {
        require(map.inserted[name], "SpringLuckyBox: Name doesnt exist");
        map.values[name].maxUser = _new;
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

    function getBoxSize() external view returns (uint256) {
        return map.keys.length;
    }

    function getMapKeysBetweenIndexes(uint256 iStart, uint256 iEnd)
        external
        view
        returns (string[] memory)
    {
        string[] memory keys = new string[](iEnd - iStart);
        for (uint256 i = iStart; i < iEnd; i++) keys[i - iStart] = map.keys[i];
        return keys;
    }

    function getMapBetweenIndexes(uint256 iStart, uint256 iEnd)
        external
        view
        returns (Box[] memory)
    {
        Box[] memory box = new Box[](iEnd - iStart);
        for (uint256 i = iStart; i < iEnd; i++)
            box[i - iStart] = map.values[map.keys[i]];
        return box;
    }

    function getMapForKey(string memory key)
        external
        view
        returns (Box memory)
    {
        require(map.inserted[key], "SpringLuckyBox: Key doesnt exist");
        return map.values[key];
    }

    function getAttribute(uint256 tokenId)
        external
        view
        returns (string memory)
    {
        return map.values[tokenIdsToType[tokenId]].attribute;
    }

    // public

    // internal
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(
            !isBlacklisted[from] && !isBlacklisted[to],
            "SpringLuckyBox: Blacklisted address"
        );
        super._transfer(from, to, tokenId);
    }

    function mintBoxes(
        string memory name,
        address user,
        uint256 count
    ) internal {
        require(!isBlacklisted[user], "SpringLuckyBox: Blacklisted address");
        require(map.inserted[name], "SpringLuckyBox: Box doesnt exist");

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            tokenIdsToType[tokenId] = name;
            _safeMint(user, tokenId);
            _tokenIdCounter.increment();
        }

        map.values[name].createdBox += count;
        boxesUserCount[name][user] += count;
    }

    function _baseURI() internal view override returns (string memory) {
        return uriBase;
    }

    function strcmp(string memory s1, string memory s2)
        internal
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((s1))) ==
            keccak256(abi.encodePacked((s2))));
    }

    function checkBoxIntegrity(Box memory box) internal pure {
        uint256 count;
        for (uint256 i = 0; i < box.remaining.length; i++) {
            if (box.probability[i] > 0) {
                require(
                    box.remaining[i] > 0,
                    "SpringLuckyBox: Probability must be 0 if no box remaining"
                );
                count += box.remaining[i];
            }
        }
        uint256 max = (box.maxBox >= box.createdBox)
            ? box.maxBox
            : box.createdBox;
        require(
            count >= max - box.openBox,
            "SpringLuckyBox: Sum remaining lower than max - open box"
        );
    }

    function _updateProbability(uint256[] memory probability)
        internal
        pure
        returns (uint256[] memory)
    {
        uint256 last = probability[0];

        for (uint256 i = 1; i < probability.length; i++) {
            if (probability[i] != 0) {
                probability[i] += last;
                last = probability[i];
            }
        }

        require(
            last == 10000,
            "SpringLuckyBox: Total probability must be 100%"
        );

        return probability;
    }

    function _generatePseudoRandom(address user) internal returns (uint256) {
        uint256 r = uint256(
            keccak256(
                abi.encodePacked(nonce, user, block.difficulty, block.timestamp)
            )
        );
        unchecked {
            nonce++;
        }
        return r % 10000;
    }

    function mapSet(string memory key, Box memory value) private {
        if (map.inserted[key]) {
            map.values[key] = value;
        } else {
            map.inserted[key] = true;
            map.values[key] = value;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function mapRemove(string memory key) private {
        if (!map.inserted[key]) {
            return;
        }

        delete map.inserted[key];
        delete map.values[key];

        uint256 index = map.indexOf[key];
        uint256 lastIndex = map.keys.length - 1;
        string memory lastKey = map.keys[lastIndex];

        map.indexOf[lastKey] = index;
        delete map.indexOf[key];

        if (lastIndex != index) map.keys[index] = lastKey;
        map.keys.pop();
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
