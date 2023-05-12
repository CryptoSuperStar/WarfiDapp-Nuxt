// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

import "./Owners.sol";
import "./libraries/Percentage.sol";

import "hardhat/console.sol";

struct Waterpack {
	/// @dev How much lifetime is added to the node, expressed relative to the
	/// node's ROI time.
	UPercentage ratioOfROI;

	/// @dev Price of the waterpack, expressed in the protocol's native token
	/// amount.
	uint256 price;
}

abstract contract Waterpacks is Owners {
	using Percentages for UPercentage;

	struct WaterpackTypes {
		Waterpack[] items;
		string[] names;
		/// @dev Name to index + 1, 0 means the waterpack doesn't exists.
		mapping(string => uint256) indexOfPlusOne;
	}

	WaterpackTypes internal waterpackTypes;

	//====== Getters =========================================================//

	struct WaterpackView {
		string name;
		UPercentage ratioOfROI;
		uint256 price;
	}

	function getWaterpackTypes() public view returns (WaterpackView[] memory) {
		WaterpackView[] memory output = new WaterpackView[](waterpackTypes.items.length);

		for(uint i = 0; i < waterpackTypes.items.length; i++) {
			output[i] = WaterpackView({
				name: waterpackTypes.names[i],
				ratioOfROI: waterpackTypes.items[i].ratioOfROI,
				price: waterpackTypes.items[i].price
			});
		}

		return output;
	}

	//====== Owners-only interface ===========================================//

	function setWaterpackType(
		string calldata name,
		uint256 ratioOfROI,
		uint256 price
	)
		external
		onlyOwners
	{
		_setWaterpackType(name, UPercentage.wrap(ratioOfROI), price);
	}

	function removeWaterpackType(
		string calldata name
	)
		external
		onlyOwners
		returns (bool)
	{
		return _removeWaterpackType(name);
	}

	//====== Internal API ====================================================//

	function _setWaterpackType(string calldata name, UPercentage ratioOfROI, uint256 price) internal {
		uint indexPlusOne = waterpackTypes.indexOfPlusOne[name];
		if (indexPlusOne == 0) {
			waterpackTypes.names.push(name);
			waterpackTypes.items.push(
				Waterpack({
					ratioOfROI: ratioOfROI,
					price: price
				})
			);
			waterpackTypes.indexOfPlusOne[name] = waterpackTypes.names.length;
		} else {
			Waterpack storage waterpack = waterpackTypes.items[indexPlusOne - 1];
			waterpack.ratioOfROI = ratioOfROI;
			waterpack.price = price;
		}
	}

	function _hasWaterpackType(string calldata name) internal view returns (bool ret) {
		ret = waterpackTypes.indexOfPlusOne[name] != 0;
	}

	function _getWaterpackType(string calldata name) internal view returns (Waterpack memory) {
		uint256 idx = waterpackTypes.indexOfPlusOne[name];
		require(idx != 0, "Waterpacks: nonexistant key");
		return waterpackTypes.items[idx - 1];
	}

	function _removeWaterpackType(string calldata name) internal returns (bool) {
		uint256 indexPlusOne = waterpackTypes.indexOfPlusOne[name];
		if (indexPlusOne == 0) {
			return false;
		}
		
		uint256 toDeleteIndex = indexPlusOne - 1;
		uint256 lastIndex = waterpackTypes.items.length - 1;

		if (lastIndex != toDeleteIndex) {
			Waterpack storage lastValue = waterpackTypes.items[lastIndex];
			string storage lastName = waterpackTypes.names[lastIndex];

			waterpackTypes.items[toDeleteIndex] = lastValue;
			waterpackTypes.names[toDeleteIndex] = lastName;
			waterpackTypes.indexOfPlusOne[lastName] = indexPlusOne;
		}

		waterpackTypes.items.pop();
		waterpackTypes.names.pop();
		waterpackTypes.indexOfPlusOne[name] = 0;

		return true;
	}
}