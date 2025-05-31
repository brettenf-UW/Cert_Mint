// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CourseCertificate is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;
    
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string tokenURI
    );
    
    constructor() ERC721("LinkedIn Proof Certificate", "CERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Start token IDs at 1
        _nextTokenId = 1;
    }
    
    function issueCertificate(address to, string memory tokenURI) 
        external 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        uint256 tokenId = _nextTokenId++;  
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit CertificateIssued(tokenId, to, msg.sender, tokenURI);
        
        return tokenId;
    }
    
    function getCurrentTokenId() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}