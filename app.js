import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', router);

export default app;
