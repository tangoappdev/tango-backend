console.log('🛠️ Starting backend...');

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// --- Robust CORS Configuration (This part is correct) ---
const allowedOrigins = ['https://tango-frontend-umber.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // On mobile, the origin can sometimes be null.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.options('*', cors(corsOptions)); // This handles pre-flight requests
app.use(cors(corsOptions)); // This handles all other requests
// ------------------------------------

// --- Middlewares ---
// This line is VERY important and has been enabled.
app.use(express.json());
// The extra app.use(cors()) line has been removed.
// -----------------

// --- Routes ---
// app.use('/api/tandas', require('./routes/tandas'));
app.get('/', (req, res) => {
    console.log('📥 GET / hit');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('🎉 Backend is working!');
});
// ------------

// --- Server Listen ---
// This uses the port Render provides, and falls back to 3100 for local development.
const port = process.env.PORT || 3100;

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});