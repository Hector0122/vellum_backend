import { Router } from 'express';
import * as summariesController from '../controllers/summaries.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);
router.post('/:chapterIndex/summary', summariesController.getSummary);

export default router;
