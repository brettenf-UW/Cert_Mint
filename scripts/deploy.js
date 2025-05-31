const hre = require("hardhat");

async function main() {
  console.log("Deploying CourseCertificate contract...");
  
  const CourseCertificate = await hre.ethers.getContractFactory("CourseCertificate");
  const certificate = await CourseCertificate.deploy();
  
  await certificate.waitForDeployment();
  
  const address = await certificate.getAddress();
  console.log("CourseCertificate deployed to:", address);
  
  // Get deployer address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Verify the deployer has both admin and minter roles
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const MINTER_ROLE = await certificate.MINTER_ROLE();
  
  const hasAdminRole = await certificate.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasMinterRole = await certificate.hasRole(MINTER_ROLE, deployer.address);
  
  console.log("Deployer has admin role:", hasAdminRole);
  console.log("Deployer has minter role:", hasMinterRole);
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });