const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY;
const API_SECRET = process.env.API_SECRET;

// Auth middleware
app.use((req, res, next) => {
  const auth = req.headers['x-api-secret'];
  if (auth !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Get USDT deposits
app.get('/deposits', async (req, res) => {
  try {
    const timestamp = Date.now();
    const queryString = `coin=USDT&timestamp=${timestamp}&recvWindow=5000`;
    const signature = crypto
      .createHmac('sha256', BINANCE_SECRET_KEY)
      .update(queryString)
      .digest('hex');

    const response = await fetch(
      `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${queryString}&signature=${signature}`,
      { headers: { 'X-MBX-APIKEY': BINANCE_API_KEY } }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Binance proxy running on :${PORT}`));
