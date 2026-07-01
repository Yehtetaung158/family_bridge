import { Router } from 'express';
import { adminProfile } from "../controllers/auth/admin.controller";
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.get('/profile', authenticateToken, authorizeRoles("ADMIN"), adminProfile);

export default router;