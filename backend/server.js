// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./src/config/db');
const taskRoutes = require('./src/routes/taskRoutes');
const userRoutes = require('./src/routes/userRoutes'); 
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes); 

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});