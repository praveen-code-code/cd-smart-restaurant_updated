const mongoose = require('mongoose');
const app = require('../backend/app');

let cached = global._mongooseConnection;

async function connectDB() {
  if (cached) {
    return cached;
  }

  cached = mongoose.connect(process.env.MONGO_URI);

  global._mongooseConnection = cached;

  return cached;
}

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};