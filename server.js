const express = require('express');
const { pgPool, connectMongoDB } = require('./src/config/database');
const reviewRoutes = require('./src/routes/reviewRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const userRoutes = require('./src/routes/userRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use('/api/reviews', reviewRoutes)
app.use('/api/books', bookRoutes )
app.use('/api/users', userRoutes)
// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Library Management API is running!' });
});

// Start server and connect databases
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();