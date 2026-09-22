const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("--------------------------------------------------");
  console.log("🚀 Deploying OpenWorld contracts to Botchain Testnet...");
  console.log("👤 Deployer Address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer Balance:", ethers.formatEther(balance), "BOT");
  console.log("--------------------------------------------------");

  const chainId = (await ethers.provider.getNetwork()).chainId;
  const isMainnet = Number(chainId) === 677;

  // 1. Deploy Genesis Collection NFT Contract
  const OpenWorldNFT = await ethers.getContractFactory("OpenWorldNFT");
  const nft = await OpenWorldNFT.deploy(
    "OpenWorld Genesis",
    "OWG",
    isMainnet 
      ? "The genesis flagship cyberpunk collection on Botchain Mainnet" 
      : "The genesis flagship cyberpunk collection on Botchain Testnet",
    10000,
    ethers.parseEther("0.1"), // 0.1 BOT mint price
    deployer.address,
    500 // 5% creator royalty
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ OpenWorldNFT deployed to:", nftAddress);

  // 2. Deploy Marketplace Contract
  const OpenWorldMarketplace = await ethers.getContractFactory("OpenWorldMarketplace");
  const marketplace = await OpenWorldMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ OpenWorldMarketplace deployed to:", marketplaceAddress);

  // 3. Export Contract Addresses and ABIs for Frontend
  const deployedInfo = {
    network: isMainnet ? "botchainMainnet" : "botchainTestnet",
    chainId: Number(chainId),
    rpcUrl: isMainnet ? "https://rpc.botchain.ai" : "https://rpc.bohr.life",
    explorerUrl: isMainnet ? "https://scan.botchain.ai" : "https://scan.bohr.life",
    nftAddress: nftAddress,
    marketplaceAddress: marketplaceAddress,
    deployedAt: new Date().toISOString(),
  };

  const frontendContractsDir = path.join(__dirname, "../../frontend/src/config");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendContractsDir, "deployedContracts.json"),
    JSON.stringify(deployedInfo, null, 2)
  );

  console.log("📄 Exported contract addresses to frontend config!");
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
