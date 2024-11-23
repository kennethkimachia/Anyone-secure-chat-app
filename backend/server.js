// server.js

const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // Ensure this matches the port in HiddenServicePort

// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/chat app/dist')));

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
