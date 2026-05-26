import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.post('/auth/signup', authController.signUp);
router.post('/auth/signin', authController.signIn);
router.post('/auth/signout', authenticate, authController.signOut);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', authenticate, authController.me);

export default router;
