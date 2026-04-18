import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Partner Onboarding API',
      version: '1.0.0',
      description: 'Dokumentasi interaktif REST API untuk Sistem Partner Team Onboarding PT. Alita Praya Mitra.',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'], // Path to your API routes
};

export const getApiDocs = async () => {
  const spec = swaggerJsdoc(options);
  return spec;
};
