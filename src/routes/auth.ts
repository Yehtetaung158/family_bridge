import { Router } from 'express';
import { loginAdmin } from '../controllers/auth/admin-auth';
const router = Router();

router.post('/admin_login', loginAdmin);

export default router;