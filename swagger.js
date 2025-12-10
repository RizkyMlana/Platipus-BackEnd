import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Management API",
      version: "1.0.0",
      description: "API documentation for Event Management project",
    },
    servers: [
      {
        url: "https://platipus-back-end.vercel.app/", 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: [
    "./routes/authRoutes.js",
    "./routes/eventRoutes.js",
    "./routes/paymentRoutes.js",
    "./routes/proposalRoutes.js",
    "./routes/profileRoutes.js",
    "./routes/sponsorRoutes.js"
  ],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
