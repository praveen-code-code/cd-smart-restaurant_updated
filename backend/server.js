require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/events', require('./events').handler);

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

['auth', 'products', 'orders', 'offers', 'admin'].forEach((r) => {
  app.use(
    '/api/' + r,
    require('./routes/' + r)
  );
});

app.use(
  express.static(path.join(__dirname, '../frontend'))
);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/smart-restaurant'
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB error:', error.message);
  });