# LinkedIn Proof – Course Certification on Blockchain

LinkedIn Proof is a decentralized platform for issuing tamper-proof course certificates as NFTs. Verified course providers (issuers) can mint an NFT "credential" directly to a student's wallet, embedding the course name, issuer name, completion date, and a verification link into the token's metadata. The student (or any third party) can then view the NFT to verify the certificate information. The system's core components are a Solidity smart contract (on Ethereum Sepolia testnet) and a React-based web front end. The smart contract handles minting and access control; the front end connects to MetaMask to let issuers issue certificates and anyone verify them. All important certificate data is stored in the NFT's metadata JSON (e.g. on IPFS) so it is publicly auditable on-chain.

## Smart Contract Architecture

### ERC-721 NFT Contract

Use OpenZeppelin's ERC-721 implementation for the certificate tokens. For example, one can extend `ERC721URIStorage` or use the preset `ERC721PresetMinterPauserAutoId` (which includes minting functionality). The contract should define a minter role (e.g. `MINTER_ROLE`) using OpenZeppelin's `AccessControl`. The deployer becomes the admin and can grant or revoke the issuer role to addresses. Only addresses with `MINTER_ROLE` can call the mint function. For instance:

```solidity
function issueCertificate(address to, string memory tokenURI) external
onlyRole(MINTER_ROLE) {
    _safeMint(to, tokenId++);
    _setTokenURI(tokenId, tokenURI);
}
```

This mints a new NFT to the student address and sets its `tokenURI`. Always emit the standard `Transfer` event (inherited from ERC-721) for each mint, so wallets and explorers can track the token. Use a counter (like OZ's Counters library) to ensure unique incremental IDs. Protect against common pitfalls: validate non-zero addresses, use Solidity ^0.8's built-in overflow checks, and follow checks-effects-interactions. For any additional logic (e.g. pausing or burning), reuse OZ contracts rather than rolling your own for safety.

### NFT Metadata Structure

Each NFT's metadata JSON should include the course information. A recommended format is:

```json
{
    "name": "Certificate: Blockchain 101",
    "description": "Awarded by Example University",
    "image": "ipfs://<CID>/certificate.png",
    "external_url": "https://linkedinproof.app/verify/<tokenId>",
    "attributes": [
        { "trait_type": "Course", "value": "Blockchain 101" },
        { "trait_type": "Issuer", "value": "Example University" },
        { "display_type": "date", "trait_type": "Date", "value": 1685400000 }
    ]
}
```

Key fields are: Course name, Issuer, Date (e.g. UNIX timestamp), and an `external_url` or attribute for the verification link. This way the NFT carries all certificate data. The `external_url` can point to your app's verification page for that token. The `image` field could be a static certificate image or logo (stored on IPFS). Note that the actual text fields (strings) are not stored on-chain but referenced via the URI. When a verifier looks up the NFT (via `tokenURI`), they fetch this JSON to see the course details and verification link. For example, calling `ownerOf(tokenId)` returns the student's address and `tokenURI(tokenId)` returns the metadata URL.

### Metadata Storage: On-Chain vs. IPFS

Storing all metadata on-chain is technically possible but prohibitively expensive. OpenZeppelin notes that including full NFT information on-chain "will be rather costly", and industry practice is to store NFT JSON off-chain. Most NFT projects store metadata off-chain (e.g. on IPFS) and keep only a URI on-chain. Likewise, for LinkedIn Proof we recommend pinning the metadata JSON on IPFS (or using a service like NFT.Storage) and setting the NFT's `tokenURI` to the resulting CID. This leverages IPFS's decentralization and immutability without bloating the blockchain. IPFS is censorship-resistant and ensures the metadata file cannot be tampered with once pinned. In contrast, on-chain storage of long strings (names, links, etc.) would drastically increase gas costs per mint. As best practice, store only a content hash (CID) or short URI on-chain and keep the heavy data off-chain.

### Access Control & Best Practices

- **Roles**: Use OpenZeppelin's `AccessControl` to manage issuers. Define a `MINTER_ROLE` and use the `onlyRole` modifier to guard mint functions. The deployer account gets the default admin role and can call `grantRole(MINTER_ROLE, addr)` to approve additional issuers (e.g. different departments or institutions).

- **Gas Optimization**: Mark immutable values (like the NFT `name` and `symbol`) as `constant`. Use `uint256` for numbers and pack multiple `uint96` or `uint80` values into a single `uint256` if needed. Avoid dynamic storage loops. Since each mint emits a `Transfer` event by default, do not emit redundant events. Optimize by using modern Solidity (^0.8+) which has built-in overflow checks and cheaper memory strings.

- **Security**: Follow checks-effects-interactions: do all internal state updates before any external calls. Use `ReentrancyGuard` if you ever call out. Emit events on role changes (`RoleGranted`, etc.). Provide clear revert messages for invalid calls. Use proper `constructor` initialization to set up roles. Keep functions as `external` where possible to save gas.

## Front-End Architecture

### Tech Stack

Build the front end as a modern React application. You may use Next.js (for SSR/SSG) or Vite (for a lightweight SPA). Use Material UI (MUI v5) for components and styling, which supports Material Design 3 (MD3) theming. MUI lets you easily apply a dynamic color palette and round corners. For blockchain interaction, use ethers.js to talk to the smart contract and MetaMask as the web3 provider. The app should run on the Sepolia testnet; configure your RPC (e.g. an Alchemy Sepolia endpoint) accordingly.

- **Key Libraries**: `@mui/material` for UI, `ethers` or `wagmi` for Ethereum. The ABI of the certificate contract goes into the front end to create a new `ethers.Contract(address, abi, signer)`.

- **State Management**: For simplicity, use React hooks. For example, create a `useContract` hook that initializes the contract with a signer once MetaMask is connected. Keep account/wallet state (address, connection status) in context or a top-level component.

### MetaMask & Ethers Integration

Upon loading, the app should detect `window.ethereum`. Use `ethers.providers.Web3Provider(window.ethereum)` to connect to MetaMask. For example:

```javascript
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []); // Request wallet connection
const signer = provider.getSigner();
const contract = new ethers.Contract(CERT_ADDRESS, CERT_ABI, signer);
```

Here `eth_requestAccounts` prompts the user to connect their wallet. After the user approves, you can call contract methods (e.g. `contract.issueCertificate(...)`) and MetaMask will pop up a transaction confirmation. Always handle the case where `window.ethereum` is not available (show a message to install MetaMask).

### Sepolia Testnet Setup

Deploy both contract and app on Ethereum's Sepolia testnet (chain ID 11155111). Sepolia is a Proof-of-Stake testnet commonly used for development. In MetaMask (or your Hardhat config), add a network with Chain ID 11155111, RPC URL (e.g. Alchemy/Infura Sepolia), currency symbol "SepoliaETH", and block explorer https://sepolia.etherscan.io. Use Alchemy or QuickNode to obtain a Sepolia endpoint, and get test ETH from a faucet (e.g. Alchemy's Sepolia Faucet). Once MetaMask is connected to Sepolia and funded, the front end can deploy or interact with the contract. Hardhat's config.ts example:

```javascript
module.exports = {
    solidity: "0.8.19",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY]
        }
    }
};
```

## User Interface (Material Design 3)

### Hero Screen (Landing Page)

The hero screen should introduce LinkedIn Proof with a bold title and subtitle, following MD3 styling. Use the MUI AppBar or top navigation bar (MD3 nav bar with outlined icons) at the top with links like "Issue Certificate" and "Verify Certificate." The background can be a full-width themed color or a subtle NFT-related graphic. Place a prominent Connect Wallet button or Get Started call-to-action in the hero section. Typography should be large and clear (e.g. Typography `variant="h2"`) and buttons should use your custom theme's primary color (dynamic according to Material You). The hero may also include an illustrative image or icon on the right side. Ensure ample padding and whitespace for an uncluttered look. Aim for a "playful" and approachable style (rounder corners, light shadows) as advocated by MD3.

### Certificate Issuing UI (Issuer Dashboard)

Once connected, a verified issuer can navigate to the Issue Certificate page. Use a centered Card or Paper with elevation to hold a form. Include MUI TextField components for:

- Student Wallet Address (type `text`)
- Course Name (text)
- Completion Date (use MUI's date picker or text input)
- Verification URL (text, e.g. a link to the verification page or school site)

Add a primary button labeled "Issue Certificate". On submit, call the smart contract's `issueCertificate(to, uri)` method (after first uploading metadata JSON to IPFS). Show a loading indicator while the transaction is pending. On success, display a confirmation (e.g. a Snackbar or dialog) that includes the new Token ID and a link to view the NFT on Sepolia Etherscan. Use clear form validation (require address format, non-empty fields). Style each input with proper labels and helper text. For example, the button can turn into a loading spinner during minting and then show "Certificate Issued!".

### Verification Page

The Verify Certificate page allows anyone to confirm a certificate's authenticity. Provide an input (e.g. MUI `TextField`) where the user can enter a Token ID or a Wallet Address. For a token ID, call `contract.ownerOf(id)` and `contract.tokenURI(id)`. If a wallet address is used, fetch all NFT IDs for that address (via an indexed event scan or by calling a `tokenOfOwnerByIndex` function if implemented). Then retrieve each token's metadata. Display the certificate details in a Card: show the course name, issuer, date (formatted), and a clickable verification link. If the `image` field was used, display it atop the card. Include a status indicator (e.g. a green "Verified" badge) if the token exists and metadata loads successfully. If no certificate is found, show an error message. You may include a button "Verify on Block Explorer" linking to Sepolia Etherscan for the token. Ensure the page clearly labels fields and results for usability.

## Component & Folder Structure

Organize the code into a clean, scalable structure. For example:

- **/contracts** – Solidity contract files (e.g. `Certificate.sol`)
- **/scripts** – Deployment scripts for Hardhat (e.g. `deploy.js`)
- **/src/components** – Reusable React components (e.g. `Header.js`, `CertificateCard.js`, `MintForm.js`)
- **/src/pages** (if Next.js) or **/src/views** (if Vite SPA) – Main pages: `index.js` (Hero), `Issue.js`, `Verify.js`
- **/src/services** – Helper functions for blockchain (e.g. IPFS upload, ethers contract calls)
- **/src/theme** – MUI theme and styling overrides (to implement MD3 palette/dynamic colors)
- **/public** – Static assets (logo, images)

Each component should be small and focused (e.g. a `MintForm` for issuing, a `VerifyForm` for input, a `CertificateCard` to display results). Keep logic for web3 calls in service hooks or separate modules, not directly in components. For example, a `useCertificateContract` hook can provide `issueCertificate()` and `verifyCertificate()` functions. This modular layout helps developers quickly find and extend parts of the app.

## Developer Setup & Deployment

1. **Prerequisites**: Install Node.js LTS and Git. Ensure you have a MetaMask wallet with Sepolia network added. Get a Sepolia RPC URL (e.g. from Alchemy) and some SepoliaETH via faucet.

2. **Clone Repository**: `git clone <repo_url> && cd linkedincode` (or whatever your repo is called).

3. **Smart Contract**: Navigate to the contracts directory. Install dependencies (`npm install`). Set up a `.env` file with your Alchemy (or Infura) Sepolia URL and deployer private key. Example Hardhat config for Sepolia is shown above. Compile the contract:
   ```bash
   npx hardhat compile
   ```
   Deploy it to Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   After deployment, note the contract address (and optionally verify it on Etherscan).

4. **Front-End Setup**: In the front-end folder (`/src` or root if unified), run `npm install`. Create a `.env` (or `.env.local`) containing the deployed contract address (e.g. `REACT_APP_CONTRACT_ADDRESS=0xYourAddress`). Also include any needed API keys (e.g. INFURA/Alchemy key if using JSON-RPC calls).

5. **Configure MetaMask**: In your browser, switch MetaMask to the Sepolia network (chain ID 11155111). Ensure you have SepoliaETH in your wallet for gas. Then in the app, click "Connect Wallet" to authorize.

6. **Run the App**: Start the development server. For Vite: `npm run dev`. For Next.js: `npm run dev`. This should open the app in your browser.

7. **Testing Flow**:
   - As an issuer, connect MetaMask and go to Issue Certificate. Fill the form and submit. Confirm the MetaMask transaction. The NFT will be minted on Sepolia.
   - Copy the new Token ID and go to Verify Certificate. Enter that ID and check that the details (course, issuer, date) match what was entered. The app should display "Verified".
   - Optionally, switch to another account (MetaMask address without the issuer role) to test that issuing is blocked but verification still works.

This setup and structure ensure another developer can clone the repo and begin building immediately: the smart contract is in `/contracts`, the front-end in `/src`, and detailed UI/UX guidelines are provided above.

## Sources

The design and storage recommendations above follow industry practices: for example, on-chain NFT metadata is usually avoided due to cost, so IPFS is preferred. Ethers.js documentation shows using `Web3Provider(window.ethereum)` to connect MetaMask. Material Design 3 guidelines emphasize rounder UI elements and dynamic theming, which MUI v5 supports. Sepolia network details (chain ID 11155111, faucet, etc.) are documented by providers like Alchemy, and OpenZeppelin's docs demonstrate using AccessControl for minting roles. All these practices and examples guided the architecture and design above.

### References

1. [ERC721 - OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/3.x/erc721)
2. [Ultimate Guide to Web3 Storage: IPFS vs. On-Chain vs. Cloud](https://blog.thirdweb.com/web3-storage/)
3. [How To Build a dApp in Three Steps | Chainlink](https://chain.link/tutorials/how-to-build-a-dapp)
4. [Everything you need to know about Material Design 3 | Design Aware](https://medium.com/design-aware/everything-you-need-to-know-about-material-design-3-afdc3f1e8f15)
5. [How to Connect Your Dapp With MetaMask Using Ethers.js | QuickNode Guides](https://www.quicknode.com/guides/ethereum-development/dapps/how-to-connect-your-dapp-with-metamask-using-ethersjs)
6. [How to Add Sepolia to Metamask | Alchemy Docs](https://www.alchemy.com/docs/how-to-add-sepolia-to-metamask)