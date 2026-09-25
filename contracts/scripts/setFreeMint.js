const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("--------------------------------------------------");
  console.log("Setting Mint Price to 0 BOT (Free Mint) on Botchain Mainnet...");
  console.log("Owner Address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Owner Balance:", ethers.formatEther(balance), "BOT");

  if (balance === 0n) {
    console.error("❌ Owner wallet needs ~0.002 BOT for gas to execute transaction.");
    process.exit(1);
  }

  const nftAddress = "0x245bDD263dEb51bA9325F7CA76F004c601F6D574";
  const abi = [
    "function mintPrice() view returns (uint256)",
    "function setMintPrice(uint256 newPrice) external",
    "function transferOwnership(address newOwner) external"
  ];

  const nft = new ethers.Contract(nftAddress, abi, deployer);

  console.log("Current Mint Price:", ethers.formatEther(await nft.mintPrice()), "BOT");
  
  const tx = await nft.setMintPrice(0);
  console.log("Transaction submitted, waiting for confirmation... TX:", tx.hash);
  await tx.wait();

  console.log("✅ Mint Price successfully updated to:", ethers.formatEther(await nft.mintPrice()), "BOT (FREE MINT)!");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
