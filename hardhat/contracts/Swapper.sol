// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./PaymentSplitter.sol";
import "./IJoeRouter02.sol";
import "./Owners.sol";

import "hardhat/console.sol";


contract Swapper is PaymentSplitter, Owners {
	struct Path {
		address[] pathIn;
		address[] pathOut;
	}

	struct MapPath {
		address[] keys;
		mapping(address => Path) values;
		mapping(address => uint256) indexOf;
		mapping(address => bool) inserted;
	}

	struct Sponso {
		address to;
		uint rate;
		uint until;
		uint released;
		uint claimable;
		address[] path;
	}

	MapPath private mapPath;

	string[] public allInflus;
	mapping(string => bool) public influInserted;
	mapping(string => Sponso) public influData;
	
	address public spring;
	address public futur;
	address public distri;
	address public lpHandler;
	address public router;
	address public native;
	address public pair;

	uint public futurFee;
	uint public rewardsFee;
	uint public lpFee;

	bool private swapping = false;
	bool private swapLiquifyCreate = true;
	bool private swapLiquifyClaim = true;
	bool private swapFutur = true;
	bool private swapRewards = true;
	bool private swapLpPool = true;
	bool private swapPayee = true;

	uint public swapTokensAmountCreate;
	uint public swapTokensAmountClaim;

	address public handler;

	bool public openSwapCreateNodesWithTokens = false;
	bool public openSwapCreateNodesWithPending = false;
	bool public openSwapCreateLuckyBoxesWithTokens = false;
	bool public openSwapClaimRewardsAll = false;
	bool public openSwapClaimRewardsBatch = false;
	bool public openSwapClaimRewardsNodeType = false;
	bool public openSwapApplyWaterpack = false;
    bool public openSwapApplyFertilizer = false;
	bool public openSwapNewPlot = false;

	constructor(
		address[] memory payees,
		uint256[] memory shares,
		address[] memory addresses,
		uint256[] memory fees,
		uint256[] memory _swAmounts,
		address _handler
	) PaymentSplitter(payees, shares) {
		spring = addresses[0];
		futur = addresses[1];
		distri = addresses[2];
		lpHandler = addresses[3];
		router = addresses[4];
		native = addresses[5];
		pair = addresses[6];

		futurFee = fees[0];
		rewardsFee = fees[1];
		lpFee = fees[2];

		swapTokensAmountCreate = _swAmounts[0];
		swapTokensAmountClaim = _swAmounts[1];

		handler = _handler;
	}
	
	modifier onlyHandler() {
		require(msg.sender == handler, "Swapper: Only Handler");
		_;
	}

	function addMapPath(
		address token, 
		address[] memory pathIn,
		address[] memory pathOut
	)
		external
		onlyOwners
	{
		require(!mapPath.inserted[token], "Swapper: Token already exists");
		mapPathSet(token, Path({
			pathIn: pathIn,
			pathOut: pathOut
		}));
	}

	function updateMapPath(
		address token, 
		address[] memory pathIn,
		address[] memory pathOut
	)
		external
		onlyOwners
	{
		require(mapPath.inserted[token], "Swapper: Token doesnt exist");
		mapPathSet(token, Path({
			pathIn: pathIn,
			pathOut: pathOut
		}));
	}
	
	function removeMapPath(
		address token
	)
		external
		onlyOwners
	{
		require(mapPath.inserted[token], "Swapper: Token doesnt exist");
		mapPathRemove(token);
	}

	function addInflu(
		string memory name,
		address to,
		uint until,
		uint rate,
		address[] memory path
	) 
		external
		onlyOwners
	{
		require(!influInserted[name], "Swapper: Influ already exists");

		allInflus.push(name);
		influInserted[name] = true;

		influData[name] = Sponso({
			to: to,
			rate: rate,
			until: until,
			released: 0,
			claimable: 0,
			path: path
		});
	}

	function updateInflu(
		string memory name,
		uint until,
		uint rate,
		address[] memory path
	)
		external
		onlyOwners
	{
		require(influInserted[name], "Swapper: Influ doesnt exist exists");

		Sponso memory cur = influData[name];

		influData[name] = Sponso({
			to: cur.to,
			rate: rate,
			until: until,
			released: cur.released,
			claimable: cur.claimable,
			path: path
		});
	}

	function releaseInflu(
		string memory name
	) external
	{
		require(influInserted[name], "Swapper: Influ doesnt exist exists");
		
		Sponso storage cur = influData[name];
		
		require(cur.claimable > 0, "Swapper: Nothing to claim");

		uint amount;
		if (cur.path[cur.path.length - 1] != spring)
			amount =  IJoeRouter02(router).getAmountsOut(
				cur.claimable,
				cur.path
			)[cur.path.length - 1];
		else
			amount = cur.claimable;

		cur.released += cur.claimable;
		cur.claimable = 0;

		IERC20(cur.path[cur.path.length - 1])
			.transferFrom(distri, cur.to, amount);
	}

	function swapCreateNodesWithTokens(
		address tokenIn, 
		address user, 
		uint price,
		string memory sponso
	) 
		external
		onlyHandler
	{
		require(openSwapCreateNodesWithTokens, "Swapper: Not open");
		_swapCreation(tokenIn, user, price, sponso);
	}

	function swapCreateNodesWithPending(
		address tokenOut, 
		address user, 
		uint rewardsTotal,
		uint feesTotal
	) 
		external
		onlyHandler
	{
		require(openSwapCreateNodesWithPending, "Swapper: Not open");
		_swapClaim(tokenOut, user, rewardsTotal, feesTotal);
	}
	
	function swapCreateLuckyBoxesWithTokens(
		address tokenIn, 
		address user, 
		uint price,
		string memory sponso
	) 
		external
		onlyHandler
	{
		require(openSwapCreateLuckyBoxesWithTokens, "Swapper: Not open");
		_swapCreation(tokenIn, user, price, sponso);
	}
	
	function swapClaimRewardsAll(
		address tokenOut, 
		address user, 
		uint rewardsTotal,
		uint feesTotal
	) 
		external
		onlyHandler
	{
		require(openSwapClaimRewardsAll, "Swapper: Not open");
		_swapClaim(tokenOut, user, rewardsTotal, feesTotal);
	}
	
	function swapClaimRewardsBatch(
		address tokenOut, 
		address user, 
		uint rewardsTotal,
		uint feesTotal
	) 
		external
		onlyHandler
	{
		require(openSwapClaimRewardsBatch, "Swapper: Not open");
		_swapClaim(tokenOut, user, rewardsTotal, feesTotal);
	}
	
	function swapClaimRewardsNodeType(
		address tokenOut, 
		address user, 
		uint rewardsTotal,
		uint feesTotal
	) 
		external
		onlyHandler
	{
		require(openSwapClaimRewardsNodeType, "Swapper: Not open");
		_swapClaim(tokenOut, user, rewardsTotal, feesTotal);
	}

	function swapApplyWaterpack(
		address tokenIn,
		address user,
		uint amount
	)
		external
		onlyHandler
	{
		require(openSwapApplyWaterpack, "Swapper: Not open");
		_swapCreation(tokenIn, user, amount, "");
	}

	function swapApplyFertilizer(
		address tokenIn,
		address user,
		uint amount
	)
		external
		onlyHandler
	{
		require(openSwapApplyFertilizer, "Swapper: Not open");
		_swapCreation(tokenIn, user, amount, "");
	}

	function swapNewPlot(
		address tokenIn,
		address user,
		uint amount
	)
		external
		onlyHandler
	{
		require(openSwapNewPlot, "Swapper: Not open");
		_swapCreation(tokenIn, user, amount, "");
	}

	// external setters
	function setSpring(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Spring cannot be address zero");
		spring = _new;
	}

	function setFutur(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Futur cannot be address zero");
		futur = _new;
	}

	function setDistri(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Distri cannot be address zero");
		distri = _new;
	}

	function setLpHandler(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: LpHandler cannot be address zero");
		lpHandler = _new;
	}

	function setRouter(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Router cannot be address zero");
		router = _new;
	}

	function setNative(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Native cannot be address zero");
		native = _new;
	}

	function setPair(address _new) external onlyOwners {
		require(_new != address(0), "Swapper: Pair cannot be address zero");
		pair = _new;
	}

	function setFuturFee(uint _new) external onlyOwners {
		futurFee = _new;
	}

	function setRewardsFee(uint _new) external onlyOwners {
		rewardsFee = _new;
	}

	function setLpFee(uint _new) external onlyOwners {
		lpFee = _new;
	}

	function setSwapLiquifyCreate(bool _new) external onlyOwners {
		swapLiquifyCreate = _new;
	}
	
	function setSwapLiquifyClaim(bool _new) external onlyOwners {
		swapLiquifyClaim = _new;
	}
	
	function setSwapFutur(bool _new) external onlyOwners {
		swapFutur = _new;
	}
	
	function setSwapRewards(bool _new) external onlyOwners {
		swapRewards = _new;
	}
	
	function setSwapLpPool(bool _new) external onlyOwners {
		swapRewards = _new;
	}
	
	function setSwapPayee(bool _new) external onlyOwners {
		swapPayee = _new;
	}

	function setSwapTokensAmountCreate(uint _new) external onlyOwners {
		swapTokensAmountCreate = _new;
	}

	function setSwapTokensAmountClaim(uint _new) external onlyOwners {
		swapTokensAmountClaim = _new;
	}
	
	function setOpenSwapCreateNodesWithTokens(bool _new) external onlyOwners {
		openSwapCreateNodesWithTokens = _new;
	}
	
	function setOpenSwapCreateNodesWithPending(bool _new) external onlyOwners {
		openSwapCreateNodesWithPending = _new;
	}
	
	function setOpenSwapCreateLuckyBoxesWithTokens(bool _new) external onlyOwners {
		openSwapCreateLuckyBoxesWithTokens = _new;
	}
	
	function setOpenSwapClaimRewardsAll(bool _new) external onlyOwners {
		openSwapClaimRewardsAll = _new;
	}
	
	function setOpenSwapClaimRewardsBatch(bool _new) external onlyOwners {
		openSwapClaimRewardsBatch = _new;
	}
	
	function setOpenSwapClaimRewardsNodeType(bool _new) external onlyOwners {
		openSwapClaimRewardsNodeType = _new;
	}
	
	function setOpenSwapApplyWaterpack(bool _new) external onlyOwners {
		openSwapApplyWaterpack = _new;
	}

    function setOpenSwapApplyFertilizer(bool _new) external onlyOwners {
        openSwapApplyFertilizer = _new;
    }

	function setOpenSwapNewPlot(bool _new) external onlyOwners {
		openSwapNewPlot = _new;
	}
	
	// external view
	function getMapPathSize() external view returns(uint) {
		return mapPath.keys.length;
	}
	
	function getMapPathKeysBetweenIndexes(
		uint iStart,
		uint iEnd
	) 
		external 
		view 
		returns(address[] memory)
	{
		address[] memory keys = new address[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			keys[i - iStart] = mapPath.keys[i];
		return keys;
	}
	
	function getMapPathBetweenIndexes(
		uint iStart,
		uint iEnd
	)
		external
		view
		returns (Path[] memory)
	{
		Path[] memory path = new Path[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			path[i - iStart] = mapPath.values[mapPath.keys[i]];
		return path;
	}

	function getMapPathForKey(address key) external view returns(Path memory) {
		require(mapPath.inserted[key], "Swapper: Key doesnt exist");
		return mapPath.values[key];
	}

	function getAllInfluSize() external view returns(uint) {
		return allInflus.length;
	}
	
	function getInfluDataPath(string memory name) external view returns(address[] memory) {
		return influData[name].path;
	}
	
	function getAllInflusBetweenIndexes(
		uint iStart,
		uint iEnd
	)
		external
		view
		returns (string[] memory)
	{
		string[] memory influ = new string[](iEnd - iStart);
		for (uint i = iStart; i < iEnd; i++)
			influ[i - iStart] = allInflus[i];
		return influ;
	}

	// internal
	function _swapCreation(
		address tokenIn, 
		address user, 
		uint price,
		string memory sponso
	) 
		internal
	{
		require(price > 0, "Swapper: Nothing to swap");
		
		if (influInserted[sponso]) {
			if (block.timestamp <= influData[sponso].until)
				influData[sponso].claimable += price * influData[sponso].rate / 10000;
		}

		if (tokenIn == spring) {
			IERC20(spring).transferFrom(user, address(this), price);
			_swapCreationSpring();
		} else {
			_swapCreationToken(tokenIn, user, price);
			_swapCreationSpring();
		}
	}

	function _swapCreationSpring() internal {
		uint256 contractTokenBalance = IERC20(spring).balanceOf(address(this));

		if (contractTokenBalance >= swapTokensAmountCreate && swapLiquifyCreate && !swapping) {
			swapping = true;
        
			if (swapFutur) {
				uint256 futurTokens = contractTokenBalance * futurFee / 10000;
				swapAndSendToFee(futur, futurTokens);
			}

			if (swapRewards) {
				uint256 rewardsPoolTokens = contractTokenBalance * rewardsFee / 10000;
				IERC20(spring).transfer(distri, rewardsPoolTokens);
			}

			if (swapLpPool) {
				uint256 swapTokens = contractTokenBalance * lpFee / 10000;
				swapAndLiquify(swapTokens);
			}

			if (swapPayee)
				swapTokensForEth(IERC20(spring).balanceOf(address(this)));

			swapping = false;
		}
	}

	function _swapCreationToken(address tokenIn, address user, uint price) internal {
		require(mapPath.inserted[tokenIn], "Swapper: Unknown token");

		uint toTransfer = IJoeRouter02(router).getAmountsIn(
			price,
			mapPath.values[tokenIn].pathIn
		)[0];

		IERC20(tokenIn).transferFrom(user, address(this), toTransfer);

        IERC20(tokenIn).approve(router, toTransfer);

        IJoeRouter02(router).swapExactTokensForTokensSupportingFeeOnTransferTokens(
            toTransfer,
            price,
            mapPath.values[tokenIn].pathIn,
            address(this),
            block.timestamp
        );
	}

	function _swapClaim(
		address tokenOut, 
		address user, 
		uint rewardsTotal, 
		uint feesTotal
	) 
		internal 
	{
		if (rewardsTotal + feesTotal > 0) {
			if (swapLiquifyClaim)
				IERC20(spring).transferFrom(distri, address(this), rewardsTotal + feesTotal);
			else if (rewardsTotal > 0)
				IERC20(spring).transferFrom(distri, address(this), rewardsTotal);

			if (swapLiquifyClaim && feesTotal > swapTokensAmountClaim)
				swapTokensForEth(feesTotal);

			if (tokenOut == spring) {
				if (rewardsTotal > 0)
					IERC20(spring).transfer(user, rewardsTotal);
			} else {
				require(mapPath.inserted[tokenOut], "Swapper: Unknown token");

				IERC20(spring).approve(router, rewardsTotal);

				IJoeRouter02(router)
					.swapExactTokensForTokensSupportingFeeOnTransferTokens(
						rewardsTotal,
						0,
						mapPath.values[tokenOut].pathOut,
						user,
						block.timestamp
					);
			}
		}
	}
		
	function swapAndSendToFee(address destination, uint256 tokens) private {
        uint256 initialETHBalance = address(this).balance;

		swapTokensForEth(tokens);

		uint256 newBalance = (address(this).balance) - initialETHBalance;

		payable(destination).transfer(newBalance);
    }

    function swapAndLiquify(uint256 tokens) private {
        uint256 half = tokens / 2;
        uint256 otherHalf = tokens - half;

        uint256 initialBalance = address(this).balance;

        swapTokensForEth(half);

        uint256 newBalance = address(this).balance - initialBalance;

        addLiquidity(otherHalf, newBalance);
    }

    function swapTokensForEth(uint256 tokenAmount) private {
		address[] memory path = new address[](2);
		path[0] = spring;
		path[1] = native;

        IERC20(spring).approve(router, tokenAmount);

        IJoeRouter02(router).swapExactTokensForAVAXSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        IERC20(spring).approve(router, tokenAmount);

        IJoeRouter02(router).addLiquidityAVAX{value: ethAmount}(
            spring,
            tokenAmount,
            0,
            0,
            lpHandler,
            block.timestamp
        );
    }

	function mapPathSet(
        address key,
        Path memory value
    ) private {
        if (mapPath.inserted[key]) {
            mapPath.values[key] = value;
        } else {
            mapPath.inserted[key] = true;
            mapPath.values[key] = value;
            mapPath.indexOf[key] = mapPath.keys.length;
            mapPath.keys.push(key);
        }
    }

	function mapPathRemove(address key) private {
        if (!mapPath.inserted[key]) {
            return;
        }

        delete mapPath.inserted[key];
        delete mapPath.values[key];

        uint256 index = mapPath.indexOf[key];
        uint256 lastIndex = mapPath.keys.length - 1;
        address lastKey = mapPath.keys[lastIndex];

        mapPath.indexOf[lastKey] = index;
        delete mapPath.indexOf[key];

		if (lastIndex != index)
			mapPath.keys[index] = lastKey;
        mapPath.keys.pop();
    }
}
