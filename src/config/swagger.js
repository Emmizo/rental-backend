const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rental Property API',
      version: '1.0.0',
      description: 'API documentation for the Rental Property System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        googleAuth: {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: '/auth/google',
              scopes: {
                'profile': 'Access user profile',
                'email': 'Access user email'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to route files
};

const specs = swaggerJsdoc(options);
module.exports = specs;