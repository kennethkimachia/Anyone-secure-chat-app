import express from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import { randomBytes } from 'crypto'; 
import { ethers } from 'ethers';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000; // Ensure this matches the port in HiddenServicePort

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/chat app/dist')));


let db;

// Connect to MongoDB
MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(process.env.DATABASE_NAME);
    console.log('Connected to MongoDB');
  })
  .catch((error) => console.error('MongoDB connection error:', error));


  // In-memory store for nonces
const nonces = new Map();

// Generate challenge nonce
app.get('/challenge', (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }
  const nonce = 'Please sign this message to authenticate: ' + randomBytes(16).toString('hex');
  nonces.set(address.toLowerCase(), nonce);
  res.json({ nonce });
});

// Verify signature and handle DIDs
app.post('/verify', async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature are required' });
    }

    const nonce = nonces.get(address.toLowerCase());
    if (!nonce) {
      return res.status(400).json({ error: 'No nonce found for this address' });
    }

    // Recover the signer address from the signature
    const msgHash = ethers.utils.hashMessage(nonce);
    const msgBytes = ethers.utils.arrayify(msgHash);
    const recoveredAddress = ethers.utils.recoverAddress(msgBytes, signature);

    // Verify that the recovered address matches the provided address
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    // Remove the used nonce
    nonces.delete(address.toLowerCase());

    // The rest of your code remains the same...

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API route example
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});


// Catch-all handler to serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/chat app/dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
