import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Platipus",
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
    path.join(process.cwd(), "routes/authRoutes.js"),
    path.join(process.cwd(), "routes/eventRoutes.js"),
    path.join(process.cwd(), "routes/paymentRoutes.js"),
    path.join(process.cwd(), "routes/proposalRoutes.js"),
    path.join(process.cwd(), "routes/profileRoutes.js"),
    path.join(process.cwd(), "routes/sponsorRoutes.js"),
  ],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
