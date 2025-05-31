import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '../services/web3Service';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinter, setIsMinter] = useState(false);
  const [error, setError] = useState(null);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          await checkMinterRole(currentAccount);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsMinter(false);
    } else {
      setAccount(accounts[0]);
      await checkMinterRole(accounts[0]);
    }
  };

  const checkMinterRole = async (address) => {
    try {
      await web3Service.connectWallet(); // Ensure contract is initialized
      const minterRole = await web3Service.getMinterRole();
      const hasMinterRole = await web3Service.hasRole(minterRole, address);
      setIsMinter(hasMinterRole);
    } catch (err) {
      console.error('Error checking minter role:', err);
      setIsMinter(false);
    }
  };

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const connectedAccount = await web3Service.connectWallet();
      setAccount(connectedAccount);
      await checkMinterRole(connectedAccount);
      return connectedAccount;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsMinter(false);
  }, []);

  return {
    account,
    isConnecting,
    isMinter,
    error,
    connect,
    disconnect,
    isConnected: !!account,
  };
};