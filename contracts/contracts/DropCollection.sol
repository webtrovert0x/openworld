// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DropCollection is ERC721, ERC2981, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId = 1;
    string public dropURI;
    
    uint256 public mintPrice;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public maxSupply;

    // The platform fee wallet, if any
    address public platformFeeRecipient;
    uint256 public platformFeeBps = 0; // e.g. 250 for 2.5%

    event TokensMinted(address indexed minter, uint256 startTokenId, uint256 amount, uint256 totalPrice);

    constructor(
        address _creator,
        string memory _name,
        string memory _symbol,
        string memory _dropURI,
        uint256 _mintPrice,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxSupply,
        uint96 _royaltyFeeBps
    ) ERC721(_name, _symbol) Ownable(_creator) {
        dropURI = _dropURI;
        mintPrice = _mintPrice;
        startTime = _startTime;
        endTime = _endTime;
        maxSupply = _maxSupply;

        // Set default royalty to the creator
        if (_royaltyFeeBps > 0) {
            _setDefaultRoyalty(_creator, _royaltyFeeBps);
        }
    }

    /**
     * @notice Mint tokens from this Drop
     */
    function mint(uint256 amount) external payable {
        require(block.timestamp >= startTime, "Minting has not started");
        require(endTime == 0 || block.timestamp <= endTime, "Minting has ended");
        require(amount > 0, "Must mint at least 1");
        require(nextTokenId + amount - 1 <= maxSupply, "Exceeds max supply");
        require(msg.value == mintPrice * amount, "Incorrect BOT value sent");

        uint256 startTokenId = nextTokenId;
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(msg.sender, nextTokenId);
            nextTokenId++;
        }

        // Immediately route the funds
        if (msg.value > 0) {
            uint256 platformFee = (msg.value * platformFeeBps) / 10000;
            uint256 creatorAmount = msg.value - platformFee;

            if (platformFee > 0 && platformFeeRecipient != address(0)) {
                payable(platformFeeRecipient).transfer(platformFee);
            }
            payable(owner()).transfer(creatorAmount);
        }

        emit TokensMinted(msg.sender, startTokenId, amount, msg.value);
    }

    /**
     * @notice Returns the URI for a given token. 
     * Since this is an edition (all copies same artwork), they share the same URI.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return dropURI;
    }

    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
    }

    function setTimes(uint256 _startTime, uint256 _endTime) external onlyOwner {
        startTime = _startTime;
        endTime = _endTime;
    }

    function setDropURI(string memory _newURI) external onlyOwner {
        dropURI = _newURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
