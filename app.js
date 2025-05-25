const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cluster = require('cluster');
const os = require('os');
const { User } = require("./models"); 

require("dotenv").config();

// Check if clustering should be enabled
const enableClustering = process.env.ENABLE_CLUSTERING === 'true';
const numCPUs = os.cpus().length;

// Use clustering in production for better performance
if (enableClustering && cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process or single-process mode
  const app = express();
  const port = process.env.PORT || 5000;

  // Set security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Enable CORS with preflight options
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight response for 24 hours
  }));

  // Compress all responses with aggressive settings
  app.use(compression({
    threshold: 0, // Compress all responses
    level: 6, // Compression level (1-9, 9 being highest)
    memLevel: 8, // Memory used for compression (1-9)
    strategy: 0, // Compression strategy
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Parse JSON with limits to prevent abuse
  app.use(bodyParser.json({
    limit: '1mb',
    strict: true
  }));

  // Set a strict timeout for all requests
  app.use((req, res, next) => {
    // 15 second timeout
    req.setTimeout(15000, () => {
      res.status(408).json({ error: 'Request timeout' });
    });
    next();
  });

  // Performance monitoring middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Once the response is finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 1000) { // Log if request takes more than 1 second
        console.log(`SLOW REQUEST [${duration}ms]: ${req.method} ${req.originalUrl}`);
      }
    });
    
    next();
  });

  // Apply routes
  authRoutes(app);
  studentRoutes(app);
  transactionRoutes(app);

  // Dummy route to query the database and keep it active
  app.get("/db-activity-check", async (req, res) => {
    try {
      const users = await User.findAll({ limit: 5, attributes: ['id', 'username'] }); // Fetch up to 5 users, only id and username

      if (!users || users.length === 0) {
        return res.json({ success: true, message: "Database connection successful, no users found or users table is empty.", data: [] });
      }

      return res.json({ success: true, message: "Database query successful.", data: users });
    } catch (error) {
      console.error("Error during database activity check:", error);
      const message = error.message || "An error occurred while querying the database.";
      return res.status(500).json({ success: false, error: message });
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Worker ${process.pid}: Server running on port ${port}`);
  });
}
