const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

if (!mongoUri) {
    console.error('Missing MongoDB connection string. Set MONGO_URI or MONGO_URL in .env.');
    process.exit(1);
}

const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);
app.get('/api/health', (req, res) => {
    res.json({ ok: true, database: mongoose.connection.readyState === 1 });
});

const getSafeMongoHost = (connectionString) => {
    try {
        if (connectionString.startsWith('mongodb://')) {
            return connectionString
                .replace(/^mongodb:\/\/[^@]+@/, '')
                .split('/')[0];
        }

        return new URL(connectionString).host;
    } catch (error) {
        return 'invalid-connection-string';
    }
};

const startServer = async () => {
    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB connected (${getSafeMongoHost(mongoUri)})`);
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error(`MongoDB connection failed (${getSafeMongoHost(mongoUri)})`);
        console.error(error.message);
        process.exit(1);
    }
};

startServer();
