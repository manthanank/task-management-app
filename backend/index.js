const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

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

app.get('', (req, res) => {
    res.send('API is running... <br><a href="/api-docs">View API Documentation</a>');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});