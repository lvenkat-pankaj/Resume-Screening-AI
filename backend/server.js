// Resume Screening API Server

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const screenRoutes = require('./routes/api/screen');
const analyticsRoutes = require('./routes/api/analytics');

// Validate required environment variables
const validateEnvironment = () => {
  const errors = [];

  if (!process.env.HF_TOKEN) {
    errors.push('HF_TOKEN is required but not set in environment variables');
  }

  const port = process.env.PORT || 5000;
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a valid port number (1-65535), got: ${port}`);
  }

  const validEnvs = ['development', 'production', 'staging'];
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!validEnvs.includes(nodeEnv)) {
    console.warn(`Warning: NODE_ENV "${nodeEnv}" not recognized. Using "development"`);
  }

  if (errors.length > 0) {
    console.error('\n❌ CONFIGURATION ERRORS:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease fix the above errors and restart the server.\n');
    process.exit(1);
  }
};

validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for origin: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', screenRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Resume Screening AI - Backend Server     ║
╚════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
📝 POST http://localhost:${PORT}/api/screen
✅ Health check: http://localhost:${PORT}/api/health

Environment: ${NODE_ENV}
CORS Origins: ${allowedOrigins.join(', ')}

Waiting for requests...
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
