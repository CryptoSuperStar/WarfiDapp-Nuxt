// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Owners.sol";
import "./SpringNode.sol";
import "./libraries/Percentage.sol";
import "./libraries/NodeRewards.sol";
import "./IHandler.sol";
import "./ISpringNode.sol";
import "./ISpringPlot.sol";

uint256 constant defaultMaxNodes = 8;
string constant defaultPlotTypeName = "Default";

struct PlotTypeSpec {
    uint256 price;
    uint256 maxNodes;
    string[] allowedNodeTypes;
    UPercentage additionalROITime;
}

struct PlotInstance {
    uint256[] nodeTokenIds;
    mapping(uint256 => uint256) nodeTokenIdsToIndexPlusOne;
}

/// @notice A plot houses trees (nodes) and adds additional lifetime to the
contract SpringPlot is ERC721Enumerable, Owners, ISpringPlot {
    using Counters for Counters.Counter;
    using Percentages for UPercentage;

    IHandler private _handler;
    ISpringNode private _springNode;

    /// @dev Incremented at construction time, so the first plot is 1. Therefore
    /// we can use 0 as a null value, useful for mappings.
    Counters.Counter private _tokenIdCounter;

    struct PlotTypes {
        string[] names;
        mapping(string => PlotTypeSpec) types;
        mapping(string => bool) exists;
    }

    PlotTypes internal _plotTypes;

    /// @dev As the plot token IDs starts at 1, we can use 0 as a null value.
    /// We can also consider that any node mapped to a null value means that
    /// the node doesn't exist.
    mapping(uint256 => uint256) internal _nodeToPlotTokenId;

    mapping(uint256 => PlotInstance) internal _instances;
    mapping(uint256 => string) internal _tokenIdsToType;


    modifier onlyHandler() {
        require(msg.sender == address(_handler), "SpringPlot: Only handler");
        _;
    }

    constructor(
        IHandler handler,
        ISpringNode springNode
    ) 
        ERC721("Spring Plot", "SPRING-P")
    {
        _handler = handler;
        _springNode = springNode;
        _tokenIdCounter.increment();
        _setPlotType(
            defaultPlotTypeName,
            PlotTypeSpec({
                price: 0,
                maxNodes: defaultMaxNodes,
                allowedNodeTypes: new string[](0),
                additionalROITime: Percentages.from(0)
            })
        );
    }

    function createNewPlot(
        address user,
        string memory plotTypeName
    )
        public
        onlyHandler
        returns (uint256, uint256)
    {
        require(user != address(0), "SpringPlot: Null address");
        (uint256 tokenId, PlotTypeSpec storage plotType) = _createNewPlot(user, plotTypeName);
        uint256 price = plotType.price;
        return (price, tokenId);
    }

    function moveNodeToPlot(
        address user,
        uint256 nodeTokenId,
        uint256 plotTokenId
    )
        public
        onlyHandler
    {
        _moveNodeToPlot(user, nodeTokenId, plotTokenId);
    }

    /// @notice Returns the plot type with the best additional ROI time for a
    /// given node type.
    /// @param requestedNodeType The node type to check
    /// @param availablePlotTypes The available plot types to check upon
    /// @return The plot type with the best yield, or an empty string if none
    function getBestPlotTypeFromList(
        string calldata requestedNodeType,
        string[] calldata availablePlotTypes
    )
        public
        view
        returns (string memory)
    {
        uint256 bestIndexPlusOne = 0;
        uint256 bestROITime = 0;
        for (uint256 i = 0; i < availablePlotTypes.length; i++) {
            string memory plotType = availablePlotTypes[i];
            (
                bool plotTypeExists,
                PlotTypeSpec memory plotTypeSpec
            ) = _safeGetPlotType(plotType);
            require(plotTypeExists, "SpringPlot: nonexistant plot type");

            bool hasOurNodeType = false;
            for(uint j = 0; j > plotTypeSpec.allowedNodeTypes.length; j++) {
                string memory nodeType = plotTypeSpec.allowedNodeTypes[j];
                if (_compareStrings(nodeType, requestedNodeType)) {
                    hasOurNodeType = true;
                    break;
                }
            }

            if (!hasOurNodeType) {
                break;
            }

            uint256 thisROITime = UPercentage.unwrap(
                plotTypeSpec.additionalROITime
            );
            if (thisROITime > bestROITime) {
                bestIndexPlusOne = i + 1;
                bestROITime = thisROITime;
            }
        }

        if (bestIndexPlusOne == 0) {
            return defaultPlotTypeName;
        }

        return availablePlotTypes[bestIndexPlusOne - 1];
    }

    //====== View API ========================================================//

    function getPlotTypeByTokenId(
        uint256 tokenId
    )
        external
        view
        returns (PlotTypeView memory)
    {
        require(_exists(tokenId), "SpringPlot: nonexistant token ID");
        string memory plotType = _tokenIdsToType[tokenId];
        PlotTypeSpec memory plotTypeSpec = _getPlotType(plotType);

        return PlotTypeView(
            plotType,
            plotTypeSpec.price,
            plotTypeSpec.maxNodes,
            plotTypeSpec.allowedNodeTypes,
            plotTypeSpec.additionalROITime
        );
    }

    //====== Internal API ====================================================//

    function _setPlotType(
        string memory name,
        PlotTypeSpec memory spec
    )
        internal
    {
        require(!_plotTypes.exists[name], "SpringPlot: type already exists");
        _plotTypes.types[name] = spec;
        _plotTypes.names.push(name);
        _plotTypes.exists[name] = true;
    }

    function _safeGetPlotType(
        string memory name
    )
        internal
        view
        returns (bool exists, PlotTypeSpec storage spec)
    {
        exists = _plotTypes.exists[name];
        spec = _plotTypes.types[name];
    }

    function _getPlotType(
        string memory name
    )
        internal
        view
        returns (PlotTypeSpec storage)
    {
        require(_plotTypes.exists[name], "SpringPlot: nonexistant plot type");
        return _plotTypes.types[name];
    }

    /// @dev Assumes that nodeTokenId is a valid node token ID.
    function _moveNodeToPlot(
        address user,
        uint256 nodeTokenId,
        uint256 plotTokenId
    )
        internal
    {
        require(_nodeTokenIdExists(nodeTokenId), "SpringPlot: Node does not exist");
        require(_exists(plotTokenId), "SpringPlot: nonexistant token ID");
        require(ownerOf(plotTokenId) == user, "SpringPlot: Not owner");
        require(_springNode.ownerOf(nodeTokenId) == user, "SpringPlot: Not owner");

        (bool oldPlotExists, PlotInstance storage oldPlot) = _safeGetPlotFromNodeTokenId(
            nodeTokenId
        );

        if(oldPlotExists) {
            _removeNodeFromPlot(nodeTokenId, oldPlot);
        }

        PlotInstance storage newPlot = _instances[plotTokenId];
        newPlot.nodeTokenIds.push(nodeTokenId);
        newPlot.nodeTokenIdsToIndexPlusOne[nodeTokenId] = newPlot.nodeTokenIds.length;
    }

    /// @dev Has no effect if the node is not in the given plot.
    function _removeNodeFromPlot(
        uint nodeTokenId,
        PlotInstance storage plot
    ) internal {
        uint256 indexPlusOne = plot.nodeTokenIdsToIndexPlusOne[nodeTokenId];
        if(indexPlusOne == 0) {
            return;
        }

        uint256 lastIndex = plot.nodeTokenIds.length - 1;
        if(lastIndex != indexPlusOne - 1) {
            plot.nodeTokenIds[indexPlusOne - 1] = plot.nodeTokenIds[lastIndex];
        }

        plot.nodeTokenIds.pop();
        delete plot.nodeTokenIdsToIndexPlusOne[nodeTokenId];
    }

    function _nodeTokenIdExists(
        uint256 nodeTokenId
    ) internal view returns (bool) {
        return bytes(_getNodeTypeFromTokenId(nodeTokenId)).length != 0;
    }

    function _getNodeTypeFromTokenId(
        uint256 nodeTokenId
    ) internal view returns (string memory) {
        return _springNode.tokenIdsToType(nodeTokenId);
    }

    function _safeGetPlotFromNodeTokenId(
        uint256 nodeTokenId
    ) internal view returns (bool exists, PlotInstance storage plot) {
        exists = _nodeToPlotTokenId[nodeTokenId] != 0;
        plot = _instances[_nodeToPlotTokenId[nodeTokenId]];
    }

    function _createNewPlot(
        address owner,
        string memory plotTypeName
    )
        internal
        returns (uint256 tokenId, PlotTypeSpec storage plotType)
    {
        bool plotTypeExists;
        (plotTypeExists, plotType) = _safeGetPlotType(plotTypeName);
        require(plotTypeExists, "SpringPlot: nonexistant plot type");

        tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(owner, tokenId);
        _tokenIdsToType[tokenId] = plotTypeName;
    }

    function _onNodeCreated(
        Node storage node
    ) internal {

    }

    function _compareStrings(
        string memory a,
        string memory b
    )
        private
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
