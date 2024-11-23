import React, { useState } from 'react';
import { createDID } from '../sessions/didSession';

const SignUpPage = () => {
  const [useExistingDid, setUseExistingDid] = useState(false);
  const [did, setDid] = useState('');
  const [userDid, setUserDid] = useState(null);

  const handleSignUp = async (event) => {
    event.preventDefault();
  
    let newDid;
  
    if (useExistingDid) {
      newDid = did;
    } else {
      // Create a new DID
      const didInstance = await createDID();
      newDid = didInstance.id;
  
      // Optionally, store the DID instance or its seed securely on the client side
      localStorage.setItem('didSeed', JSON.stringify(didInstance._provider._key));
    }
  
    // Send the DID to the backend
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: newDid,
        createNew: !useExistingDid,
      }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      setUserDid(data.did);
      localStorage.setItem('userDid', data.did);
    } else {
      console.error('Signup error:', data.error);
    }
  };
  

  return (
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useExistingDid}
            onChange={() => setUseExistingDid(!useExistingDid)}
            className="mr-2"
          />
          I have an existing DID
        </label>
      </div>
      {useExistingDid && (
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
      )}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        {useExistingDid ? 'Sign Up with Existing DID' : 'Create New DID'}
      </button>
    </form>
    {userDid && (
      <div className="mt-4">
        <p>Your DID: {userDid}</p>
        {/* Provide further instructions or redirect to another page */}
      </div>
    )}
  </div>
  );
};

export default SignUpPage;
