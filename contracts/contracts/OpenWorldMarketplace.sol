// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title OpenWorldMarketplace
 * @dev Decentralized NFT Marketplace engine for Botchain with native BOT settlements,
 *      escrowless direct listings, offers, and automated EIP-2981 royalties.
 */
contract OpenWorldMarketplace {

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price; // in wei of native BOT
        bool isActive;
        uint256 listedAt;
    }

    struct Offer {
        address bidder;
        uint256 amount; // in wei of native BOT held in escrow
        uint256 expiresAt;
        bool isActive;
    }

    address public owner;
    bool public paused;
    uint256 private _status = 1;

    // Platform fee in basis points (100 = 1%)
    uint256 public platformFeeBps = 150; // 1.5%
    address public feeRecipient;

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // nftContract => tokenId => bidder => Offer
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;

    // Events
    event ItemListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        uint256 listedAt
    );

    event ItemBought(
        address indexed buyer,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee,
        address royaltyReceiver
    );

    event ListingCanceled(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event ListingPriceUpdated(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 newPrice
    );

    event OfferCreated(
        address indexed bidder,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 expiresAt
    );

    event OfferCanceled(
        address indexed bidder,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event OfferAccepted(
        address indexed seller,
        address indexed bidder,
        address indexed nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 platformFee,
        uint256 royaltyFee,
        address royaltyReceiver
    );

    event PlatformFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier nonReentrant() {
        require(_status == 1, "ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /* ========================================================================= */
    /*                              LISTING LOGIC                                */
    /* ========================================================================= */

    /**
     * @notice List an NFT for direct sale at a fixed BOT price
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than 0");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Caller is not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved to transfer NFT"
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });

        emit ItemListed(msg.sender, nftContract, tokenId, price, block.timestamp);
    }

    /**
     * @notice Update price of an active listing
     */
    function updateListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Listing is not active");
        require(listing.seller == msg.sender, "Caller is not seller");
        require(newPrice > 0, "Price must be greater than 0");

        listing.price = newPrice;

        emit ListingPriceUpdated(msg.sender, nftContract, tokenId, newPrice);
    }

    /**
     * @notice Cancel an active listing
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Listing is not active");
        require(listing.seller == msg.sender || msg.sender == owner, "Unauthorized");

        listing.isActive = false;

        emit ListingCanceled(listing.seller, nftContract, tokenId);
    }

    /**
     * @notice Buy a listed NFT with native BOT
     */
    function buyItem(
        address nftContract,
        uint256 tokenId
    ) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Item is not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment in BOT");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == listing.seller, "Seller no longer owns NFT");

        address seller = listing.seller;
        uint256 price = listing.price;
        listing.isActive = false;

        // Process Royalties and Platform Fee
        (uint256 sellerProceeds, uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) = 
            _calculatePayouts(nftContract, tokenId, price);

        // Transfer NFT to buyer
        nft.safeTransferFrom(seller, msg.sender, tokenId);

        // Distribute funds
        if (platformFee > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(platformFee);
        }
        if (royaltyFee > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyFee);
        }
        payable(seller).transfer(sellerProceeds);

        // Refund any excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit ItemBought(
            msg.sender,
            seller,
            nftContract,
            tokenId,
            price,
            platformFee,
            royaltyFee,
            royaltyReceiver
        );
    }

    /* ========================================================================= */
    /*                               OFFER LOGIC                                 */
    /* ========================================================================= */

    /**
     * @notice Place an offer/bid on any NFT using escrowed native BOT
     */
    function createOffer(
        address nftContract,
        uint256 tokenId,
        uint256 durationInSeconds
    ) external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "Offer amount must be > 0");
        require(durationInSeconds >= 300, "Duration must be at least 5 minutes");
        require(durationInSeconds <= 30 days, "Duration cannot exceed 30 days");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) != address(0), "Token does not exist");
        require(nft.ownerOf(tokenId) != msg.sender, "Cannot make offer on own item");

        // If existing offer exists from this bidder, refund old one
        Offer storage currentOffer = offers[nftContract][tokenId][msg.sender];
        if (currentOffer.isActive) {
            uint256 refundAmount = currentOffer.amount;
            currentOffer.amount = 0;
            currentOffer.isActive = false;
            payable(msg.sender).transfer(refundAmount);
        }

        uint256 expiresAt = block.timestamp + durationInSeconds;
        offers[nftContract][tokenId][msg.sender] = Offer({
            bidder: msg.sender,
            amount: msg.value,
            expiresAt: expiresAt,
            isActive: true
        });

        emit OfferCreated(msg.sender, nftContract, tokenId, msg.value, expiresAt);
    }

    /**
     * @notice Cancel an active offer and withdraw escrowed BOT
     */
    function cancelOffer(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Offer storage offer = offers[nftContract][tokenId][msg.sender];
        require(offer.isActive, "No active offer to cancel");

        uint256 refundAmount = offer.amount;
        offer.isActive = false;
        offer.amount = 0;

        payable(msg.sender).transfer(refundAmount);

        emit OfferCanceled(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice NFT Owner accepts an active offer
     */
    function acceptOffer(
        address nftContract,
        uint256 tokenId,
        address bidder
    ) external whenNotPaused nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Caller is not token owner");

        Offer storage offer = offers[nftContract][tokenId][bidder];
        require(offer.isActive, "Offer is not active");
        require(block.timestamp <= offer.expiresAt, "Offer has expired");

        uint256 offerAmount = offer.amount;
        offer.isActive = false;
        offer.amount = 0;

        // If item was listed, mark listing inactive
        if (listings[nftContract][tokenId].isActive) {
            listings[nftContract][tokenId].isActive = false;
        }

        (uint256 sellerProceeds, uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) = 
            _calculatePayouts(nftContract, tokenId, offerAmount);

        // Transfer NFT to bidder
        nft.safeTransferFrom(msg.sender, bidder, tokenId);

        // Distribute funds
        if (platformFee > 0 && feeRecipient != address(0)) {
            payable(feeRecipient).transfer(platformFee);
        }
        if (royaltyFee > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyFee);
        }
        payable(msg.sender).transfer(sellerProceeds);

        emit OfferAccepted(
            msg.sender,
            bidder,
            nftContract,
            tokenId,
            offerAmount,
            platformFee,
            royaltyFee,
            royaltyReceiver
        );
    }

    /* ========================================================================= */
    /*                              HELPER METHODS                               */
    /* ========================================================================= */

    function _calculatePayouts(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) internal view returns (uint256 sellerProceeds, uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) {
        platformFee = (price * platformFeeBps) / 10000;
        royaltyFee = 0;
        royaltyReceiver = address(0);

        try IERC2981(nftContract).royaltyInfo(tokenId, price) returns (address receiver, uint256 rFee) {
            if (receiver != address(0) && rFee < price) {
                royaltyFee = rFee;
                royaltyReceiver = receiver;
            }
        } catch {
            royaltyFee = 0;
        }

        sellerProceeds = price - platformFee - royaltyFee;
    }

    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    function getOffer(address nftContract, uint256 tokenId, address bidder) external view returns (Offer memory) {
        return offers[nftContract][tokenId][bidder];
    }

    /* ========================================================================= */
    /*                             ADMIN CONFIG                                  */
    /* ========================================================================= */

    function setPlatformFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Platform fee cannot exceed 10%");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
}
