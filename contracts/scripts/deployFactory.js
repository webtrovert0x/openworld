const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying DropFactory with account:", deployer.address);
  
  const DropFactory = await hre.ethers.getContractFactory("DropFactory");
  const factory = await DropFactory.deploy();
  
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("DropFactory deployed to:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
