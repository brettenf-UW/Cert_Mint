import { ethers } from 'ethers';
import contractABI from './contractABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1Fb5EfEaf2f9504DFdE2b4136f711a5E2331a186';
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Switch to Sepolia if not already on it
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SepoliaETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
        } else {
          throw switchError;
        }
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer);

      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async isConnected() {
    if (!window.ethereum) return false;
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  async getCurrentAccount() {
    if (!window.ethereum) return null;
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      return accounts[0] || null;
    } catch {
      return null;
    }
  }

  async hasRole(role, address) {
    if (!this.contract) throw new Error('Not connected to contract');
    
    try {
      return await this.contract.hasRole(role, address);
    } catch (error) {
      console.error('Error checking role:', error);
      throw error;
    }
  }

  async getMinterRole() {
    if (!this.contract) throw new Error('Not connected to contract');
    return await this.contract.MINTER_ROLE();
  }

  async issueCertificate(recipientAddress, tokenURI) {
    if (!this.contract) throw new Error('Not connected to contract');
    
    try {
      const tx = await this.contract.issueCertificate(recipientAddress, tokenURI);
      const receipt = await tx.wait();
      
      // Extract token ID from event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'CertificateIssued'
      );
      
      return {
        transactionHash: receipt.hash,
        tokenId: event ? event.args[0].toString() : null,
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  async getCertificateDetails(tokenId) {
    if (!this.contract) throw new Error('Not connected to contract');
    
    try {
      const owner = await this.contract.ownerOf(tokenId);
      const tokenURI = await this.contract.tokenURI(tokenId);
      
      return { owner, tokenURI };
    } catch (error) {
      console.error('Error getting certificate details:', error);
      throw error;
    }
  }

  async getCertificatesByOwner(ownerAddress) {
    if (!this.contract) throw new Error('Not connected to contract');
    
    try {
      // Get all Transfer events to this address
      const filter = this.contract.filters.Transfer(null, ownerAddress);
      const events = await this.contract.queryFilter(filter);
      
      const certificates = [];
      for (const event of events) {
        const tokenId = event.args[2].toString();
        try {
          const currentOwner = await this.contract.ownerOf(tokenId);
          if (currentOwner.toLowerCase() === ownerAddress.toLowerCase()) {
            const tokenURI = await this.contract.tokenURI(tokenId);
            certificates.push({ tokenId, tokenURI });
          }
        } catch {
          // Token might be burned or transferred
        }
      }
      
      return certificates;
    } catch (error) {
      console.error('Error getting certificates by owner:', error);
      throw error;
    }
  }
}

export const web3Service = new Web3Service();