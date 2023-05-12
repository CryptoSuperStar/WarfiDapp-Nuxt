
// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./Owners.sol";
import "./libraries/Percentage.sol";

struct Fertilizer {
	/// @dev Duration of the effect of the fertilizer, expressed in seconds.
	uint256 durationEffect;

    /// @dev Percentage of additional boost provided during the effect of the
    /// fertilizer.
    UPercentage rewardBoost;

	/// @dev Price of the fertilizer, expressed in the protocol's native token
	/// amount.
	uint256 price;
}

abstract contract Fertilizers is Owners {
	using Percentages for UPercentage;

	struct FertilizerTypes {
		Fertilizer[] items;
		string[] names;
		/// @dev Name to index + 1, 0 means the fertilizer doesn't exists.
		mapping(string => uint256) indexOfPlusOne;
	}

	FertilizerTypes internal fertilizerTypes;

	//====== Getters =========================================================//

	struct FertilizerView {
		string name;
        uint256 durationEffect;
		UPercentage rewardBoost;
		uint256 price;
	}

	function getFertilizerTypes() public view returns (FertilizerView[] memory) {
		FertilizerView[] memory output = new FertilizerView[](fertilizerTypes.items.length);

		for(uint i = 0; i < fertilizerTypes.items.length; i++) {
			output[i] = FertilizerView({
				name: fertilizerTypes.names[i],
                durationEffect: fertilizerTypes.items[i].durationEffect,
                rewardBoost: fertilizerTypes.items[i].rewardBoost,
				price: fertilizerTypes.items[i].price
			});
		}

		return output;
	}

	//====== Owners-only interface ===========================================//

	function setFertilizerType(
		string calldata name,
		uint256 durationEffect,
        uint256 rewardBoost,
		uint256 price
	)
		external
		onlyOwners
	{
		_setFertilizerType(name, durationEffect, UPercentage.wrap(rewardBoost), price);
	}

	function removeFertilizerType(
		string calldata name
	)
		external
		onlyOwners
		returns (bool)
	{
		return _removeFertilizerType(name);
	}

	//====== Internal API ====================================================//

	function _setFertilizerType(
        string calldata name,
        uint256 durationEffect,
        UPercentage rewardBoost,
        uint256 price
    ) internal {
		uint indexPlusOne = fertilizerTypes.indexOfPlusOne[name];
		if (indexPlusOne == 0) {
			fertilizerTypes.names.push(name);
			fertilizerTypes.items.push(
				Fertilizer({
                    durationEffect: durationEffect,
                    rewardBoost: rewardBoost,
					price: price
				})
			);
			fertilizerTypes.indexOfPlusOne[name] = fertilizerTypes.names.length;
		} else {
			Fertilizer storage fertilizer = fertilizerTypes.items[indexPlusOne - 1];
			fertilizer.durationEffect = durationEffect;
            fertilizer.rewardBoost = rewardBoost;
			fertilizer.price = price;
		}
	}

	function _hasFertilizerType(string calldata name) internal view returns (bool ret) {
		ret = fertilizerTypes.indexOfPlusOne[name] != 0;
	}

	function _getFertilizerType(string calldata name) internal view returns (Fertilizer memory) {
		uint256 idx = fertilizerTypes.indexOfPlusOne[name];
		require(idx != 0, "Fertilizers: nonexistant key");
		return fertilizerTypes.items[idx - 1];
	}

	function _removeFertilizerType(string calldata name) internal returns (bool) {
		uint256 indexPlusOne = fertilizerTypes.indexOfPlusOne[name];
		if (indexPlusOne == 0) {
			return false;
		}
		
		uint256 toDeleteIndex = indexPlusOne - 1;
		uint256 lastIndex = fertilizerTypes.items.length - 1;

		if (lastIndex != toDeleteIndex) {
			Fertilizer storage lastValue = fertilizerTypes.items[lastIndex];
			string storage lastName = fertilizerTypes.names[lastIndex];

			fertilizerTypes.items[toDeleteIndex] = lastValue;
			fertilizerTypes.names[toDeleteIndex] = lastName;
			fertilizerTypes.indexOfPlusOne[lastName] = indexPlusOne;
		}

		fertilizerTypes.items.pop();
		fertilizerTypes.names.pop();
		fertilizerTypes.indexOfPlusOne[name] = 0;

		return true;
	}
}