// Test if static files are accessible
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/test', (req, res) => {
  res.json({ message: 'Static file server test' });
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
  console.log('Try: http://localhost:3002/uploads/0d8b12d5-b95d-4081-a62c-f93440972014/1765615241384-Encryption_Details.pdf');
});