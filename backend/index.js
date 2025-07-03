// 1. Import Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 2. Initialize The App
const app = express();

// 3. Configure CORS (Cross-Origin Resource Sharing)
const allowedOrigins = ['https://tango-frontend-umber.vercel.app'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and requests that are from our Vercel frontend.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
// Use the CORS options for all routes
app.use(cors(corsOptions));

// 4. Configure Body Parser Middleware
// This is needed to understand JSON data sent in requests
app.use(express.json());
// --- DEBUG: Log all incoming request headers ---
app.use((req, res, next) => {
  console.log('--- New Request From a Browser ---');
  console.log('Time:', new Date().toISOString());
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  console.log('Request Path:', req.path);
  console.log('------------------------------------');
  next(); // This passes the request to the next handler
});
// ------------------------------------------

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