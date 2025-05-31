const hre = require("hardhat");

async function main() {
  console.log("Testing CourseCertificate locally...\n");
  
  // Deploy contract
  const CourseCertificate = await hre.ethers.getContractFactory("CourseCertificate");
  const certificate = await CourseCertificate.deploy();
  await certificate.waitForDeployment();
  
  const contractAddress = await certificate.getAddress();
  console.log("Contract deployed to:", contractAddress);
  
  // Get signers
  const [deployer, student] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Student address:", student.address, "\n");
  
  // Test issuing a certificate
  console.log("Issuing certificate...");
  const metadata = {
    name: "Certificate: Blockchain 101",
    description: "Awarded by Example University",
    image: "ipfs://QmXxx/certificate.png",
    external_url: `https://linkedinproof.app/verify/1`,
    attributes: [
      { trait_type: "Course", value: "Blockchain 101" },
      { trait_type: "Issuer", value: "Example University" },
      { display_type: "date", trait_type: "Date", value: Math.floor(Date.now() / 1000) }
    ]
  };
  
  const tokenURI = "ipfs://QmExampleCID/metadata.json"; // In real app, upload to IPFS first
  
  const tx = await certificate.issueCertificate(student.address, tokenURI);
  const receipt = await tx.wait();
  
  console.log("Certificate issued! Transaction hash:", receipt.hash);
  console.log("Gas used:", receipt.gasUsed.toString());
  
  // Verify certificate
  const tokenId = 1;
  const owner = await certificate.ownerOf(tokenId);
  const uri = await certificate.tokenURI(tokenId);
  
  console.log("\nCertificate verification:");
  console.log("Token ID:", tokenId);
  console.log("Owner:", owner);
  console.log("Token URI:", uri);
  console.log("Metadata would contain:", JSON.stringify(metadata, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });