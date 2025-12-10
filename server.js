import app from './app.js';
import './src/db/index.js';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('Server Running '));
console.log(path.join(process.cwd(), "routes/authRoutes.js"));
