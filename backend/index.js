// 1. Import Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 2. Initialize The App
const app = express();

// 3. Configure CORS (Cross-Origin Resource Sharing)
// This simpler, single line is more compatible and allows all origins.
app.use(cors());

// 4. Configure Body Parser Middleware
// This is needed to understand JSON data sent in requests
app.use(express.json());

// 5. Define API Routes
const tandaRoutes = require('./routes/tandas');
app.use('/api/tandas', tandaRoutes);

// A simple health-check route to confirm the server is running
app.get('/', (req, res) => {
  res.status(200).send('Backend is alive and kicking!');
});

// 6. Start The Server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});