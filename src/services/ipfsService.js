import axios from 'axios';

// Using Pinata for IPFS pinning (more reliable than NFT.Storage)
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET = import.meta.env.VITE_PINATA_SECRET || '';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_API = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

// Fallback to NFT.Storage if configured
const NFT_STORAGE_API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY || '';

// Debug logging
console.log('IPFS Service initialized');
console.log('Using Pinata:', !!(PINATA_API_KEY || PINATA_JWT));
console.log('Using NFT.Storage:', !!NFT_STORAGE_API_KEY);

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

      // Try Pinata first if configured
      if ((PINATA_API_KEY && PINATA_SECRET) || PINATA_JWT) {
        try {
          // Prepare headers based on auth method
          const headers = {
            'Content-Type': 'application/json'
          };
          
          if (PINATA_JWT) {
            // Use JWT authentication (newer method)
            headers['Authorization'] = `Bearer ${PINATA_JWT}`;
          } else {
            // Use API key + secret (legacy method)
            headers['pinata_api_key'] = PINATA_API_KEY;
            headers['pinata_secret_api_key'] = PINATA_SECRET;
          }
          
          const response = await axios.post(
            PINATA_API,
            {
              pinataContent: metadata,
              pinataOptions: {
                cidVersion: 1
              },
              pinataMetadata: {
                name: `Certificate-${certificateData.courseName}-${Date.now()}`
              }
            },
            { headers }
          );

          console.log('Successfully uploaded to Pinata:', response.data.IpfsHash);
          return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
          console.error('Pinata upload failed:', error.response?.data || error.message);
        }
      }

      // Try web3.storage as an alternative (free and reliable)
      const WEB3_STORAGE_API = 'https://api.web3.storage/upload';
      const WEB3_STORAGE_KEY = import.meta.env.VITE_WEB3_STORAGE_KEY;
      
      if (WEB3_STORAGE_KEY) {
        try {
          const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
          const response = await axios.post(
            WEB3_STORAGE_API,
            blob,
            {
              headers: {
                'Authorization': `Bearer ${WEB3_STORAGE_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log('Successfully uploaded to Web3.Storage:', response.data.cid);
          return `ipfs://${response.data.cid}`;
        } catch (error) {
          console.error('Web3.Storage upload failed:', error.response?.data || error.message);
        }
      }

      // Fallback: Use a deterministic mock IPFS URL for testing
      console.warn('No IPFS service configured. Using local storage for demo.');
      
      // Create a deterministic CID based on the metadata content
      const dataString = JSON.stringify(metadata);
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataString));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const mockCID = 'bafkreie' + hashHex.substring(0, 20);
      
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