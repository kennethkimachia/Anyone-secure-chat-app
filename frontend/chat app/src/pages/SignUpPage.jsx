import React, { useState } from 'react';

function SignupPage() {
    const [status, setStatus] = useState("Not connected");
    const [profile, setProfile] = useState(null);

    async function connectWallet() {
        try {
            if (!window.ethereum) {
                setStatus("MetaMask not installed");
                return;
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const walletAddress = accounts[0];
            setStatus("Wallet connected: " + walletAddress);

            // Verify wallet or create new user
            const response = await fetch("https://example.com/auth/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ walletAddress }),
            });

            const data = await response.json();

            if (data.newUser) {
                // Redirect to profile setup page
                window.location.href = "/profile-setup";
            } else {
                // Load user profile
                setProfile(data.profile);
            }
        } catch (error) {
            setStatus("Error connecting wallet: " + error.message);
        }
    }

    return (
        <div>
            <h1>Connect Your Wallet</h1>
            <button onClick={connectWallet}>Connect Wallet</button>
            <p>{status}</p>
            {profile && <div>Welcome back, {profile.username}!</div>}
        </div>
    );
}

export default SignupPage;
