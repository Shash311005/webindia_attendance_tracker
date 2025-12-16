const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Engineer Productivity & Attendance Tracker API',
    version: '0.1.0',
    description: 'API for authentication, uploads, and reporting for the Engineer Productivity & Attendance Tracker'
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local dev server' }
  ]
};

const options = {
  swaggerDefinition,
  apis: [__filename.replace('swagger.js', 'routes/*.js')]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
