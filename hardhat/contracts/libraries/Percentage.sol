// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.8;

type UPercentage is uint256;

library Percentages {
	function from(uint32 val) internal pure returns (UPercentage) {
		require(val <= 10000, "Percentages: out of bounds");
		return UPercentage.wrap(val);
	}

	function from_unbounded(uint256 val) internal pure returns(UPercentage) {
		return UPercentage.wrap(val);
	}

	function times(UPercentage p, uint256 val) internal pure returns (uint256) {
		return val * UPercentage.unwrap(p) / 10000;
	}
}