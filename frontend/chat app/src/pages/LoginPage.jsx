import React, { useState } from 'react';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { DID } from 'dids';
import { getResolver } from 'key-did-resolver';

const LoginPage = () => {
  const [did, setDid] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
  
    // Fetch the challenge from the server
    const challengeResponse = await fetch('/challenge');
    const { challenge } = await challengeResponse.json();
  
    // Sign the challenge with the user's DID
    const seed = JSON.parse(localStorage.getItem('didSeed'));
    const provider = new Ed25519Provider(Uint8Array.from(seed));
    const didInstance = new DID({ provider, resolver: getResolver() });
    await didInstance.authenticate();
  
    const jws = await didInstance.createJWS({ challenge });
  
    // Send the DID and signature to the server
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ did: didInstance.id, signature: jws }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      console.log('Login successful');
      // Proceed with user session
    } else {
      console.error('Login error:', data.error);
    }
  };
  
  

  return (
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Login</h1>
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block mb-2">Enter your DID:</label>
        <input
          type="text"
          value={did}
          onChange={(e) => setDid(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  </div>
  );
};

export default LoginPage;
