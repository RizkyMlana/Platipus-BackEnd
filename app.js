import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/index.js';
import { specs } from "./swagger.js";
import swaggerUi from 'swagger-ui-express';
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
console.log(JSON.stringify(specs, null, 2));

export default app;
