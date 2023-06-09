// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.0;

interface ISpringNft {
	function tokenIdsToType(uint tokenId) external view returns(string memory);
	function getAttribute(uint tokenId) external view returns(string memory);
}
