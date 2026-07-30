import { Router } from 'express';
import * as highlightsController from '../controllers/highlights.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createHighlightSchema, updateHighlightSchema } from '../lib/validation';

const router: Router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', highlightsController.listHighlights);
router.post('/', validateBody(createHighlightSchema), highlightsController.createHighlight);
router.patch('/:highlightId', validateBody(updateHighlightSchema), highlightsController.updateHighlight);
router.delete('/:highlightId', highlightsController.deleteHighlight);

export default router;
