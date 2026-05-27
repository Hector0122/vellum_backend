import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.post(
  '/track',
  authenticate,
  apiLimiter,
  analyticsController.track,
);

export default router;
