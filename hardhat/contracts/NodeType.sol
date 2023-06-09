// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./INodeType.sol";
import "./Owners.sol";
import "./libraries/NodeRewards.sol";
import "./libraries/Percentage.sol";

import "hardhat/console.sol";

contract NodeType is INodeType, Owners, NodeRewards {
	using Percentages for UPercentage;

	struct User {
		uint[] keys; // userTokenId
		mapping(uint => Node) values;
		mapping(uint => uint) indexOf;
		mapping(uint => bool) inserted;
		uint countLevelUp;
		uint countPending;
	}

	mapping(address => User) private userOf;
	mapping(uint => address) public tokenIdToOwner;

	string public name;

	uint public totalCreatedNodes;

	uint public maxCount;
	uint public price;
	uint public claimTime;
	uint public rewardAmount;
	uint public claimTaxRoi;
	uint public maxLevelUpUser;
	uint public maxLevelUpTotal;
	uint public maxCreationPendingUser;
	uint public maxCreationPendingTotal;
	uint public maxUser;
	uint public isBoostedNftRate;
	uint public isBoostedNftProbability;
	uint public obtainingTimeReference;
	uint public obtainingTimeRate;
	uint public isBoostedTokenRate;
	uint public noClaimRewardAmount;
	uint public noClaimTimeReference;
	uint public globalTax;
	uint public claimTimeReference;
	uint public claimTimeRate;
	uint public maxMultiObtaining;
	uint public maxMultiClaim;

	bool public canBeBoostedNftToken = true;
	bool public canBeBoostedNftLevelUp = false;
	bool public canBeBoostedNftPending = false;
	bool public canBeBoostedNftLucky = false;
	bool public canBeBoostedNftMigration = false;

	bool public isBoostedTokenToken = true;
	bool public isBoostedTokenLevelUp = false;
	bool public isBoostedTokenPending = false;
	bool public isBoostedTokenLucky = false;
	bool public isBoostedTokenMigration = false;

	bool public openCreateNodesWithTokens = false;
	bool public openCreateNodesLevelUp = false;
	bool public openCreateNodesWithPending = false;
	bool public openCreateNodesWithLuckyBoxes = false;
	bool public openCreateNodesMigration = false;

	string[] features;
	mapping(string => uint) public featureToBoostRate;
	mapping(string => uint) public featureCount;
	
	address[] public nodeOwners;
	mapping(address => bool) public nodeOwnersInserted;

	mapping(address => uint) public ownersMigrated;

	address public handler;

	uint private nonce;

	constructor(
		string memory _name,
		uint[] memory values,
		address _handler
	) {
		require(bytes(_name).length > 0, "NodeType: Name cannot be empty");
		name = _name;

		require(values.length == 22, "NodeType: Values.length mismatch");
		maxCount = values[0];
		price = values[1];
		claimTime = values[2];
		rewardAmount = values[3];

		require(values[4] < 10000, "NodeType: ClaimTaxRoi must be lower than 10000");
		claimTaxRoi = values[4];
		maxLevelUpUser = values[5];
		maxLevelUpTotal = values[6];
		maxCreationPendingUser = values[7];
		maxCreationPendingTotal = values[8];
		maxUser = values[9];
		
		isBoostedNftRate = values[10];
		require(values[11] < 10000, "NodeType: IsBoostedNftProbability must be lower than 10000");
		isBoostedNftProbability = values[11];

		obtainingTimeReference = values[12];
		obtainingTimeRate = values[13];

		require(values[14] < 10000, "NodeType: IsBoostedTokenRate must be lower than 10000");
		isBoostedTokenRate = values[14];

		noClaimTimeReference = values[15];
		noClaimRewardAmount = values[16];
		globalTax = values[17];
		claimTimeReference = values[18];
		claimTimeRate = values[19];
		maxMultiObtaining = values[20];
		maxMultiClaim = values[20];

		handler = _handler;
	}

	modifier onlyHandler() {
		require(msg.sender == handler, "NodeType: Only Handler");
		_;
	}

	// External tokens like
	function transferFrom(address from, address to, uint tokenId) external onlyHandler {
		require(userOf[from].inserted[tokenId], "NodeType: Transfer failure");
		if (nodeOwnersInserted[to] == false) {
			nodeOwners.push(to);
			nodeOwnersInserted[to] = true;
		}
		User storage u = userOf[from];
		u.values[tokenId].owner = to;
		u.values[tokenId].obtainingTime = block.timestamp;
		userSet(userOf[to], tokenId, u.values[tokenId]);
		userRemove(userOf[from], tokenId);
		tokenIdToOwner[tokenId] = to;
	}

	function burnFrom(address from, uint[] memory tokenIds) external onlyHandler returns(uint) {
		for (uint i = 0; i < tokenIds.length; i++) {
			require(userOf[from].inserted[tokenIds[i]], "NodeType: Burn failure");

			Node memory n = userOf[from].values[tokenIds[i]];
			if (featureCount[n.feature] > 0)
				featureCount[n.feature]--;

			userRemove(userOf[from], tokenIds[i]);
			tokenIdToOwner[tokenIds[i]] = address(0);
		}
		totalCreatedNodes -= tokenIds.length;
		return price * tokenIds.length;
	}

	function createNodeWithLuckyBox(
		address user, 
		uint[] memory tokenIds,
		string memory feature
	)
		external
		onlyHandler
	{
		require(openCreateNodesWithLuckyBoxes, "NodeType: Not open");
		bool[] memory areBoostedNft = _randomNftBoosted(user, tokenIds.length, canBeBoostedNftLucky);
		_createNodes(user, tokenIds, areBoostedNft, isBoostedTokenLucky, feature, 0);
	}
	function createNodeCustom(
		address user,
		uint isBoostedAirDropRate,
		uint[] memory tokenIds, 
		bool[] memory areBoostedNft,
		bool isBoostedToken,
		string memory feature
	)
		external
		onlyHandler
	{
		if (bytes(feature).length > 0)
			require(featureToBoostRate[feature] != 0, "NodeType: Feature doesnt exist");
		_createNodes(
			user, 
			tokenIds, 
			areBoostedNft, 
			isBoostedToken, 
			feature, 
			isBoostedAirDropRate
		);
	}

	function claimRewardsAll(address user) external onlyHandler returns(uint, uint) {
		uint rewardsTotal;
		uint feesTotal;
		User storage u = userOf[user];

		for (uint i = 0; i < u.keys.length; i++) {
			Node storage userNode = u.values[u.keys[i]];
			(uint rewards, uint fees) = _calculateNodeRewards(userNode);
			rewardsTotal += rewards;
			feesTotal += fees;
			userNode.lastClaimTime = block.timestamp;
		}

		return (rewardsTotal, feesTotal); // transfer to user
	}
	
	function claimRewardsBatch(
		address user, 
		uint[] memory tokenIds
	) 
		external 
		onlyHandler
		returns(uint, uint) 
	{
		uint rewardsTotal;
		uint feesTotal;
		User storage u = userOf[user];

		for (uint i = 0; i < tokenIds.length; i++) {
			require(u.inserted[tokenIds[i]], "NodeType: User doesnt own this node");
			Node storage userNode = u.values[tokenIds[i]];
			(uint rewards, uint fees) = _calculateNodeRewards(userNode);
			rewardsTotal += rewards;
			feesTotal += fees;
			userNode.lastClaimTime = block.timestamp;
		}

		return (rewardsTotal, feesTotal);
	}

	function applyFertilizerBatch(
		address user,
		uint[] memory tokenIds,
        uint256 durationEffect,
		UPercentage boostAmount
	)
		external
		onlyHandler
	{
		User storage u = userOf[user];

		for (uint i = 0; i < tokenIds.length; i++) {
			require(u.inserted[tokenIds[i]], "NodeType: User doesnt own this node");
			Node storage userNode = u.values[tokenIds[i]];
			_addFertilizer(userNode, durationEffect, boostAmount);
		}
	}

	function applyWaterpackBatch(
		address user,
		uint[] memory tokenIds,
		UPercentage ratioOfROIExtended
	)
		external
		onlyHandler
	{
		User storage u = userOf[user];

		for (uint i = 0; i < tokenIds.length; i++) {
			require(u.inserted[tokenIds[i]], "NodeType: User doesnt own this node");
			Node storage userNode = u.values[tokenIds[i]];
			_extendLifetime(userNode, ratioOfROIExtended);
		}
	}

	function setPlotAdditionalLifetime(
		address user,
		uint256 tokenId,
		UPercentage amountOfROI
	) external onlyHandler {
		User storage u = userOf[user];
		require(u.inserted[tokenId], "NodeType: User doesnt own this node");
		Node storage node = u.values[tokenId];
		node.plotAdditionalLifetime = amountOfROI.times(_timeToROI());
	}

	// External setters
	function addFeature(string memory _name, uint _rate) external onlyOwners {
		require(featureToBoostRate[name] == 0, "NodeType: Feature already exist");
		require(bytes(_name).length > 0, "NodeType: Name cannot be empty");
		features.push(_name);
		featureToBoostRate[_name] = _rate;
	}

	function updateFeature(string memory _name, uint _rate) external onlyOwners {
		require(featureToBoostRate[name] != 0, "NodeType: Feature doesnt exist");
		featureToBoostRate[_name] = _rate;
	}

	function setHandler(address _new) external onlyOwners {
		require(_new != address(0), "NodeType: Handler cannot be address zero");
		handler = _new;
	}
	
	function setBasics(
		uint _newPrice,
		uint _claimTime,
		uint _rewardAmount
	) 
		external 
		onlyOwners 
	{
		require(_newPrice > 0, "NodeType: Price cannot be zero");
		price = _newPrice;
		require(_claimTime > 0, "NodeType: Claim Time cannot be zero");
		claimTime = _claimTime;
		require(_rewardAmount > 0, "NodeType: Reward Amount cannot be zero");
		rewardAmount = _rewardAmount;
	}

	function setTax(
		uint _claimTaxRoi,
		uint _globalTax
	) 
		external 
		onlyOwners 
	{
		claimTaxRoi = _claimTaxRoi;
		globalTax = _globalTax;
	}

	function setMax(
		uint _maxUser,
		uint _maxCount
	) 
		external 
		onlyOwners 
	{
		maxUser = _maxUser;
		maxCount = _maxCount;
	}
	
	function setMaxLevelUp(
		uint _maxLevelUpUser,
		uint _maxLevelUpTotal
	) 
		external 
		onlyOwners 
	{
		maxLevelUpUser = _maxLevelUpUser;
		maxLevelUpTotal = _maxLevelUpTotal;
	}
	
	function setMaxCreationPending(
		uint _maxCreationPendingUser,
		uint _maxCreationPendingTotal
	) 
		external 
		onlyOwners 
	{
		maxCreationPendingUser = _maxCreationPendingUser;
		maxCreationPendingTotal = _maxCreationPendingTotal;
	}
	
	function setIsBoostedNft(
		uint _isBoostedNftRate,
		uint _isBoostedNftProbability
	) 
		external 
		onlyOwners 
	{
		isBoostedNftRate = _isBoostedNftRate;
		require(_isBoostedNftProbability < 10000, 
			"NodeType: Is BoostedNft Probability must be lower than 10000");
		isBoostedNftProbability = _isBoostedNftProbability;
	}
	
	function setObtainingTimeReference(
		uint _obtainingTimeReference,
		uint _obtainingTimeRate
	) 
		external 
		onlyOwners 
	{
		require(_obtainingTimeReference > 0, "NodeType: Obtaining Time Reference cannot be zero");
		obtainingTimeReference = _obtainingTimeReference;
		obtainingTimeRate = _obtainingTimeRate;
	}
	
	function setIsBoostedToken(uint _new) external onlyOwners {
		isBoostedTokenRate = _new;
	}
	
	function setTokenIdSpecs(
		uint tokenId, 
		uint _isBoostedAirDropRate,
		bool _isBoostedNft,
		bool _isBoostedToken,
		string memory _feature
	)
		external 
		onlyOwners 
	{
		Node storage node = userOf[tokenIdToOwner[tokenId]].values[tokenId];

		node.isBoostedAirDropRate = _isBoostedAirDropRate;
		node.isBoostedNft = _isBoostedNft;
		node.isBoostedToken = _isBoostedToken;
		require(featureToBoostRate[_feature] != 0, "NodeType: Feature doesnt exist");
		node.feature = _feature;
	}
	
	function setNoClaimBoost(
		uint _noClaimRewardAmount,
		uint _noClaimTimeReference
	)
		external 
		onlyOwners 
	{
		noClaimRewardAmount = _noClaimRewardAmount;
		require(_noClaimTimeReference > 0, "NodeType: NoClaimTimeReference must be greater than zero");
		noClaimTimeReference = _noClaimTimeReference;
	}
	
	function setClaimTimeBoost(
		uint _claimTimeReference,
		uint _claimTimeRate
	) 
		external 
		onlyOwners 
	{
		require(_claimTimeReference > 0, "NodeType: Claim Time Reference cannot be zero");
		claimTimeReference = _claimTimeReference;
		claimTimeRate = _claimTimeRate;
	}
	
	function setMaxMulti(
		uint _maxMultiObtaining,
		uint _maxMultiClaim
	) 
		external 
		onlyOwners 
	{
		maxMultiObtaining = _maxMultiObtaining;
		maxMultiClaim = _maxMultiClaim;
	}
	
	function setCanBeBoosted(
		bool _canBeBoostedNftToken,
		bool _canBeBoostedNftLevelUp,
		bool _canBeBoostedNftPending,
		bool _canBeBoostedNftLucky,
		bool _canBeBoostedNftMigration
	) 
		external 
		onlyOwners 
	{
		canBeBoostedNftToken = _canBeBoostedNftToken;
		canBeBoostedNftLevelUp = _canBeBoostedNftLevelUp;
		canBeBoostedNftPending = _canBeBoostedNftPending;
		canBeBoostedNftLucky = _canBeBoostedNftLucky;
		canBeBoostedNftMigration = _canBeBoostedNftMigration;
	}
	
	function setIsBoosted(
		bool _isBoostedTokenToken,
		bool _isBoostedTokenLevelUp,
		bool _isBoostedTokenPending,
		bool _isBoostedTokenLucky,
		bool _isBoostedTokenMigration
	) 
		external 
		onlyOwners 
	{
		isBoostedTokenToken = _isBoostedTokenToken;
		isBoostedTokenLevelUp = _isBoostedTokenLevelUp;
		isBoostedTokenPending = _isBoostedTokenPending;
		isBoostedTokenLucky = _isBoostedTokenLucky;
		isBoostedTokenMigration = _isBoostedTokenMigration;
	}
	
	function setOpenCreate(
		bool _openCreateNodesWithTokens,
		bool _openCreateNodesLevelUp,
		bool _openCreateNodesWithPending,
		bool _openCreateNodesWithLuckyBoxes,
		bool _openCreateNodesMigration
	) 
		external 
		onlyOwners 
	{
		openCreateNodesWithTokens = _openCreateNodesWithTokens;
		openCreateNodesLevelUp = _openCreateNodesLevelUp;
		openCreateNodesWithPending = _openCreateNodesWithPending;
		openCreateNodesWithLuckyBoxes = _openCreateNodesWithLuckyBoxes;
		openCreateNodesMigration = _openCreateNodesMigration;
	}

	// external view
	function getTotalNodesNumberOf(address user) external view returns(uint) {
		return userOf[user].keys.length;
	}
	
	function getNodeFromTokenId(uint tokenId) external view returns(Node memory) {
		return userOf[tokenIdToOwner[tokenId]].values[tokenId];
	}
	
	function getNodesCountLevelUpOf(address user) external view returns(uint) {
		return userOf[user].countLevelUp;
	}
	
	function getNodesCountPendingOf(address user) external view returns(uint) {
		return userOf[user].countPending;
	}
	
	function getTokenIdsOfBetweenIndexes(
		address user, 
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(uint[] memory)
	{
		uint[] memory tokenIds = new uint[](iEnd - iStart);
		User storage u = userOf[user];
		for (uint256 i = iStart; i < iEnd; i++)
			tokenIds[i - iStart] = u.keys[i];
		return tokenIds;
	}

	function getNodesOfBetweenIndexes(
		address user, 
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(Node[] memory)
	{
		Node[] memory nodes = new Node[](iEnd - iStart);
		User storage u = userOf[user];
		for (uint256 i = iStart; i < iEnd; i++)
			nodes[i - iStart] = u.values[u.keys[i]];
		return nodes;
	}

	function getTimeRoiOfBetweenIndexes(
		address user, 
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(uint[] memory)
	{
		uint[] memory rois = new uint[](iEnd - iStart);
		User storage u = userOf[user];
		for (uint256 i = iStart; i < iEnd; i++)
			rois[i - iStart] = price * claimTime / rewardAmount + u.values[u.keys[i]].creationTime;
		return rois;
	}

	function getFeaturesSize() external view returns(uint) {
		return features.length;
	}
	
	function getFeaturesBetweenIndexes(
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(string[] memory)
	{
		string[] memory f = new string[](iEnd - iStart);
		for (uint256 i = iStart; i < iEnd; i++)
			f[i - iStart] = features[i];
		return f;
	}

	function getNodeOwnersSize() external view returns(uint) {
		return nodeOwners.length;
	}

	function getAttribute(uint tokenId) external view returns(string memory) {
		return userOf[tokenIdToOwner[tokenId]].values[tokenId].feature;
	}
	
	function getNodeOwnersBetweenIndexes(
		uint iStart, 
		uint iEnd
	) 
		external 
		view 
		returns(address[] memory)
	{
		address[] memory no = new address[](iEnd - iStart);
		for (uint256 i = iStart; i < iEnd; i++)
			no[i - iStart] = nodeOwners[i];
		return no;
	}
	
	function calculateUserRewardsBatch(
		address user,
		uint[] memory tokenIds
	) 
		external 
		view
		returns(uint[] memory, uint[] memory) 
	{
		uint[] memory rewardsTotal = new uint[](tokenIds.length);
		uint[] memory feesTotal = new uint[](tokenIds.length);
		User storage u = userOf[user];

		for (uint i = 0; i < tokenIds.length; i++) {
			require(u.inserted[tokenIds[i]], "NodeType: User doesnt own this node");
			Node memory userNode = u.values[tokenIds[i]];
			(uint rewards, uint fees) = _calculateNodeRewards(userNode);
			rewardsTotal[i] = rewards;
			feesTotal[i] = fees;
		}

		return (rewardsTotal, feesTotal);
	}

	// public
	function calculateUserRewards(address user) public view returns(uint, uint) {
		uint rewardsTotal;
		uint feesTotal;
		User storage u = userOf[user];

		for (uint i = 0; i < u.keys.length; i++) {
			(uint rewards, uint fees) = _calculateNodeRewards(u.values[u.keys[i]]);
			rewardsTotal += rewards;
			feesTotal += fees;
		}

		return (rewardsTotal, feesTotal);
	}

	// internal
	function _randomNftBoosted(
		address user,
		uint count,
		bool canBeBoostedNft
	)
		internal
		returns(bool[] memory)
	{
		bool[] memory areBoostedNft = new bool[](count);

		for(uint i = 0; i < count; i++) {
			if (canBeBoostedNft)
				areBoostedNft[i] = _generatePseudoRandom(user) < isBoostedNftProbability ? true : false;
			else
				areBoostedNft[i] = false;
		}

		return areBoostedNft;
	}

	function _generatePseudoRandom(address user) internal returns(uint) {
		uint r = uint(keccak256(abi.encodePacked(nonce, user, block.difficulty, block.timestamp)));
		unchecked { nonce++; }
		return r % 10000;
	}

	// private
	function _createNodes(
		address user, 
		uint[] memory tokenIds, 
		bool[] memory areBoostedNft,
		bool isBoostedToken,
		string memory feature,
		uint isBoostedAirDropRate
	) private {
		require(tokenIds.length > 0, "NodeType: Nothing to create");

		if (nodeOwnersInserted[user] == false) {
			nodeOwners.push(user);
			nodeOwnersInserted[user] = true;
		}

		for (uint i = 0; i < tokenIds.length; i++) {
			Node memory node = _newNode();

            node.owner = user;
            node.isBoostedAirDropRate = isBoostedAirDropRate;
            node.isBoostedNft = areBoostedNft[i];
            node.isBoostedToken = isBoostedToken;
            node.feature = feature;

			userSet(userOf[user], tokenIds[i], node);
			tokenIdToOwner[tokenIds[i]] = user;
		}

		featureCount[feature] += tokenIds.length;
		totalCreatedNodes += tokenIds.length;
	}

	function _calculateNodeRewards(Node memory node)
		private 
		view
		returns(uint, uint)
	{
		uint rewardsTotal;
		uint fees;

		rewardsTotal = _calculateBaseNodeRewards(node);

		uint multi = (block.timestamp - node.obtainingTime) / obtainingTimeReference;
		if (multi > 0) {
			multi = multi <= maxMultiObtaining ? multi : maxMultiObtaining;
			rewardsTotal = rewardsTotal * (10000 + obtainingTimeRate * multi) / 10000;
		}
		
		multi = (block.timestamp - node.lastClaimTime) / claimTimeReference;
		if (multi > 0) {
			multi = multi <= maxMultiClaim ? multi : maxMultiClaim;
			rewardsTotal = rewardsTotal * (10000 + claimTimeRate * multi) / 10000;
		}

		if (node.isBoostedAirDropRate > 0)
			rewardsTotal = rewardsTotal * (10000 + node.isBoostedAirDropRate) / 10000;
        
		if (node.isBoostedNft)
			rewardsTotal = rewardsTotal * (10000 + isBoostedNftRate) / 10000;

		if (node.isBoostedToken)
			rewardsTotal = rewardsTotal * (10000 + isBoostedTokenRate) / 10000;
		
		if (featureToBoostRate[node.feature] > 0)
			rewardsTotal = rewardsTotal * (10000 + featureToBoostRate[node.feature]) / 10000;

		if (block.timestamp - node.lastClaimTime > noClaimTimeReference)
			rewardsTotal += noClaimRewardAmount;

		if (rewardAmount * (block.timestamp - node.creationTime) / claimTime < price && 
				claimTaxRoi > 0)
			fees += rewardsTotal * claimTaxRoi / 10000;
		
		if (globalTax > 0)
			fees += rewardsTotal * globalTax / 10000;

		return (rewardsTotal - fees, fees);
	}

	function userSet(
        User storage user,
        uint key,
        Node memory value
    ) private {
        if (user.inserted[key]) {
            user.values[key] = value;
        } else {
            user.inserted[key] = true;
            user.values[key] = value;
            user.indexOf[key] = user.keys.length;
            user.keys.push(key);
        }
    }
	
    function userRemove(User storage user, uint key) private {
        if (!user.inserted[key]) {
            return;
        }

        delete user.inserted[key];
        delete user.values[key];

        uint256 index = user.indexOf[key];
        uint256 lastIndex = user.keys.length - 1;
        uint lastKey = user.keys[lastIndex];

        user.indexOf[lastKey] = index;
        delete user.indexOf[key];

		if (lastIndex != index)
			user.keys[index] = lastKey;
        user.keys.pop();
    }

    function _price() internal view override returns (uint256) {
        return price;
    }

    function _baseRewardsPerSecond() internal view override returns (uint256) {
        return rewardAmount / claimTime;
    }
}
