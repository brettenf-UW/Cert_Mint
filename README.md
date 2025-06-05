# LinkedIn Proof - Blockchain Course Certificates 🎓

Issue and verify tamper-proof educational certificates as NFTs on the blockchain.

![LinkedIn Proof Banner](https://img.shields.io/badge/Blockchain-Certificates-blue?style=for-the-badge)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-green?style=for-the-badge)

## 🌟 Features

- **🔐 Blockchain-Verified**: Certificates are NFTs stored on Ethereum, making them tamper-proof
- **📋 Easy Issuance**: Simple form to issue certificates to students
- **✅ Quick Verification**: Anyone can verify certificates using Token ID or wallet address
- **📊 Issuer Dashboard**: Track all certificates you've issued with statistics
- **🚀 Fast & Efficient**: Optimized for quick loading and smooth interactions
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### For Students & Verifiers

1. **Visit the App**: [LinkedIn Proof](https://your-github-username.github.io/Cert_Mint/)
2. **To Verify a Certificate**:
   - Click the green "Verify Certificate" button
   - Enter either a Token ID or wallet address
   - View the certificate details instantly

### For Certificate Issuers

1. **Connect Your Wallet**:
   - Install [MetaMask](https://metamask.io/) browser extension
   - Connect to Sepolia testnet
   - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Get Issuer Access**:
   - Contact the contract admin to grant you MINTER_ROLE
   - Your wallet address: `0x...` needs permission

3. **Issue Certificates**:
   - Navigate to "Issue Certificate"
   - Fill in student details and course information
   - Submit and confirm the transaction

4. **Manage Your Certificates**:
   - View all issued certificates in your Dashboard
   - See statistics and reissue similar certificates

## 🛠️ Technical Details

- **Smart Contract**: [View on Etherscan](https://sepolia.etherscan.io/address/0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186)
- **Network**: Ethereum Sepolia Testnet
- **Token Standard**: ERC-721 NFT
- **Storage**: IPFS via Pinata

## 💻 Local Development

### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet
- Test ETH on Sepolia

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/Cert_Mint.git
cd Cert_Mint

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
# Contract address (already deployed)
CONTRACT_ADDRESS=0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186

# IPFS Storage - Choose one:
# Option 1: Pinata (recommended)
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET=your_secret_key

# Option 2: Leave empty to use local storage (for testing)
```

### Building for Production

```bash
# Build the app
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📖 How It Works

1. **Issuers** create certificates by minting NFTs to student wallets
2. **Certificate data** is stored on IPFS (decentralized storage)
3. **NFT** contains a link to the IPFS data
4. **Anyone** can verify by looking up the NFT on the blockchain

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/Cert_Mint/issues)
- **Documentation**: See [claude.md](./claude.md) for detailed technical docs

---

Built with ❤️ using React, Ethereum, and IPFS
