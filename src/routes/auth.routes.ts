import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { passwordResetLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  editProfileSchema,
} from '../lib/validation';

const router: Router = Router();

router.post('/auth/signup', validateBody(signUpSchema), authController.signUp);
router.post('/auth/signin', validateBody(signInSchema), authController.signIn);
router.post('/auth/signout', authenticate, authController.signOut);
router.post(
  '/auth/forgot-password',
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post('/auth/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
router.patch('/auth/profile', authenticate, validateBody(editProfileSchema), authController.editProfile);
router.get('/auth/me', authenticate, authController.me);

export default router;
