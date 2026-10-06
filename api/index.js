require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));

// Routes
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/products', require('../backend/routes/products'));
app.use('/api/orders', require('../backend/routes/orders'));
app.use('/api/offers', require('../backend/routes/offers'));
app.use('/api/admin', require('../backend/routes/admin'));

// Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/test', async (req, res) => {
    res.json({
        success: true,
        message: 'Smart Restaurant API is working on Vercel'
    });
});

// MongoDB connection
let cachedConnection = null;

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI environment variable is missing');
    }

    cachedConnection = await mongoose.connect(process.env.MONGO_URI);

    return cachedConnection;
}

module.exports = async (req, res) => {
    try {
        await connectDB();

        return app(req, res);
    } catch (error) {
        console.error('Vercel function error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
