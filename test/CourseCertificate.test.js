const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CourseCertificate", function () {
  let certificate;
  let owner;
  let issuer;
  let student;
  let nonIssuer;

  beforeEach(async function () {
    [owner, issuer, student, nonIssuer] = await ethers.getSigners();
    
    const CourseCertificate = await ethers.getContractFactory("CourseCertificate");
    certificate = await CourseCertificate.deploy();
    await certificate.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await certificate.name()).to.equal("LinkedIn Proof Certificate");
      expect(await certificate.symbol()).to.equal("CERT");
    });

    it("Should grant admin and minter roles to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const MINTER_ROLE = await certificate.MINTER_ROLE();
      
      expect(await certificate.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await certificate.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant minter role", async function () {
      const MINTER_ROLE = await certificate.MINTER_ROLE();
      await certificate.grantRole(MINTER_ROLE, issuer.address);
      expect(await certificate.hasRole(MINTER_ROLE, issuer.address)).to.be.true;
    });

    it("Should not allow non-admin to grant roles", async function () {
      const MINTER_ROLE = await certificate.MINTER_ROLE();
      await expect(
        certificate.connect(nonIssuer).grantRole(MINTER_ROLE, issuer.address)
      ).to.be.reverted;
    });
  });

  describe("Certificate Issuance", function () {
    const tokenURI = "ipfs://QmXxx/metadata.json";
    
    it("Should allow minter to issue certificate", async function () {
      await expect(certificate.issueCertificate(student.address, tokenURI))
        .to.emit(certificate, "CertificateIssued")
        .withArgs(1, student.address, owner.address, tokenURI);
      
      expect(await certificate.ownerOf(1)).to.equal(student.address);
      expect(await certificate.tokenURI(1)).to.equal(tokenURI);
    });

    it("Should not allow non-minter to issue certificate", async function () {
      await expect(
        certificate.connect(nonIssuer).issueCertificate(student.address, tokenURI)
      ).to.be.reverted;
    });

    it("Should increment token IDs correctly", async function () {
      await certificate.issueCertificate(student.address, tokenURI);
      await certificate.issueCertificate(issuer.address, tokenURI);
      
      expect(await certificate.getCurrentTokenId()).to.equal(2);
    });

    it("Should reject minting to zero address", async function () {
      await expect(
        certificate.issueCertificate(ethers.ZeroAddress, tokenURI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should reject empty token URI", async function () {
      await expect(
        certificate.issueCertificate(student.address, "")
      ).to.be.revertedWith("Token URI cannot be empty");
    });
  });
});