// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OpenWorldNFT
 * @dev Genesis and Creator collection NFT standard on Botchain with EIP-2981 Royalties.
 */
contract OpenWorldNFT is ERC721, ERC2981, Ownable {
    uint256 private _nextTokenId;
    string public collectionDescription;
    uint256 public maxSupply;
    uint256 public mintPrice; // in native BOT

    mapping(uint256 => string) private _tokenURIs;

    event NFTMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI, uint96 royaltyBps);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory description_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address defaultRoyaltyReceiver,
        uint96 defaultRoyaltyFeeNumerator
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        collectionDescription = description_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        _nextTokenId = 1;

        if (defaultRoyaltyReceiver != address(0)) {
            _setDefaultRoyalty(defaultRoyaltyReceiver, defaultRoyaltyFeeNumerator);
        }
    }

    /**
     * @notice Mint a new NFT with custom metadata and per-token royalty.
     */
    function mint(string memory uri, uint96 royaltyFeeBps) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient BOT for minting");
        if (maxSupply > 0) {
            require(_nextTokenId <= maxSupply, "Max supply reached");
        }
        require(royaltyFeeBps <= 1000, "Royalty cannot exceed 10%");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = uri;

        if (royaltyFeeBps > 0) {
            _setTokenRoyalty(tokenId, msg.sender, royaltyFeeBps);
        }

        emit NFTMinted(msg.sender, tokenId, uri, royaltyFeeBps);

        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }

        return tokenId;
    }

    /**
     * @notice Batch mint multiple NFTs
     */
    function batchMint(string[] memory uris, uint96 royaltyFeeBps) external payable returns (uint256[] memory) {
        uint256 count = uris.length;
        require(count > 0, "Must mint at least 1 token");
        require(msg.value >= mintPrice * count, "Insufficient BOT for batch mint");
        if (maxSupply > 0) {
            require(_nextTokenId + count - 1 <= maxSupply, "Exceeds max supply");
        }
        require(royaltyFeeBps <= 1000, "Royalty cannot exceed 10%");

        uint256[] memory tokenIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;

            _safeMint(msg.sender, tokenId);
            _tokenURIs[tokenId] = uris[i];

            if (royaltyFeeBps > 0) {
                _setTokenRoyalty(tokenId, msg.sender, royaltyFeeBps);
            }

            tokenIds[i] = tokenId;
            emit NFTMinted(msg.sender, tokenId, uris[i], royaltyFeeBps);
        }

        uint256 totalCost = mintPrice * count;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
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
