const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Seeding real on-chain NFTs from:", signer.address);

  const nftAddress = "0x50Eda285Fdc45AE741eF4F23110E9BE4a3CFec61";
  const marketAddress = "0x526676Bed606B8942dd1Eb18b7E6090E14C5a30A";

  const NFT = await ethers.getContractAt("OpenWorldNFT", nftAddress);
  const Market = await ethers.getContractAt("OpenWorldMarketplace", marketAddress);

  // Metadata 1
  const meta1 = {
    name: "Genesis Cyber Ronin #1",
    description: "First on-chain genesis artifact deployed to Botchain Testnet.",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    attributes: [
      { trait_type: "Class", value: "Cyber Ronin" },
      { trait_type: "Weapon", value: "Plasma Blade" },
      { trait_type: "Rarity", value: "Legendary" }
    ]
  };
  const uri1 = "data:application/json;base64," + Buffer.from(JSON.stringify(meta1)).toString("base64");

  // Metadata 2
  const meta2 = {
    name: "Autonomous Sentinel #2",
    description: "Autonomous AI drone operating on Botchain EVM node network.",
    image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80",
    attributes: [
      { trait_type: "Class", value: "Sentinel" },
      { trait_type: "Armor", value: "Titanium" },
      { trait_type: "Rarity", value: "Epic" }
    ]
  };
  const uri2 = "data:application/json;base64," + Buffer.from(JSON.stringify(meta2)).toString("base64");

  console.log("Minting Token #1...");
  const tx1 = await NFT.mint(uri1, 500, { value: ethers.parseEther("0.1") });
  await tx1.wait();
  console.log("✅ Token #1 minted!");

  console.log("Minting Token #2...");
  const tx2 = await NFT.mint(uri2, 500, { value: ethers.parseEther("0.1") });
  await tx2.wait();
  console.log("✅ Token #2 minted!");

  // Approve marketplace
  console.log("Approving marketplace...");
  const approveTx = await NFT.setApprovalForAll(marketAddress, true);
  await approveTx.wait();
  console.log("✅ Marketplace approved!");

  // List Token #1 for 1.5 BOT
  console.log("Listing Token #1 for 1.5 BOT...");
  const listTx = await Market.listItem(nftAddress, 1, ethers.parseEther("1.5"));
  await listTx.wait();
  console.log("✅ Token #1 listed on OpenWorld Marketplace on Botchain Testnet!");
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exitCode = 1;
});
