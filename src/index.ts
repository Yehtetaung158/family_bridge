// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import adminAuthRouter from './routes/auth';
import userAuthRouter from './routes/user';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/admin', adminAuthRouter);
app.use('/user', userAuthRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});