// WalletConnectionPage.jsx

import React, { useState } from 'react';
import { ethers } from 'ethers';

const WalletConnectionPage = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature.');
      return;
    }

    setLoading(true);

    try {
      // Request account access
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Fetch challenge nonce from backend
      const challengeResponse = await fetch(`/challenge?address=${address}`);
      const { nonce } = await challengeResponse.json();

      // Sign the nonce
      const signature = await signer.signMessage(nonce);

      // Send the signature and address to the backend for verification
      const response = await fetch('/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature }),
      });

      const data = await response.json();

      if (response.ok) {
        // Authentication successful
        // Store the hashed DID in localStorage if needed
        localStorage.setItem('hashedDid', data.hashedDid);
        // Redirect to ProfilePage or update the UI accordingly
        window.location.href = '/profile';
      } else {
        console.error('Verification error:', data.error);
        alert('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('An error occurred while connecting your wallet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connect Your MetaMask Wallet</h1>
      <button
        onClick={handleConnectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {walletAddress && <p className="mt-4">Connected wallet: {walletAddress}</p>}
    </div>
  );
};

export default WalletConnectionPage;
