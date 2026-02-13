require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== API ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lots', require('./routes/lots'));
app.use('/api/categories', require('./routes/categories'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SNEAKRZ API v2.0',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
});

// ===== SPA FALLBACK =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== ERROR HANDLING =====
app.use(errorHandler);

// ===== SERVER START =====
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`\nPort: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: Connected\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\nSIGTERM received - shutting down gracefully...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('Server initialization failed:', error.message);
    process.exit(1);
  }
};

startServer();

// Unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});