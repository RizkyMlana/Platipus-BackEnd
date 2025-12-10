import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Platipus",
      version: "1.0.0",
      description: "API documentation for Event Management project",
    },
    servers: [
      { url: "https://platipus-back-end.vercel.app/" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "./routes/*.js")], // path absolut
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
