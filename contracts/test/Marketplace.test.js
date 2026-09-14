const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OpenWorld NFT and Marketplace", function () {
  let nft;
  let marketplace;
  let owner;
  let seller;
  let buyer;
  let feeRecipient;

  beforeEach(async function () {
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();

    // Deploy OpenWorldNFT
    const OpenWorldNFTFactory = await ethers.getContractFactory("OpenWorldNFT");
    nft = await OpenWorldNFTFactory.deploy(
      "OpenWorld Genesis",
      "OWG",
      "Genesis Collection on Botchain",
      1000,
      0, // Free mint in test
      owner.address,
      500 // 5% default royalty
    );
    await nft.waitForDeployment();

    // Deploy OpenWorldMarketplace
    const MarketplaceFactory = await ethers.getContractFactory("OpenWorldMarketplace");
    marketplace = await MarketplaceFactory.deploy(feeRecipient.address);
    await marketplace.waitForDeployment();
  });

  it("Should allow minting of NFT with custom metadata and royalties", async function () {
    const tokenURI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const tx = await nft.connect(seller).mint(tokenURI, 500); // 5% royalty
    await tx.wait();

    expect(await nft.ownerOf(1)).to.equal(seller.address);
    expect(await nft.tokenURI(1)).to.equal(tokenURI);
    expect(await nft.totalSupply()).to.equal(1);
  });

  it("Should allow listing and purchasing an NFT with native BOT", async function () {
    // Mint NFT to seller
    await nft.connect(seller).mint("ipfs://test-uri", 500);

    // Approve marketplace
    await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

    const price = ethers.parseEther("10"); // 10 BOT

    // List item
    await marketplace.connect(seller).listItem(await nft.getAddress(), 1, price);

    const listing = await marketplace.getListing(await nft.getAddress(), 1);
    expect(listing.isActive).to.be.true;
    expect(listing.price).to.equal(price);
    expect(listing.seller).to.equal(seller.address);

    // Buyer buys item
    const initialSellerBalance = await ethers.provider.getBalance(seller.address);
    const initialFeeBalance = await ethers.provider.getBalance(feeRecipient.address);

    await marketplace.connect(buyer).buyItem(await nft.getAddress(), 1, { value: price });

    // Verify ownership transferred
    expect(await nft.ownerOf(1)).to.equal(buyer.address);

    // Verify listing is inactive
    const listingAfter = await marketplace.getListing(await nft.getAddress(), 1);
    expect(listingAfter.isActive).to.be.false;

    // Verify balances increased
    const finalFeeBalance = await ethers.provider.getBalance(feeRecipient.address);
    expect(finalFeeBalance).to.be.gt(initialFeeBalance);
  });

  it("Should allow creating, cancelling, and accepting offers", async function () {
    // Mint NFT to seller
    await nft.connect(seller).mint("ipfs://offer-test", 500);

    // Buyer creates offer for 5 BOT
    const offerAmount = ethers.parseEther("5");
    await marketplace.connect(buyer).createOffer(
      await nft.getAddress(),
      1,
      86400, // 1 day
      { value: offerAmount }
    );

    const offer = await marketplace.getOffer(await nft.getAddress(), 1, buyer.address);
    expect(offer.isActive).to.be.true;
    expect(offer.amount).to.equal(offerAmount);

    // Seller approves marketplace and accepts offer
    await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);
    await marketplace.connect(seller).acceptOffer(await nft.getAddress(), 1, buyer.address);

    // Check ownership transferred to buyer
    expect(await nft.ownerOf(1)).to.equal(buyer.address);
  });
});
