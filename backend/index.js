console.log('🛠️ Starting backend...');

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
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
  optionsSuccessStatus: 200 // For legacy browser support
};

// This enables pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Use the cors middleware for all other requests
app.use(cors(corsOptions));

const port = 3100;

app.use(cors());
// app.use(express.json()); // <-- Comment out or remove this line

app.use('/api/tandas', require('./routes/tandas'));

app.get('/', (req, res) => {
    console.log('📥 GET / hit');
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('🎉 Backend is working!');
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});