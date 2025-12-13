import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/index.js';
import { swaggerUi, specs } from "./swagger.js";
dotenv.config();

const app = express();

app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
