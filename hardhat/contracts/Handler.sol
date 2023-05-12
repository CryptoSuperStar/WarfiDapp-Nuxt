// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./INodeType.sol";
import "./ISpringNode.sol";
import "./ISpringLuckyBox.sol";
import "./ISwapper.sol";
import "./ISpringPlot.sol";
import "./Owners.sol";
import "./Waterpacks.sol";
import "./Fertilizers.sol";

contract Handler is Owners, Waterpacks, Fertilizers {
	event NewNode(
		address indexed owner,
		string indexed name,
		uint count
	);

	event NewPlot(
		address indexed owner,
		string indexed name,
		uint count
	);

	struct NodeType {
		string[] keys; // nodeTypeName to address
		mapping(string => address) values;
		mapping(string => uint256) indexOf;
		mapping(string => bool) inserted;
	}

	struct Token {
		uint[] keys; // token ids to nodeTypeName
		mapping(uint => string) values;
		mapping(uint => uint) indexOf;
		mapping(uint => bool) inserted;
	}

	NodeType private mapNt;
	Token private mapToken;

	address public nft;
	
	ISpringLuckyBox private lucky;
	ISwapper private swapper;
	ISpringPlot private plot;

	modifier onlyNft() {
		require(msg.sender == nft, "Handler: Only Nft");
		_;
	}

	// external
	function addNodeType(address _addr) external onlyOwners {
		string memory name = INodeType(_addr).name();
		require(!mapNt.inserted[name], "Handler: NodeType already exists");
		mapNtSet(name, _addr);
	}
	
	function addMultipleNodeTypes(address[] memory _addrs) external onlyOwners {
		for (uint i = 0; i < _addrs.length; i++) {
			string memory name = INodeType(_addrs[i]).name();
			mapNtSet(name, _addrs[i]);
		}
	}

	function updateNodeTypeAddress(string memory name, address _addr) external onlyOwners {
		require(mapNt.inserted[name], "Handler: NodeType doesnt exist");
		mapNt.values[name] = _addr;
	}

	function transferFrom(address from, address to, uint tokenId) external onlyNft {
		INodeType(mapNt.values[mapToken.values[tokenId]])
			.transferFrom(from, to, tokenId);
	}

	function createPlotWithTokens(
		address tokenIn,
		string memory plotType
	)
		external
		returns (uint256)
	{
		(uint256 totalPrice, uint256 tokenId) = plot.createNewPlot(msg.sender, plotType);
		if (totalPrice > 0) {
			swapper.swapNewPlot(tokenIn, msg.sender, totalPrice);
		}

		emit NewPlot(msg.sender, plotType, 1);

		return tokenId;
	}
	
	function createNodesWithLuckyBoxes(
		uint256[] memory tokenIdsLuckyBoxes,
		uint256[] memory tokenIdsPlots
	) external {
		require(tokenIdsLuckyBoxes.length == tokenIdsPlots.length, "Handler: Length mismatch");

		string[] memory nodeTypes;
		string[] memory features;
		
		(nodeTypes, features) = lucky
			.createNodesWithLuckyBoxes(msg.sender, tokenIdsLuckyBoxes);

		for (uint256 i = 0; i < nodeTypes.length; i++) {
			uint256[] memory tokenIdArray = _setUpNodes(nodeTypes[i], msg.sender, 1);

			INodeType nodeType = INodeType(mapNt.values[nodeTypes[i]]);
			nodeType.createNodeWithLuckyBox(
				msg.sender,
				tokenIdArray, 
				features[i]
			);

			_moveNodeToPlot(msg.sender, tokenIdArray[0], tokenIdsPlots[i], nodeType);
		
			emit NewNode(msg.sender, nodeTypes[i], 1);
		}
	}
	
	function createNodesAirDrop(
		string memory name,
		address user,
		uint isBoostedAirDropRate,
		bool[] memory areBoostedNft,
		bool isBoostedToken,
		string memory feature, 
		uint count
	) 
		external 
		onlyOwners 
	{
		require(areBoostedNft.length == 1, "Handler: Create one by one");
		require(count > 0, "Handler: Count must be greater than 0");
		
		for (uint i = 0; i < count; i++) {
			uint[] memory tokenIds = _setUpNodes(name, user, 1);

			INodeType(mapNt.values[name])
				.createNodeCustom(
					user,
					isBoostedAirDropRate,
					tokenIds, 
					areBoostedNft,
					isBoostedToken,
					feature
				);
		}

		emit NewNode(user, name, count);
	}

	function createLuckyBoxesWithTokens(
		address tokenIn,
		address user,
		string memory name,
		uint count,
		string memory sponso
	) 
		external 
	{
		uint price = lucky
			.createLuckyBoxesWithTokens(name, count, user);
		
		swapper.swapCreateLuckyBoxesWithTokens(tokenIn, msg.sender, price, sponso);
	}

	function createLuckyBoxesAirDrop(
		string memory name,
		address user,
		uint count
	) 
		external 
		onlyOwners 
	{
		lucky.createLuckyBoxesAirDrop(name, count, user);
	}

	function nodeEvolution(
		string memory name,
		address user,
		uint[] memory tokenIds,
		uint isBoostedAirDropRate,
		bool[] memory areBoostedNft,
		bool isBoostedToken,
		string memory feature
	) 
		external 
		onlyOwners 
	{
		require(tokenIds.length == 1, "Handler: Evolve one by one");
		require(tokenIds.length == areBoostedNft.length, "Handler: Length mismatch");
		require(mapNt.inserted[name], "Handler: NodeType doesnt exist");
		require(mapToken.inserted[tokenIds[0]], "Handler: Token doesnt exist");

		INodeType(mapNt.values[mapToken.values[tokenIds[0]]])
			.burnFrom(user, tokenIds);
		
		mapTokenSet(tokenIds[0], name);
		
		INodeType(mapNt.values[name])
			.createNodeCustom(
				user, 
				isBoostedAirDropRate, 
				tokenIds,
				areBoostedNft,
				isBoostedToken,
				feature
			);

		ISpringNode(nft).setTokenIdToNodeType(tokenIds[0], name);
	}

	function claimRewardsAll(address tokenOut, address user) external {
		require(user == msg.sender || isOwner[msg.sender], "Handler: Dont mess with other claims");
		
		uint rewardsTotal;
		uint feesTotal;

		for (uint i = 0; i < mapNt.keys.length; i++) {
			(uint rewards, uint fees) = INodeType(mapNt.values[mapNt.keys[i]])
				.claimRewardsAll(user);
			rewardsTotal += rewards;
			feesTotal += fees;
		}

		swapper.swapClaimRewardsAll(tokenOut, user, rewardsTotal, feesTotal);
	}

	function claimRewardsBatch(
		address tokenOut,
		address user,
		string[] memory names,
		uint[][] memory tokenIds
	)
		public
	{
		require(user == msg.sender || isOwner[msg.sender], "Handler: Dont mess with other claims");

		uint rewardsTotal;
		uint feesTotal;

		require(names.length == tokenIds.length, "Handler: Length mismatch");

		for (uint i = 0; i < names.length; i++) {
			require(mapNt.inserted[names[i]], "Handler: NodeType doesnt exist");
			
			(uint rewards, uint fees) = INodeType(mapNt.values[names[i]])
				.claimRewardsBatch(user, tokenIds[i]);
			rewardsTotal += rewards;
			feesTotal += fees;
		}
		
		swapper.swapClaimRewardsBatch(tokenOut, user, rewardsTotal, feesTotal);
	}
	
	function claimRewardsNodeType(
		address tokenOut,
		address user,
		string memory name
	)
		public
	{
		require(user == msg.sender || isOwner[msg.sender], "Handler: Dont mess with other claims");
		require(mapNt.inserted[name], "Handler: NodeType doesnt exist");

		(uint rewardsTotal, uint feesTotal) = INodeType(mapNt.values[name])
			.claimRewardsAll(user);

		swapper.swapClaimRewardsNodeType(tokenOut, user, rewardsTotal, feesTotal);
	}

	function applyWaterpackBatch(
		address tokenIn,
		address user,
		string[] memory nodeTypesNames,
		uint[][] memory tokenIds,
		string calldata waterpackTypeName
	)
		external
	{
		require(user == msg.sender || isOwner[msg.sender], "Handler: Dont mess with other claims");
        require(_hasWaterpackType(waterpackTypeName), "Handler: Waterpack type doesn't exists");

		Waterpack memory waterpack = _getWaterpackType(waterpackTypeName);

		uint256 amount = 0;
		for(uint i = 0; i < nodeTypesNames.length; i++) {
			string memory name = nodeTypesNames[i];
			require(mapNt.inserted[name], "Handler: NodeType doesnt exist");
			INodeType(mapNt.values[name]).applyWaterpackBatch(user, tokenIds[i], waterpack.ratioOfROI);
			amount += tokenIds[i].length;
		}

		swapper.swapApplyWaterpack(
			tokenIn,
			user,
			waterpack.price * amount
		);
	}

	function applyFertilizerBatch(
		address tokenIn,
		address user,
		string[] memory nodeTypesNames,
		uint[][] memory tokenIds,
		string calldata fertilizerTypeName
	)
		external
	{
		require(user == msg.sender || isOwner[msg.sender], "Handler: Dont mess with other claims");
        require(_hasFertilizerType(fertilizerTypeName), "Handler: Fertilizer type doesn't exists");

		Fertilizer memory fertilizer = _getFertilizerType(fertilizerTypeName);

		uint256 amount = 0;
		for(uint i = 0; i < nodeTypesNames.length; i++) {
			string memory name = nodeTypesNames[i];
			require(mapNt.inserted[name], "Handler: NodeType doesnt exist");
			INodeType(mapNt.values[name]).applyFertilizerBatch(user, tokenIds[i], fertilizer.durationEffect, fertilizer.rewardBoost);
			amount += tokenIds[i].length;
		}

		swapper.swapApplyFertilizer(
			tokenIn,
			user,
			fertilizer.price * amount
		);
	}

	function moveNodesToPlots(
		uint256[] memory plotTokenIds,
		uint256[][] memory nodeTokenIds
	)
		external
	{
		require(plotTokenIds.length == nodeTokenIds.length, "Handler: Length mismatch");

		for(uint256 i = 0; i < plotTokenIds.length; i++) {
			uint256 plotTokenId = plotTokenIds[i];
			for (uint256 j = 0; j < nodeTokenIds[i].length; j++) {
				uint256 nodeTokenId = nodeTokenIds[i][j];
				_moveNodeToPlot(msg.sender, nodeTokenId, plotTokenId);
			}
		}
	}

	// external setters
	// handler setters
	function setNft(address _new) external onlyOwners {
		require(_new != address(0), "Handler: Nft cannot be address zero");
		nft = _new;
	}
	
	function setLucky(address _new) external onlyOwners {
		require(_new != address(0), "Handler: Loot cannot be address zero");
		lucky = ISpringLuckyBox(_new);
	}
	
	function setSwapper(address _new) external onlyOwners {
		require(_new != address(0), "Handler: Swapper cannot be address zero");
		swapper = ISwapper(_new);
	}

	function setPlot(address _new) external onlyOwners {
		require(_new != address(0), "Handler: Plot cannot be address zero");
		plot = ISpringPlot(_new);
	}
	
	// external view
	function getNodeTypesSize() external view returns(uint) {
		return mapNt.keys.length;
	}

	function getTotalCreatedNodes() external view returns(uint) {
		uint totalNodes;
		for (uint i = 0; i < mapNt.keys.length; i++) {
			totalNodes += INodeType(mapNt.values[mapNt.keys[i]])
				.totalCreatedNodes();
		}
		return totalNodes;
	}
	
	function getNodeTypesBetweenIndexes(
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(string[] memory) 
	{
		string[] memory nodeTypes = new string[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			nodeTypes[i - iStart] = mapNt.keys[i];
		return nodeTypes;
	}
	
	function getNodeTypesAddress(string memory key) external view returns(address) {
		require(mapNt.inserted[key], "NodeType doesnt exist");
		return mapNt.values[key];
	}

	function getAttribute(uint tokenId) external view returns(string memory) {
		return INodeType(mapNt.values[mapToken.values[tokenId]])
			.getAttribute(tokenId);
	}
	
	function getTokenIdsSize() external view returns(uint) {
		return mapToken.keys.length;
	}
	
	function getTokenIdsBetweenIndexes(
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(uint[] memory) 
	{
		uint[] memory ids = new uint[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			ids[i - iStart] = mapToken.keys[i];
		return ids;
	}
	
	function getTokenIdsNodeTypeBetweenIndexes(
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(string[] memory) 
	{
		string[] memory names = new string[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			names[i - iStart] = mapToken.values[mapToken.keys[i]];
		return names;
	}
	
	function getTokenIdNodeTypeName(uint key) external view returns(string memory) {
		require(mapToken.inserted[key], "TokenId doesnt exist");
		return mapToken.values[key];
	}

	function getTotalNodesOf(address user) external view returns(uint) {
		uint totalNodes;
		for (uint i = 0; i < mapNt.keys.length; i++) {
			totalNodes += INodeType(mapNt.values[mapNt.keys[i]])
				.getTotalNodesNumberOf(user);
		}
		return totalNodes;
	}
	
	function getClaimableRewardsOf(address user) external view returns(uint, uint) {
		uint rewardsTotal;
		uint feesTotal;
		for (uint i = 0; i < mapNt.keys.length; i++) {
			(uint rewards, uint fees) = INodeType(mapNt.values[mapNt.keys[i]])
				.calculateUserRewards(user);
				rewardsTotal += rewards;
				feesTotal += fees;
		}
		return (rewardsTotal, feesTotal);
	}

	// internal
	function _setUpNodes(
		string memory name,
		address user,
		uint count
	)
		private
		returns(
			uint[] memory
		)
	{
		require(mapNt.inserted[name], "Handler: NodeType doesnt exist");

		uint[] memory tokenIds = ISpringNode(nft).generateNfts(name, user, count);

		for (uint i = 0; i < tokenIds.length; i++)
			mapTokenSet(tokenIds[i], name);

		return tokenIds;
	}

	function _moveNodeToPlot(
		address owner,
		uint nodeTokenId,
		uint plotTokenId
	)
		private
	{
		string memory nodeTypeName = ISpringNode(nft).tokenIdsToType(nodeTokenId);
		require(mapNt.inserted[nodeTypeName], "Handler: NodeType doesn't exist");
		return _moveNodeToPlot(owner, nodeTokenId, plotTokenId, INodeType(mapNt.values[nodeTypeName]));
	}

	function _moveNodeToPlot(
		address owner,
		uint nodeTokenId,
		uint plotTokenId,
		INodeType nodeType
	)
		private
	{
		plot.moveNodeToPlot(owner, nodeTokenId, plotTokenId);
		nodeType.setPlotAdditionalLifetime(
			owner,
			nodeTokenId,
			plot.getPlotTypeByTokenId(plotTokenId).additionalROITime
		);
	}

	function strcmp(string memory s1, string memory s2) internal pure returns(bool) {
		return (keccak256(abi.encodePacked((s1))) == keccak256(abi.encodePacked((s2))));
	}

	// private
	// maps
	function mapNtSet(
        string memory key,
        address value
    ) private {
        if (mapNt.inserted[key]) {
            mapNt.values[key] = value;
        } else {
            mapNt.inserted[key] = true;
            mapNt.values[key] = value;
            mapNt.indexOf[key] = mapNt.keys.length;
            mapNt.keys.push(key);
        }
    }
	
	function mapTokenSet(
        uint key,
        string memory value
    ) private {
        if (mapToken.inserted[key]) {
            mapToken.values[key] = value;
        } else {
            mapToken.inserted[key] = true;
            mapToken.values[key] = value;
            mapToken.indexOf[key] = mapToken.keys.length;
            mapToken.keys.push(key);
        }
    }

	function mapNtRemove(string memory key) private {
        if (!mapNt.inserted[key]) {
            return;
        }

        delete mapNt.inserted[key];
        delete mapNt.values[key];

        uint256 index = mapNt.indexOf[key];
        uint256 lastIndex = mapNt.keys.length - 1;
        string memory lastKey = mapNt.keys[lastIndex];

        mapNt.indexOf[lastKey] = index;
        delete mapNt.indexOf[key];

		if (lastIndex != index)
			mapNt.keys[index] = lastKey;
        mapNt.keys.pop();
    }

	function mapTokenRemove(uint key) private {
        if (!mapToken.inserted[key]) {
            return;
        }

        delete mapToken.inserted[key];
        delete mapToken.values[key];

        uint256 index = mapToken.indexOf[key];
        uint256 lastIndex = mapToken.keys.length - 1;
        uint lastKey = mapToken.keys[lastIndex];

        mapToken.indexOf[lastKey] = index;
        delete mapToken.indexOf[key];

		if (lastIndex != index)
			mapToken.keys[index] = lastKey;
        mapToken.keys.pop();
    }
}
