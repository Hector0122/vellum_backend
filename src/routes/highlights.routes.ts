import { Router } from 'express';
import * as highlightsController from '../controllers/highlights.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', highlightsController.listHighlights);
router.post('/', highlightsController.createHighlight);
router.delete('/:highlightId', highlightsController.deleteHighlight);

export default router;
