import { Router } from 'express';
import { registerUser } from '../controllers/auth/auth.controller';
import { loginUser } from '../controllers/auth/auth.controller';
import { getAllUsers, userProfile } from '../controllers/auth/user.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.post('/user_register', registerUser);
router.post('/user_login', loginUser);
router.get('/user_profile', authenticateToken, userProfile);
router.get('/get_all_users', authenticateToken, authorizeRoles("ADMIN"), getAllUsers);

export default router;