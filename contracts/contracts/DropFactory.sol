// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DropCollection.sol";

contract DropFactory {
    event DropCreated(
        address indexed dropAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 mintPrice,
        uint256 startTime,
        uint256 endTime,
        uint256 maxSupply
    );

    address[] public allDrops;
    mapping(address => address[]) public dropsByCreator;

    /**
     * @notice Deploys a new DropCollection contract
     */
    function createDrop(
        string memory _name,
        string memory _symbol,
        string memory _dropURI,
        uint256 _mintPrice,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxSupply,
        uint96 _royaltyFeeBps
    ) external returns (address) {
        DropCollection newDrop = new DropCollection(
            msg.sender,
            _name,
            _symbol,
            _dropURI,
            _mintPrice,
            _startTime,
            _endTime,
            _maxSupply,
            _royaltyFeeBps
        );

        address dropAddress = address(newDrop);
        allDrops.push(dropAddress);
        dropsByCreator[msg.sender].push(dropAddress);

        emit DropCreated(
            dropAddress,
            msg.sender,
            _name,
            _symbol,
            _mintPrice,
            _startTime,
            _endTime,
            _maxSupply
        );

        return dropAddress;
    }

    function getAllDrops() external view returns (address[] memory) {
        return allDrops;
    }

    function getDropsByCreator(address _creator) external view returns (address[] memory) {
        return dropsByCreator[_creator];
    }
}
