# LinkedIn Proof – Course Certification on Blockchain

## Project Overview

LinkedIn Proof is a decentralized application (dApp) for issuing tamper-proof course certificates as NFTs on the Ethereum blockchain. The platform enables verified educational institutions and course providers to mint NFT certificates directly to students' wallets, creating an immutable record of their achievements.

### Current Implementation Status

✅ **Smart Contract**: Deployed to Sepolia testnet at `0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186`
✅ **Frontend**: React + Vite application with Material UI (Material Design 3)
✅ **Web3 Integration**: MetaMask connection with ethers.js
✅ **IPFS Storage**: Multiple provider support (Pinata, Web3.Storage, local fallback)
✅ **Core Features**: Certificate issuance, verification, and wallet management

## Architecture

### Smart Contract (`CourseCertificate.sol`)

The contract extends OpenZeppelin's ERC721URIStorage and AccessControl:

- **Token Standard**: ERC-721 NFT with URI storage
- **Access Control**: Role-based permissions using `MINTER_ROLE`
- **Key Functions**:
  - `issueCertificate(address to, string tokenURI)`: Mints certificate NFT
  - `getCurrentTokenId()`: Returns the latest token ID
  - Role management via AccessControl (grant/revoke minter privileges)

### Frontend Structure

```
src/
├── components/
│   └── Header.jsx          # Navigation bar with wallet connection
├── hooks/
│   └── useWeb3.js          # Web3 connection and role checking
├── services/
│   ├── web3Service.js      # Blockchain interactions
│   ├── ipfsService.js      # IPFS metadata storage
│   └── contractABI.json    # Contract interface
├── theme/
│   └── theme.js            # Material Design 3 theme
├── views/
│   ├── Hero.jsx            # Landing page
│   ├── IssueCertificate.jsx # Certificate creation form
│   └── VerifyCertificate.jsx # Certificate verification
└── App.jsx                 # Main application component
```

### Key Components

#### Web3 Service (`web3Service.js`)
- MetaMask connection and network switching to Sepolia
- Contract interaction methods
- Role checking for minter permissions
- Certificate querying by ID or owner

#### IPFS Service (`ipfsService.js`)
- Supports multiple storage providers:
  - **Pinata**: Production-ready IPFS pinning (configured)
  - **Web3.Storage**: Alternative free option
  - **Local Storage**: Development fallback
- Metadata structure follows NFT standards with attributes

#### Certificate Metadata Format
```json
{
  "name": "Certificate: [Course Name]",
  "description": "Awarded by [Issuer]",
  "image": "ipfs://[CID]",
  "external_url": "https://linkedinproof.app/verify/[tokenId]",
  "attributes": [
    { "trait_type": "Course", "value": "[Course Name]" },
    { "trait_type": "Issuer", "value": "[Issuer Name]" },
    { "trait_type": "Student", "value": "[Student Name]" },
    { "display_type": "date", "trait_type": "Date", "value": [Unix Timestamp] },
    { "display_type": "date", "trait_type": "Expiration Date", "value": [Unix Timestamp] }
  ]
}
```

## Current Configuration

### Environment Variables (.env)
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/[YOUR_KEY]
DEPLOYER_PRIVATE_KEY=[YOUR_PRIVATE_KEY]
CONTRACT_ADDRESS=0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186

# IPFS Storage - Pinata configured
VITE_PINATA_API_KEY=[YOUR_API_KEY]
VITE_PINATA_SECRET=[YOUR_SECRET]
```

### Technology Stack
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin 5.0
- **Frontend**: React 18, Vite, Material UI 5
- **Web3**: ethers.js 6.x
- **IPFS**: Pinata (primary), Web3.Storage (backup)
- **Build Tools**: Hardhat, ESLint

## User Flows

### For Certificate Issuers
1. Connect MetaMask wallet
2. Ensure wallet has MINTER_ROLE
3. Navigate to "Issue Certificate"
4. Fill in certificate details:
   - Student wallet address
   - Student name (optional)
   - Course name
   - Issuer name
   - Completion date
   - Expiration date (optional)
   - Verification URL (optional)
5. Submit transaction
6. Certificate metadata uploaded to IPFS
7. NFT minted to student's wallet

### For Certificate Verification
1. Navigate to "Verify Certificate"
2. Enter either:
   - Token ID for specific certificate
   - Wallet address to see all certificates
3. View certificate details:
   - Course information
   - Issuer details
   - Completion date
   - Current owner
   - Blockchain verification status

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy smart contract
npx hardhat run scripts/deploy.js --network sepolia

# Run tests
npm test
npx hardhat test

# Grant minter role (via Hardhat console)
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("CourseCertificate", "0x1Fb5...")
> await contract.grantRole(await contract.MINTER_ROLE(), "0xNewMinterAddress")
```

## Security Considerations

- **Access Control**: Only addresses with MINTER_ROLE can issue certificates
- **Input Validation**: Address format and required fields validated
- **Network Security**: Automatic network switching to Sepolia
- **Private Key Safety**: Never commit private keys; use environment variables
- **IPFS Immutability**: Certificate data cannot be altered once uploaded

## Future Enhancements

1. **Certificate Templates**: Pre-designed certificate images
2. **Bulk Issuance**: Issue multiple certificates in one transaction
3. **Institution Profiles**: Enhanced issuer verification
4. **Skills Taxonomy**: Standardized course categorization
5. **Cross-chain Support**: Deploy to multiple networks
6. **Mobile App**: Native mobile experience
7. **Analytics Dashboard**: Track issued certificates
8. **Revocation System**: Allow issuers to revoke certificates

## Troubleshooting

### Common Issues

1. **"No MINTER_ROLE" Error**: Contact contract admin to grant role
2. **IPFS Upload Fails**: Check API keys in .env file
3. **MetaMask Not Detected**: Ensure MetaMask extension is installed
4. **Wrong Network**: App automatically prompts to switch to Sepolia
5. **Insufficient Funds**: Get test ETH from Sepolia faucet

### Getting Test ETH
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

## References

- [Project Repository](https://github.com/[your-username]/cert-mint)
- [Contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Material Design 3](https://m3.material.io/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)