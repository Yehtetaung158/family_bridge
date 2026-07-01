// src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import adminAuthRouter from './routes/admin';
import userAuthRouter from './routes/user';
import transactionRouter from './routes/transaction';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/admin', adminAuthRouter);
app.use('/user', userAuthRouter);
app.use('/transaction', transactionRouter);
app.use('/admin/transaction', transactionRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});