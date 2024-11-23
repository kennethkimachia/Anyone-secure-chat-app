// WalletConnectionPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';

const WalletConnectionPage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const onboarding = useRef(null);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      setIsMetaMaskInstalled(true);
    } else {
      setIsMetaMaskInstalled(false);
    }
    onboarding.current = new MetaMaskOnboarding();
  }, []);

  const handleConnectWallet = async () => {
    if (isMetaMaskInstalled) {
      try {
        const { ethereum } = window;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
  
        // Fetch challenge nonce from backend
        const challengeResponse = await fetch(`/challenge?address=${address}`);
        const { nonce } = await challengeResponse.json();
  
        // Sign the nonce
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [nonce, address],
        });
  
        // Send the signature and address to the backend for verification
        const response = await fetch('/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, signature }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Authentication successful
          localStorage.setItem('hashedDid', data.hashedDid);
          window.location.href = '/profile';
        } else {
          console.error('Verification error:', data.error);
          alert('Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('An error occurred while connecting to MetaMask.');
      }
    } else {
      // Start the MetaMask onboarding process
      onboarding.current.startOnboarding();
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connect Your MetaMask Wallet</h1>
      <button
        onClick={handleConnectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}
      </button>
      {walletAddress && <p className="mt-4">Connected wallet: {walletAddress}</p>}
    </div>
  );
};

export default WalletConnectionPage;
