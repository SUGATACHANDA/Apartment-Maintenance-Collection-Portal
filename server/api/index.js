require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('../routes/auth');
const paymentRoutes = require('../routes/payment');
const adminRoutes = require('../routes/admin');


const cors = require('cors');
// Allow specific origin
const corsOptions = {
    origin: 'https://adyamandirapartment.vercel.app', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Include 'token' header if used
    credentials: true, // Allow cookies if needed
};

const app = express();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://adyamandirapartment.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
    if (req.method === "OPTIONS") {
        res.sendStatus(204); // Respond to preflight requests
    } else {
        next();
    }
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get("/", (req, res) => {
    res.send("Apartment Backend Started");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));