◇ injected env (1) from .env // tip: ⌘ enable debugging { debug: true }
// Sources flattened with hardhat v2.29.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC2981.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC2981.sol)

pragma solidity >=0.6.2;

/**
 * @dev Interface for the NFT Royalty Standard.
 *
 * A standardized way to retrieve royalty payment information for non-fungible tokens (NFTs) to enable universal
 * support for royalty payments across all NFT marketplaces and ecosystem participants.
 */
interface IERC2981 is IERC165 {
    /**
     * @dev Returns how much royalty is owed and to whom, based on a sale price that may be denominated in any unit of
     * exchange. The royalty amount is denominated and should be paid in that same unit of exchange.
     *
     * NOTE: ERC-2981 allows setting the royalty to 100% of the price. In that case all the price would be sent to the
     * royalty receiver and 0 tokens to the seller. Contracts dealing with royalty should consider empty transfers.
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount);
}


// File @openzeppelin/contracts/utils/introspection/ERC165.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/ERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC-165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165 is IERC165 {
    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}


// File @openzeppelin/contracts/token/common/ERC2981.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/common/ERC2981.sol)

pragma solidity ^0.8.20;


/**
 * @dev Implementation of the NFT Royalty Standard, a standardized way to retrieve royalty payment information.
 *
 * Royalty information can be specified globally for all token ids via {_setDefaultRoyalty}, and/or individually for
 * specific token ids via {_setTokenRoyalty}. The latter takes precedence over the first.
 *
 * Royalty is specified as a fraction of sale price. {_feeDenominator} is overridable but defaults to 10000, meaning the
 * fee is specified in basis points by default.
 *
 * IMPORTANT: ERC-2981 only specifies a way to signal royalty information and does not enforce its payment. See
 * https://eips.ethereum.org/EIPS/eip-2981#optional-royalty-payments[Rationale] in the ERC. Marketplaces are expected to
 * voluntarily pay royalties together with sales, but note that this standard is not yet widely supported.
 */
abstract contract ERC2981 is IERC2981, ERC165 {
    struct RoyaltyInfo {
        address receiver;
        uint96 royaltyFraction;
    }

    RoyaltyInfo private _defaultRoyaltyInfo;
    mapping(uint256 tokenId => RoyaltyInfo) private _tokenRoyaltyInfo;

    /**
     * @dev The default royalty set is invalid (eg. (numerator / denominator) >= 1).
     */
    error ERC2981InvalidDefaultRoyalty(uint256 numerator, uint256 denominator);

    /**
     * @dev The default royalty receiver is invalid.
     */
    error ERC2981InvalidDefaultRoyaltyReceiver(address receiver);

    /**
     * @dev The royalty set for a specific `tokenId` is invalid (eg. (numerator / denominator) >= 1).
     */
    error ERC2981InvalidTokenRoyalty(uint256 tokenId, uint256 numerator, uint256 denominator);

    /**
     * @dev The royalty receiver for `tokenId` is invalid.
     */
    error ERC2981InvalidTokenRoyaltyReceiver(uint256 tokenId, address receiver);

    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @inheritdoc IERC2981
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) public view virtual returns (address receiver, uint256 amount) {
        RoyaltyInfo storage _royaltyInfo = _tokenRoyaltyInfo[tokenId];
        address royaltyReceiver = _royaltyInfo.receiver;
        uint96 royaltyFraction = _royaltyInfo.royaltyFraction;

        if (royaltyReceiver == address(0)) {
            royaltyReceiver = _defaultRoyaltyInfo.receiver;
            royaltyFraction = _defaultRoyaltyInfo.royaltyFraction;
        }

        uint256 royaltyAmount = (salePrice * royaltyFraction) / _feeDenominator();

        return (royaltyReceiver, royaltyAmount);
    }

    /**
     * @dev The denominator with which to interpret the fee set in {_setTokenRoyalty} and {_setDefaultRoyalty} as a
     * fraction of the sale price. Defaults to 10000 so fees are expressed in basis points, but may be customized by an
     * override.
     */
    function _feeDenominator() internal pure virtual returns (uint96) {
        return 10000;
    }

    /**
     * @dev Sets the royalty information that all ids in this contract will default to.
     *
     * Requirements:
     *
     * - `receiver` cannot be the zero address.
     * - `feeNumerator` cannot be greater than the fee denominator.
     */
    function _setDefaultRoyalty(address receiver, uint96 feeNumerator) internal virtual {
        uint256 denominator = _feeDenominator();
        if (feeNumerator > denominator) {
            // Royalty fee will exceed the sale price
            revert ERC2981InvalidDefaultRoyalty(feeNumerator, denominator);
        }
        if (receiver == address(0)) {
            revert ERC2981InvalidDefaultRoyaltyReceiver(address(0));
        }

        _defaultRoyaltyInfo = RoyaltyInfo(receiver, feeNumerator);
    }

    /**
     * @dev Removes default royalty information.
     */
    function _deleteDefaultRoyalty() internal virtual {
        delete _defaultRoyaltyInfo;
    }

    /**
     * @dev Sets the royalty information for a specific token id, overriding the global default.
     *
     * Requirements:
     *
     * - `receiver` cannot be the zero address.
     * - `feeNumerator` cannot be greater than the fee denominator.
     */
    function _setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) internal virtual {
        uint256 denominator = _feeDenominator();
        if (feeNumerator > denominator) {
            // Royalty fee will exceed the sale price
            revert ERC2981InvalidTokenRoyalty(tokenId, feeNumerator, denominator);
        }
        if (receiver == address(0)) {
            revert ERC2981InvalidTokenRoyaltyReceiver(tokenId, address(0));
        }

        _tokenRoyaltyInfo[tokenId] = RoyaltyInfo(receiver, feeNumerator);
    }

    /**
     * @dev Resets royalty information for the token id back to the global default.
     */
    function _resetTokenRoyalty(uint256 tokenId) internal virtual {
        delete _tokenRoyaltyInfo[tokenId];
    }
}


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC721/IERC721.sol)

pragma solidity >=0.6.2;

/**
 * @dev Required interface of an ERC-721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC-721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or
     *   {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC-721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File contracts/OpenWorldMarketplace.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.24;


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
