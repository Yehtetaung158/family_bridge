// src/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'FamilyBridge Server is running smoothly!?' });
});

export default router;