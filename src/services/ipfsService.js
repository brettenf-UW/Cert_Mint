import axios from 'axios';

// Using NFT.Storage for free IPFS pinning
const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY || '';
const NFT_STORAGE_API = 'https://api.nft.storage/upload';

export class IPFSService {
  async uploadMetadata(certificateData) {
    try {
      // Create metadata JSON
      const attributes = [
        {
          trait_type: 'Course',
          value: certificateData.courseName,
        },
        {
          trait_type: 'Issuer',
          value: certificateData.issuer,
        },
        {
          trait_type: 'Student',
          value: certificateData.studentName || 'N/A',
        },
        {
          display_type: 'date',
          trait_type: 'Date',
          value: Math.floor(new Date(certificateData.completionDate).getTime() / 1000),
        },
      ];

      // Add expiration date if provided
      if (certificateData.expirationDate) {
        attributes.push({
          display_type: 'date',
          trait_type: 'Expiration Date',
          value: Math.floor(new Date(certificateData.expirationDate).getTime() / 1000),
        });
      }

      const metadata = {
        name: `Certificate: ${certificateData.courseName}`,
        description: `Awarded by ${certificateData.issuer}`,
        image: 'ipfs://bafkreih7qfhvoh3gvjrnwnqmkfk3mly5s2lx3nlwb6cxdxe6motpbbqpsu', // Placeholder certificate image
        external_url: `https://linkedinproof.app/verify/${certificateData.tokenId || 'pending'}`,
        attributes: attributes,
      };

      // If NFT.Storage key is available, use it
      if (NFT_STORAGE_API_KEY) {
        const response = await axios.post(
          NFT_STORAGE_API,
          JSON.stringify(metadata),
          {
            headers: {
              'Authorization': `Bearer ${NFT_STORAGE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return `ipfs://${response.data.value.cid}`;
      }

      // Fallback: Use a mock IPFS URL for testing
      // In production, you would need to set up proper IPFS pinning
      console.warn('No NFT.Storage API key found. Using mock IPFS URL.');
      const mockCID = 'bafkreic' + Math.random().toString(36).substring(2, 15);
      
      // Store in localStorage for demo purposes
      localStorage.setItem(`cert_${mockCID}`, JSON.stringify(metadata));
      
      return `ipfs://${mockCID}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  // Fetch metadata from IPFS (or localStorage for demo)
  async fetchMetadata(ipfsUrl) {
    try {
      const cid = ipfsUrl.replace('ipfs://', '');
      
      // Check localStorage first (for demo)
      const localData = localStorage.getItem(`cert_${cid}`);
      if (localData) {
        return JSON.parse(localData);
      }

      // Try to fetch from IPFS gateway
      const gateways = [
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
      ];

      for (const gateway of gateways) {
        try {
          const response = await axios.get(gateway, { timeout: 10000 });
          return response.data;
        } catch (err) {
          console.warn(`Failed to fetch from ${gateway}:`, err.message);
        }
      }

      throw new Error('Failed to fetch from all IPFS gateways');
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error('Failed to fetch metadata from IPFS');
    }
  }
}

export const ipfsService = new IPFSService();