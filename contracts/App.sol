pragma solidity 0.4.18;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract App is AragonApp {
	mapping(bytes32 => string) entries;

	bytes32 constant public ADD_ROLE = keccak256("ADD_ROLE");

	event NewEntry(bytes32 id);

	function initialize() onlyInit {
		initialized();
	}

	function add(string data) auth(ADD_ROLE) public returns (bytes32 id) {
		id = keccak256(data);
		// avoid duplicate entries
		require(keccak256(entries[id]) != id);

		entries[id] = data;

		NewEntry(id);
	}

	function getEntry(bytes32 _id) public view returns (string) {
		return entries[_id];
	}
}
