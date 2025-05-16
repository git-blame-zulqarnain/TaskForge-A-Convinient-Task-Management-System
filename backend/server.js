// Core and utility imports
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./src/config/db'); 
const taskRoutes = require('./src/routes/taskRoutes'); 
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

dotenv.config();
connectDB();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// --- Routes ---
// Simple test route
app.get('/', (req, res) => {
    res.send("API running");
});

// Mount task routes
app.use('/api/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    // Using template literal correctly for multi-line or cleaner output
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} port ${PORT}`);
});