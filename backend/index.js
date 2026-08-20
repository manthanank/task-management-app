const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Set trust proxy for reverse proxies (e.g. Vercel)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); 
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { status: 'error', message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: 'error', message: 'Too many auth requests from this IP, please try again after 15 minutes' }
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Task Management API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger documentation options
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { background-color: #24292e; } .swagger-ui .topbar .download-url-wrapper .select-label select { border: 2px solid #4caf50; } .swagger-ui .info .title { color: #333; } .swagger-ui .scheme-container { background-color: #f5f5f5; }',
  customSiteTitle: 'Task Management API Documentation',
  customfavIcon: '/favicon.ico',
  explorer: true,
};

// Swagger documentation route
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, swaggerOptions));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/organizations', require('./routes/organization.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

app.get('/', (req, res) => {
  res.send('API is running... <br><a href="/api-docs">View API Documentation</a>');
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server if run directly
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Export for serverless environments (Vercel)
module.exports = app;