import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);
router.post('/session', statsController.createSession);
router.patch('/session/:sessionId', statsController.endSession);
router.get('/streak', statsController.getStreak);

export default router;
