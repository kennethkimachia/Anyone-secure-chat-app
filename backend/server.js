import express from 'express';
import path from 'path';
import { createDID } from './ceramicAuth.js'; // Import the DID creation function
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

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

// API route example
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { did: existingDid, createNew } = req.body;

    let userDid;

    if (createNew) {
      // Create a new DID
      const did = await createDID();
      userDid = did.id;
    } else if (existingDid) {
      // Use the provided DID
      userDid = existingDid;
    } else {
      return res.status(400).json({ error: 'No DID provided' });
    }

    // Store the user's DID in MongoDB
    const usersCollection = db.collection('users');

    // Check if the DID already exists
    const userExists = await usersCollection.findOne({ did: userDid });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    await usersCollection.insertOne({ did: userDid });

    res.json({ did: userDid });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { did } = req.body;

    // Retrieve the user from the database
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ did });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // For simplicity, we'll consider the user authenticated
    // Implement proper authentication mechanisms as needed

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all handler to serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/chat app/dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
