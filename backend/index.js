console.log('🛠️ Starting backend...');

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
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