import {Router} from 'express';
import { registerUser } from '../controllers/auth/user-auth.controller';
import { loginUser } from '../controllers/auth/user-auth.controller';  
const router = Router();

router.post('/user_register', registerUser);

router.post('/user_login', loginUser);

export default router;